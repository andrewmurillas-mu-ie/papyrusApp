import { Request, Response } from "express";
import { Types } from "mongoose";
import Page, {
  createPage,
  deletePage,
  getPage,
  getPagesByWorkspace,
  updatePage,
  canUserAccessPage,
  canUserEditPage,
  isPageAccessibleByUser,
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
  
  // Check if user has access to workspace
  const canAccess = await canUserAccessPage(workspaceId, userId);
  if (!canAccess) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  const pages = await getPagesByWorkspace(workspaceId);
  res.json(pages);
}

export async function requestPage(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;

  const accessible: boolean = await isPageAccessibleByUser(pageId, userId);

  if (!accessible) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const page = await getPage(pageId);
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
  const page = {
    title: pageData.title || 'Untitled',
    icon: pageData.icon || '📄',
    content: pageData.content || '',
    contentHtml: pageData.contentHtml || '',
    contentText: pageData.contentText || '',
    workspaceId: new Types.ObjectId(pageData.workspaceId),
    parentId: pageData.parentId ? new Types.ObjectId(pageData.parentId) : null,
    isFavorite: pageData.isFavorite || false,
    isShared: pageData.isShared || false,
    currentVersion: pageData.currentVersion || 1,
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
  const updates = req.body;

  // Check if user can edit this page
  const canEdit = await canUserEditPage(pageId, userId);
  if (!canEdit) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updatedPage = {
    ...updates,
    updatedBy: new Types.ObjectId(userId),
    updatedAt: new Date(),
  };

  const page = await updatePage(pageId, updatedPage);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }

  res.json(page);
}

export async function requestDeletePage(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;

  // Check if user can delete this page (same permissions as edit)
  const canEdit = await canUserEditPage(pageId, userId);
  if (!canEdit) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await deletePage(pageId);
  res.status(204).send();
}

// AI-specific endpoints
export async function requestSearchPages(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const query = req.query.q as string;
  
  if (!query) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  // This would integrate with AI search service
  // For now, return basic text search
  const workspaceId = req.query.workspaceId as string;
  if (workspaceId) {
    const pages = await getPagesByWorkspace(workspaceId);
    const filteredPages = pages.filter(page => 
      page.title.toLowerCase().includes(query.toLowerCase()) ||
      page.contentText.toLowerCase().includes(query.toLowerCase())
    );
    res.json(filteredPages);
  } else {
    res.status(400).json({ error: "Workspace ID is required for search" });
  }
}

export async function requestGetPageSummary(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;

  const accessible = await isPageAccessibleByUser(pageId, userId);
  if (!accessible) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const page = await getPage(pageId);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }

  // This would integrate with AI summarization service
  // For now, return basic summary
  const summary = {
    title: page.title,
    wordCount: page.contentText.split(/\s+/).length,
    characterCount: page.contentText.length,
    lastModified: page.updatedAt,
  };

  res.json(summary);
}
