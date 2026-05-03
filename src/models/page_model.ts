import mongoose, { Model, Schema, Types } from "mongoose";
import WorkspaceModel from "./workspace_model";

type ObjectId = Types.ObjectId;

export default interface Page {
  title: string;
  workspace: ObjectId;
  createdBy: ObjectId;
  blocks: ObjectId[];
  isShared: boolean;
  currentVersion: number;
  createdAt: Date;
  lastUpdate: Date;
}

const PageSchema = new Schema<Page>({
  title: { type: String, required: true },
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  blocks: [{ type: Schema.Types.ObjectId, ref: "Block" }],
  isShared: { type: Boolean, default: false },
  currentVersion: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  lastUpdate: { type: Date, default: Date.now },
});

const PageModel: Model<Page> = mongoose.model<Page>("Page", PageSchema);

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
  return PageModel.find({ workspace: { $in: workspaceIds } });
}

export async function isPageOwnedByUser(
  pageId: string,
  userId: string,
): Promise<boolean> {
  const page = await PageModel.findById(pageId, { workspace: 1 });
  if (!page) return false;
  const workspace = await WorkspaceModel.findOne({
    _id: page.workspace,
    owner: new Types.ObjectId(userId),
  });
  return workspace !== null;
}

export async function getAllPages(): Promise<Page[]> {
  return PageModel.find();
}

export async function createPage(page: Page): Promise<Page> {
  return PageModel.create(page);
}

export async function updatePage(
  pageId: string,
  page: Partial<Page>,
): Promise<void> {
  await PageModel.findByIdAndUpdate(pageId, page);
}

export async function deletePage(pageId: string): Promise<void> {
  await PageModel.findByIdAndDelete(pageId);
}
