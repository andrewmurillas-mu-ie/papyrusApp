import { Request, Response } from "express";
import { Types } from "mongoose";
import {
  createPage,
  deletePage,
  getPage,
  getPagesByWorkspace,
  updatePage,
  canUserAccessPage,
  canUserEditPage,
  isPageAccessibleByUser,
} from "../models/page_model";
import { canUserAccessWorkspace, canUserEditWorkspace } from "../models/workspace_model";
import { createVersionForPage } from "../utils/pageVersionUtils";

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
  const canAccess = await canUserAccessWorkspace(workspaceId, userId);
  if (!canAccess) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  try {
    const pages = await getPagesByWorkspace(workspaceId);
    // Transform _id to id for frontend compatibility
    const transformedPages = pages.map(page => ({
      ...page,
      id: (page as any)._id.toString(),
      workspaceId: page.workspaceId?.toString() || null,
      parentId: page.parentId?.toString() || null,
      createdBy: page.createdBy.toString(),
      updatedBy: page.updatedBy.toString(),
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    }));
    res.json(transformedPages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
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

  // Transform _id to id for frontend compatibility
  const transformedPage = {
    ...page,
    id: (page as any)._id.toString(),
    workspaceId: page.workspaceId?.toString() || null,
    parentId: page.parentId?.toString() || null,
    createdBy: page.createdBy.toString(),
    updatedBy: page.updatedBy.toString(),
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  };

  res.json(transformedPage);
}

export async function requestCreatePage(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageData = req.body;
  
  console.log(`📝 Creating page for user ${userId}:`, pageData);
  
  // Support both personal pages (no workspace) and workspace pages
  let workspaceId = null;
  if (pageData.workspaceId) {
    // Check if user can create pages in this workspace
    const canEdit = await canUserEditWorkspace(pageData.workspaceId, userId);
    if (!canEdit) {
      console.log(`❌ User ${userId} cannot create pages in workspace ${pageData.workspaceId}`);
      res.status(403).json({ error: "Forbidden - no workspace edit permission" });
      return;
    }
    workspaceId = new Types.ObjectId(pageData.workspaceId);
  }
  
  // Create page (personal or workspace-based)
  const page = {
    title: pageData.title || 'Untitled',
    icon: pageData.icon || '📄',
    content: pageData.content || '',
    contentHtml: pageData.contentHtml || '',
    contentText: pageData.contentText || '',
    workspaceId: workspaceId,
    parentId: pageData.parentId ? new Types.ObjectId(pageData.parentId) : null,
    isFavorite: pageData.isFavorite || false,
    isShared: pageData.isShared || false,
    currentVersion: pageData.currentVersion || 1,
    createdBy: new Types.ObjectId(userId),
    updatedBy: new Types.ObjectId(userId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  console.log(`🔄 Creating page in MongoDB:`, {
    title: page.title,
    workspaceId: page.workspaceId,
    isPersonal: !page.workspaceId
  });
  
  try {
    const createdPage = await createPage(page);
    console.log(`✅ Page created successfully:`, {
      id: (createdPage as any)._id,
      title: createdPage.title,
      isPersonal: !createdPage.workspaceId
    });
    
    // Transform _id to id for frontend compatibility
    const transformedPage = {
      ...createdPage,
      id: (createdPage as any)._id.toString(),
      workspaceId: createdPage.workspaceId?.toString() || null,
      parentId: createdPage.parentId?.toString() || null,
      createdBy: createdPage.createdBy.toString(),
      updatedBy: createdPage.updatedBy.toString(),
      createdAt: createdPage.createdAt.toISOString(),
      updatedAt: createdPage.updatedAt.toISOString(),
    };
    
    res.status(201).json(transformedPage);
  } catch (error) {
    console.error(`❌ Failed to create page:`, error);
    res.status(500).json({ 
      error: "Failed to create page",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function requestUpdatePage(
  req: Request,
  res: Response,
): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.id as string;
  const updates = req.body;

  console.log(`📝 Updating page ${pageId} by user ${userId}`);
  console.log(`📤 Request body:`, updates);

  try {
    // Check if user can edit this page
    const canEdit = await canUserEditPage(pageId, userId);
    if (!canEdit) {
      console.log(`❌ User ${userId} does not have permission to edit page ${pageId}`);
      res.status(403).json({ error: "Forbidden - no edit permission" });
      return;
    }

    // Get current page data for version history
    const currentPage = await getPage(pageId);
    if (!currentPage) {
      console.log(`❌ Page ${pageId} not found in MongoDB`);
      res.status(404).json({ error: "Page not found" });
      return;
    }

    // Create a version of the current page before updating
    await createVersionForPage(
      pageId,
      currentPage.title,
      currentPage.content,
      currentPage.contentHtml || '',
      currentPage.contentText || '',
      userId,
      'Auto-save version'
    );

    const updatedPage = {
      ...updates,
      updatedBy: new Types.ObjectId(userId),
      updatedAt: new Date(),
    };

    console.log(`🔄 MongoDB update operation for page ${pageId}:`, updatedPage);

    const page = await updatePage(pageId, updatedPage);
    if (!page) {
      console.log(`❌ Page ${pageId} not found in MongoDB`);
      res.status(404).json({ error: "Page not found" });
      return;
    }

    console.log(`✅ Page ${pageId} updated successfully in MongoDB`);
    console.log(`📊 Updated page data:`, {
      id: (page as any)._id || pageId,
      title: page.title,
      updatedAt: page.updatedAt,
      contentLength: page.contentHtml?.length || 0
    });

    // Transform _id to id for frontend compatibility
    const transformedPage = {
      ...page,
      id: (page as any)._id.toString(),
      workspaceId: page.workspaceId?.toString() || null,
      parentId: page.parentId?.toString() || null,
      createdBy: page.createdBy.toString(),
      updatedBy: page.updatedBy.toString(),
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    };

    res.json(transformedPage);
  } catch (error) {
    console.error(`❌ Failed to update page ${pageId}:`, error);
    res.status(500).json({ 
      error: "Failed to update page",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
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
