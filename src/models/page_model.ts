import mongoose, { Model, Schema, Types } from "mongoose";
import WorkspaceModel from "./workspace_model";

type ObjectId = Types.ObjectId;

export interface Page {
  title: string;
  icon: string;
  content: string;
  contentHtml: string;
  contentText: string;
  workspaceId: ObjectId | null;
  parentId: ObjectId | null;
  isFavorite: boolean;
  isShared: boolean;
  currentVersion: number;
  createdBy: ObjectId;
  updatedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<Page>({
  title: { type: String, required: true },
  icon: { type: String, default: '📄' },
  content: { type: String, default: '' },
  contentHtml: { type: String, default: '' },
  contentText: { type: String, default: '' },
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null },
  parentId: { type: Schema.Types.ObjectId, ref: 'Page', default: null },
  isFavorite: { type: Boolean, default: false },
  isShared: { type: Boolean, default: false },
  currentVersion: { type: Number, default: 1 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for better performance
PageSchema.index({ workspaceId: 1, createdAt: -1 });
PageSchema.index({ createdBy: 1 });
PageSchema.index({ updatedAt: -1 });

const PageModel = mongoose.model<Page>('Page', PageSchema);

// CRUD operations
export async function createPage(page: Omit<Page, '_id' | 'createdAt' | 'updatedAt'>): Promise<Page> {
  const newPage = new PageModel(page);
  return await newPage.save();
}

export async function getPage(pageId: string): Promise<Page | null> {
  return await PageModel.findById(pageId);
}

export async function getPagesByWorkspace(workspaceId: string): Promise<Page[]> {
  return await PageModel.find({ workspaceId }).sort({ updatedAt: -1 });
}

export async function updatePage(pageId: string, updates: Partial<Page>): Promise<Page | null> {
  return await PageModel.findByIdAndUpdate(pageId, updates, { new: true });
}

export async function deletePage(pageId: string): Promise<boolean> {
  const result = await PageModel.findByIdAndDelete(pageId);
  return !!result;
}

// Access control functions
export async function canUserAccessPage(pageId: string, userId: string): Promise<boolean> {
  const page = await PageModel.findById(pageId).populate('workspaceId');
  if (!page) return false;
  
  const workspace = page.workspaceId as any;
  return workspace.owner.toString() === userId || 
         workspace.members.some((member: any) => member.user.toString() === userId);
}

export async function canUserEditPage(pageId: string, userId: string): Promise<boolean> {
  const page = await PageModel.findById(pageId).populate('workspaceId');
  if (!page) return false;
  
  const workspace = page.workspaceId as any;
  const userRole = workspace.members.find((member: any) => member.user.toString() === userId)?.role;
  
  return workspace.owner.toString() === userId || 
         ['owner', 'admin', 'editor'].includes(userRole);
}

export async function getPagesByUser(userId: string): Promise<Page[]> {
  return await PageModel.find({ 
    createdBy: userId,
    // Include both personal pages (workspaceId: null) and workspace pages
  }).sort({ updatedAt: -1 });
}

export async function isPageAccessibleByUser(pageId: string, userId: string): Promise<boolean> {
  return await canUserAccessPage(pageId, userId);
}

export default PageModel;
