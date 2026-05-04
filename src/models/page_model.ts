import mongoose, { Model, Schema, Types } from "mongoose";
import WorkspaceModel from "./workspace_model";

type ObjectId = Types.ObjectId;

export default interface Page {
  title: string;
  workspace: ObjectId;
  createdBy: ObjectId;
  blocks: ObjectId[];
  contentHtml: string;
  contentText: string;
  isShared: boolean;
  currentVersion: number;
  createdAt: Date;
  lastUpdate: Date;
}

const PageSchema = new Schema<Page>({
  title: { type: String, required: true, default: "Untitled page" },
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  blocks: [{ type: Schema.Types.ObjectId, ref: "Block" }],
  contentHtml: { type: String, default: "" },
  contentText: { type: String, default: "" },
  isShared: { type: Boolean, default: false },
  currentVersion: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  lastUpdate: { type: Date, default: Date.now },
});

const PageModel: Model<Page> =
  mongoose.models.Page || mongoose.model<Page>("Page", PageSchema);

function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveTitleFromContent(title: string, contentText: string): string {
  const cleanedTitle = title.trim();

  if (cleanedTitle && cleanedTitle.toLowerCase() !== "untitled page") {
    return cleanedTitle.slice(0, 80);
  }

  const firstSentence = contentText.split(/[.!?\n]/)[0]?.trim();

  if (!firstSentence) {
    return "Untitled page";
  }

  const weakEndingWords = new Set([
    "are",
    "is",
    "was",
    "were",
    "and",
    "or",
    "the",
    "a",
    "an",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
  ]);

  const words = firstSentence.split(/\s+/).slice(0, 7);

  while (
    words.length > 3 &&
    weakEndingWords.has(words[words.length - 1].toLowerCase())
  ) {
    words.pop();
  }

  return words.join(" ") || "Untitled page";
}

export async function getPage(pageId: string): Promise<Page | null> {
  return PageModel.findById(pageId);
}

export async function getPagesByUserWorkspaces(
  userId: string,
): Promise<Page[]> {
  const userObjectId = new Types.ObjectId(userId);
  const userWorkspaces = await WorkspaceModel.find(
    { $or: [{ owner: userObjectId }, { "members.user": userObjectId }] },
    { _id: 1 },
  );
  const workspaceIds = userWorkspaces.map((w) => w._id);
  return PageModel.find({ workspace: { $in: workspaceIds } }).sort({
    lastUpdate: -1,
  });
}

export async function isPageAccessibleByUser(
  pageId: string,
  userId: string,
): Promise<boolean> {
  const page = await PageModel.findById(pageId, { workspace: 1 });

  if (!page) return false;

  const userObjectId = new Types.ObjectId(userId);

  const workspace = await WorkspaceModel.findOne({
    _id: page.workspace,
    $or: [{ owner: userObjectId }, { "members.user": userObjectId }],
  });

  return workspace !== null;
}

export async function getOrCreatePersonalWorkspace(
  userId: string,
): Promise<ObjectId> {
  const userObjectId = new Types.ObjectId(userId);

  let workspace = await WorkspaceModel.findOne({
    owner: userObjectId,
    name: "Personal Workspace",
  });

  if (!workspace) {
    workspace = await WorkspaceModel.create({
      name: "Personal Workspace",
      owner: userObjectId,
      members: [{ user: userObjectId, permission: "owner" }],
      createdAt: new Date(),
      lastUpdated: new Date(),
    });
  }

  return workspace._id as ObjectId;
}

export async function getAllPages(): Promise<Page[]> {
  return PageModel.find();
}

export async function createPage(
  page: Partial<Page>,
  userId: string,
): Promise<Page> {
  const contentHtml = page.contentHtml || "";
  const contentText = htmlToPlainText(contentHtml);
  const title = deriveTitleFromContent(page.title || "Untitled page", contentText);

  const workspace =
    page.workspace || (await getOrCreatePersonalWorkspace(userId));

  return PageModel.create({
    title,
    workspace,
    createdBy: new Types.ObjectId(userId),
    blocks: page.blocks || [],
    contentHtml,
    contentText,
    isShared: page.isShared || false,
    currentVersion: page.currentVersion || 1,
    createdAt: new Date(),
    lastUpdate: new Date(),
  });
}

export async function updatePage(
  pageId: string,
  page: Partial<Page>,
): Promise<Page | null> {
  const contentHtml = page.contentHtml || "";
  const contentText = htmlToPlainText(contentHtml);
  const title = deriveTitleFromContent(page.title || "Untitled page", contentText);

  return PageModel.findByIdAndUpdate(
    pageId,
    {
      ...page,
      title,
      contentHtml,
      contentText,
      lastUpdate: new Date(),
    },
    { returnDocument: "after" },
  );
}

export async function deletePage(pageId: string): Promise<void> {
  await PageModel.findByIdAndDelete(pageId);
}
