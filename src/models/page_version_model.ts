import mongoose, { Model, Schema, Types } from "mongoose";

type ObjectId = Types.ObjectId;

export interface PageVersion {
  pageId: ObjectId;
  version: number;
  title: string;
  content: string;
  contentHtml: string;
  contentText: string;
  createdBy: ObjectId;
  createdAt: Date;
  changeDescription?: string;
}

const PageVersionSchema = new Schema<PageVersion>({
  pageId: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
  version: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  contentHtml: { type: String, default: '' },
  contentText: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  changeDescription: { type: String },
});

// Indexes for better performance
PageVersionSchema.index({ pageId: 1, version: -1 });
PageVersionSchema.index({ pageId: 1, createdAt: -1 });
PageVersionSchema.index({ createdBy: 1 });

const PageVersionModel = mongoose.model<PageVersion>('PageVersion', PageVersionSchema);

// CRUD operations
export async function createPageVersion(pageVersion: Omit<PageVersion, '_id' | 'createdAt'>): Promise<PageVersion> {
  const newVersion = new PageVersionModel(pageVersion);
  return await newVersion.save();
}

export async function getPageVersions(pageId: string): Promise<PageVersion[]> {
  return await PageVersionModel.find({ pageId }).sort({ version: -1 });
}

export async function getPageVersion(pageId: string, version: number): Promise<PageVersion | null> {
  return await PageVersionModel.findOne({ pageId, version });
}

export async function getLatestPageVersion(pageId: string): Promise<PageVersion | null> {
  return await PageVersionModel.findOne({ pageId }).sort({ version: -1 });
}

export async function deletePageVersions(pageId: string): Promise<void> {
  await PageVersionModel.deleteMany({ pageId });
}

export async function deleteOldPageVersions(pageId: string, keepCount: number = 10): Promise<void> {
  const versions = await PageVersionModel.find({ pageId })
    .sort({ version: -1 })
    .skip(keepCount);
  
  if (versions.length > 0) {
    const versionIds = versions.map(v => v._id);
    await PageVersionModel.deleteMany({ _id: { $in: versionIds } });
  }
}

export default PageVersionModel;
