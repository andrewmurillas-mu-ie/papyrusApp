import mongoose, { Model, Schema, Types } from "mongoose";
import WorkspaceModel from "./workspace_model";

type ObjectId = Types.ObjectId;

export default interface Page {
  title: string;
  icon: string;
  content: string;
  workspaceId: ObjectId;
  parentId: ObjectId | null;
  isFavorite: boolean;
  createdBy: ObjectId;
  updatedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<Page>({
  title: { type: String, required: true },
  icon: { type: String, default: '📄' },
  content: { type: String, default: '' },
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Page", default: null },
  isFavorite: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PageModel: Model<Page> = mongoose.model<Page>("Page", PageSchema);

export async function getPage(pageId: string): Promise<Page | null> {
  return PageModel.findById(pageId);
}

export async function getPagesByWorkspace(
  workspaceId: string,
): Promise<Page[]> {
  const workspaceObjectId = new Types.ObjectId(workspaceId);
  return PageModel.find({ workspaceId: workspaceObjectId }).sort({ updatedAt: -1 });
}

export async function isPageOwnedByUser(
  pageId: string,
  userId: string,
): Promise<boolean> {
  const page = await PageModel.findById(pageId, { createdBy: 1 });
  if (!page) return false;
  return page.createdBy.toString() === userId;
}

export async function getAllPages(): Promise<Page[]> {
  return PageModel.find();
}

export async function canUserAccessPage(
  pageId: string,
  userId: string
): Promise<boolean> {
  const page = await PageModel.findById(pageId).populate('workspaceId');
  if (!page) return false;
  
  // Check if user can access the workspace
  const workspace = page.workspaceId as any;
  const userRole = await workspace.members.find(
    (member: any) => member.user.toString() === userId
  );
  return !!userRole || workspace.owner.toString() === userId;
}

export async function canUserEditPage(
  pageId: string,
  userId: string
): Promise<boolean> {
  const page = await PageModel.findById(pageId).populate('workspaceId');
  if (!page) return false;
  
  // Check if user can edit the workspace
  const workspace = page.workspaceId as any;
  const userRole = workspace.members.find(
    (member: any) => member.user.toString() === userId
  );
  const role = userRole?.role;
  return role === "owner" || role === "admin" || role === "editor";
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
