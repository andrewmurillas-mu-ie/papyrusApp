import express, { Router } from "express";
import { ObjectId } from "mongodb";
import { createPage, getPage, updatePage, getPagesByUser, deletePage } from "../models/page_model";

const router: Router = express.Router();

// POST /page - Create page
router.post("/page", async (req, res) => {
  try {
    const dummyUserId = "507f1f77bcf86cd799439011";
    
    const page = await createPage({
      title: req.body.title || 'Untitled',
      icon: '📄',
      content: req.body.content || '',
      contentHtml: req.body.contentHtml || '',
      contentText: req.body.contentText || '',
      workspaceId: null,
      parentId: null,
      isFavorite: false,
      isShared: false,
      currentVersion: 1,
      createdBy: new ObjectId(dummyUserId),
      updatedBy: new ObjectId(dummyUserId),
    });
    
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
    
    res.status(201).json(transformedPage);
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ error: "Failed to create page" });
  }
});

// GET /page/:id - Get page
router.get("/page/:id", async (req, res) => {
  try {
    const pageId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const page = await getPage(pageId);
    
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }
    
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
    
    return res.json(transformedPage);
  } catch (error) {
    console.error('Get page error:', error);
    return res.status(500).json({ error: "Failed to get page" });
  }
});

// PATCH /page/:id - Update page
router.patch("/page/:id", async (req, res) => {
  try {
    const pageId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const dummyUserId = "507f1f77bcf86cd799439011";
    
    const page = await updatePage(pageId, {
      title: req.body.title,
      content: req.body.content,
      contentHtml: req.body.contentHtml,
      contentText: req.body.contentText,
      updatedBy: new ObjectId(dummyUserId),
      updatedAt: new Date(),
    });
    
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }
    
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
    
    return res.json(transformedPage);
  } catch (error) {
    console.error('Update page error:', error);
    return res.status(500).json({ error: "Failed to update page" });
  }
});

// GET /page - List all pages
router.get("/page", async (req, res) => {
  try {
    const dummyUserId = "507f1f77bcf86cd799439011";
    const pages = await getPagesByUser(dummyUserId);
    
    const transformedPages = pages.map((page: any) => ({
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
    console.error('Get pages error:', error);
    res.status(500).json({ error: "Failed to get pages" });
  }
});

// DELETE /page/:id - Delete page
router.delete("/page/:id", async (req, res) => {
  try {
    const pageId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deletePage(pageId);
    
    if (!result) {
      return res.status(404).json({ error: "Page not found" });
    }
    
    return res.status(200).json({ success: true, message: "Page deleted" });
  } catch (error) {
    console.error('Delete page error:', error);
    return res.status(500).json({ error: "Failed to delete page" });
  }
});

export default router;
