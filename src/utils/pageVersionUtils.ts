import { Types } from "mongoose";
import {
  createPageVersion,
  deleteOldPageVersions,
} from "../models/page_version_model";
import { getPage } from "../models/page_model";

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
    const { getLatestPageVersion } = require("../models/page_version_model");
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
