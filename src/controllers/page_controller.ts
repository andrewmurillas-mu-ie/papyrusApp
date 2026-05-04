import { Request, Response } from "express";
import { Types } from "mongoose";
import Page, {
  createPage,
  deletePage,
  getPage,
  getPagesByWorkspace,
  isPageOwnedByUser,
  updatePage,
  canUserAccessPage,
  canUserEditPage,
} from "../models/page_model";

export async function requestAllPages(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.query.workspaceId as string;
  
  if (!workspaceId) {
    res.status(400).json({ error: "Workspace ID is required" });
    return;
  }
  
  const pages: Page[] = await getPagesByWorkspace(workspaceId);
  res.json(pages);
}

export async function requestPage(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;
  
  const canAccess = await canUserAccessPage(pageId, userId);
  if (!canAccess) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  const page: Page | null = await getPage(pageId);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  
  res.json(page);
}

export async function requestCreatePage(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageData = req.body;
  
  if (!pageData.workspaceId) {
    res.status(400).json({ error: "Workspace ID is required" });
    return;
  }
  
  // Check if user can create pages in this workspace
  const canEdit = await canUserEditPage(pageData.workspaceId, userId);
  if (!canEdit) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  // Create workspace-aware page
  const page: Page = {
    title: pageData.title || 'Untitled',
    icon: pageData.icon || '📄',
    content: pageData.content || '',
    workspaceId: new Types.ObjectId(pageData.workspaceId),
    parentId: pageData.parentId ? new Types.ObjectId(pageData.parentId) : null,
    isFavorite: pageData.isFavorite || false,
    createdBy: new Types.ObjectId(userId),
    updatedBy: new Types.ObjectId(userId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const createdPage = await createPage(page);
  res.status(201).json(createdPage);
}

export async function requestUpdatePage(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;
  
  // Check if user can edit this page
  const canEdit = await canUserEditPage(pageId, userId);
  if (!canEdit) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  // Update page with workspace-aware fields
  const updateData = {
    ...req.body,
    updatedBy: new Types.ObjectId(userId),
    updatedAt: new Date(),
  };
  
  await updatePage(pageId, updateData);
  res.json(updateData);
}

export async function requestDeletePage(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;
  
  // Check if user can edit this page (edit permission required for delete)
  const canEdit = await canUserEditPage(pageId, userId);
  if (!canEdit) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  await deletePage(pageId);
  res.status(204).end();
}
