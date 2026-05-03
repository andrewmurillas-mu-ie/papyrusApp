import mongoose, { Model, Schema, Types } from "mongoose";

export default interface Backup {
  user: Types.ObjectId;
  workspace: Types.ObjectId;
  format: "json" | "markdown" | "csv";
  data: unknown;
  createdAt: Date;
  lastUpdated: Date;
}

const BackupSchema = new Schema<Backup>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  format: { type: String, enum: ["json", "markdown", "csv"], required: true },
  data: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const BackupModel: Model<Backup> = mongoose.model<Backup>("Backup", BackupSchema);

export async function getBackup(backupId: string): Promise<Backup | null> {
  return BackupModel.findById(backupId);
}

export async function createBackup(backup: Backup): Promise<Backup> {
  return BackupModel.create(backup);
}

export async function deleteBackup(backupId: string): Promise<void> {
  await BackupModel.findByIdAndDelete(backupId);
}