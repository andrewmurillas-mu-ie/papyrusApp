import mongoose, { Model, Schema, Types } from "mongoose";

type ObjectId = Types.ObjectId;

export default interface Version {
  page: ObjectId;
  versionNumber: number;
  snapshot: unknown;
  savedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VersionSchema = new Schema<Version>({
  page: { type: Schema.Types.ObjectId, ref: "Page", required: true },
  versionNumber: { type: Number, required: true },
  snapshot: { type: Schema.Types.Mixed, required: true },
  savedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const VersionModel: Model<Version> = mongoose.model<Version>(
  "Version",
  VersionSchema,
);

export async function getVersion(versionId: string): Promise<Version | null> {
  return VersionModel.findById(versionId);
}

export async function getVersionsByPage(pageId: string): Promise<Version[]> {
  return VersionModel.find({ page: new Types.ObjectId(pageId) });
}

export async function createVersion(version: Version): Promise<Version> {
  return VersionModel.create(version);
}

export async function deleteVersion(versionId: string): Promise<void> {
  await VersionModel.findByIdAndDelete(versionId);
}
