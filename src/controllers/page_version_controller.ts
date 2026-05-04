import { Request, Response } from "express";
import { Types } from "mongoose";
import {
  createPageVersion,
  getPageVersions,
  getPageVersion,
  deletePageVersions,
  deleteOldPageVersions,
} from "../models/page_version_model";
import { canUserAccessPage, canUserEditPage } from "../models/page_model";

export async function requestPageVersions(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.pageId as string;

  // Check if user can access the page
  const canAccess = await canUserAccessPage(pageId, userId);
  if (!canAccess) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const versions = await getPageVersions(pageId);
    console.log(`📜 Retrieved ${versions.length} versions for page ${pageId}`);
    res.json(versions);
  } catch (error) {
    console.error(`❌ Failed to get page versions for ${pageId}:`, error);
    res.status(500).json({ error: "Failed to get page versions" });
  }
}

export async function requestPageVersion(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.pageId as string;
  const version = parseInt(req.params.version as string);

  // Check if user can access the page
  const canAccess = await canUserAccessPage(pageId, userId);
  if (!canAccess) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const pageVersion = await getPageVersion(pageId, version);
    if (!pageVersion) {
      res.status(404).json({ error: "Page version not found" });
      return;
    }

    console.log(`📜 Retrieved page ${pageId} version ${version}`);
    res.json(pageVersion);
  } catch (error) {
    console.error(`❌ Failed to get page version ${pageId}/${version}:`, error);
    res.status(500).json({ error: "Failed to get page version" });
  }
}

export async function requestRestorePageVersion(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const pageId = req.params.pageId as string;
  const version = parseInt(req.params.version as string);

  // Check if user can edit the page
  const canEdit = await canUserEditPage(pageId, userId);
  if (!canEdit) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const pageVersion = await getPageVersion(pageId, version);
    if (!pageVersion) {
      res.status(404).json({ error: "Page version not found" });
      return;
    }

    // Import updatePage function to restore the version
    const { updatePage } = require("../models/page_model");
    
    const restoredPage = await updatePage(pageId, {
      title: pageVersion.title,
      content: pageVersion.content,
      contentHtml: pageVersion.contentHtml,
      contentText: pageVersion.contentText,
      updatedBy: new Types.ObjectId(userId),
      updatedAt: new Date(),
    });

    if (!restoredPage) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    console.log(`🔄 Restored page ${pageId} to version ${version}`);
    res.json(restoredPage);
  } catch (error) {
    console.error(`❌ Failed to restore page version ${pageId}/${version}:`, error);
    res.status(500).json({ error: "Failed to restore page version" });
  }
}

// Helper function to create a page version (called from page controller)
export async function createVersionForPage(
  pageId: string,
  title: string,
  content: string,
  contentHtml: string,
  contentText: string,
  userId: string,
  changeDescription?: string
): Promise<void> {
  try {
    // Get the latest version number
    const { getLatestPageVersion } = require("./page_version_controller");
    const latestVersion = await getLatestPageVersion(pageId);
    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    // Create new version
    await createPageVersion({
      pageId: new Types.ObjectId(pageId),
      version: nextVersion,
      title,
      content,
      contentHtml,
      contentText,
      createdBy: new Types.ObjectId(userId),
      changeDescription,
    });

    console.log(`📜 Created version ${nextVersion} for page ${pageId}`);

    // Clean up old versions (keep only last 10)
    await deleteOldPageVersions(pageId, 10);
  } catch (error) {
    console.error(`❌ Failed to create page version for ${pageId}:`, error);
  }
}
