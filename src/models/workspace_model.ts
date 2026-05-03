import mongoose, { Model, Schema, Types } from "mongoose";

export interface Workspace {
  name: string;
  owner: Types.ObjectId;
  members: Array<{
    user: Types.ObjectId;
    permission: "owner" | "editor" | "viewer";
  }>;
  createdAt: Date;
  lastUpdated: Date;
}

const WorkspaceSchema = new Schema<Workspace>({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      permission: { type: String, enum: ["owner", "editor", "viewer"] },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const WorkspaceModel: Model<Workspace> = mongoose.model<Workspace>(
  "Workspace",
  WorkspaceSchema,
);

export default WorkspaceModel;

export async function getWorkspace(
  workspaceId: string,
): Promise<Workspace | null> {
  return WorkspaceModel.findById(workspaceId);
}

export async function getWorkspacesByOwner(
  userId: string,
): Promise<Workspace[]> {
  return WorkspaceModel.find({ owner: new Types.ObjectId(userId) });
}

export async function isWorkspaceOwnedByUser(
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const workspace = await WorkspaceModel.findOne({
    _id: new Types.ObjectId(workspaceId),
    owner: new Types.ObjectId(userId),
  });
  return workspace !== null;
}

export async function getAllWorkspaces(): Promise<Workspace[]> {
  return WorkspaceModel.find();
}

export async function createWorkspace(
  workspace: Workspace,
): Promise<Workspace> {
  return WorkspaceModel.create(workspace);
}

export async function updateWorkspace(
  workspaceId: string,
  workspace: Partial<Workspace>,
): Promise<void> {
  await WorkspaceModel.findByIdAndUpdate(workspaceId, workspace);
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await WorkspaceModel.findByIdAndDelete(workspaceId);
}
