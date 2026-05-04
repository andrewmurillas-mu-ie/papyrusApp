import mongoose, { Model, Schema, Types } from "mongoose";

type ObjectId = Types.ObjectId;

export interface Workspace {
  name: string;
  description?: string;
  icon?: string;
  owner: ObjectId;
  members: Array<{
    user: ObjectId;
    role: "owner" | "admin" | "editor" | "commenter" | "viewer";
    joinedAt: Date;
    invitedBy?: ObjectId;
  }>;
  settings: {
    allowPublicSharing: boolean;
    defaultMemberRole: "editor" | "commenter" | "viewer";
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<Workspace>({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: '💼' },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["owner", "admin", "editor", "commenter", "viewer"], required: true },
      joinedAt: { type: Date, default: Date.now },
      invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
  settings: {
    allowPublicSharing: { type: Boolean, default: false },
    defaultMemberRole: { type: String, enum: ["editor", "commenter", "viewer"], default: "editor" },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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

// Member management functions
export async function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: "admin" | "editor" | "commenter" | "viewer",
  invitedBy?: string
): Promise<void> {
  await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    {
      $push: {
        members: {
          user: new Types.ObjectId(userId),
          role,
          joinedAt: new Date(),
          invitedBy: invitedBy ? new Types.ObjectId(invitedBy) : undefined,
        },
      },
      $set: { updatedAt: new Date() },
    }
  );
}

export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<void> {
  await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    {
      $pull: { members: { user: new Types.ObjectId(userId) } },
      $set: { updatedAt: new Date() },
    }
  );
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
  role: "admin" | "editor" | "commenter" | "viewer"
): Promise<void> {
  await WorkspaceModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(workspaceId),
      "members.user": new Types.ObjectId(userId),
    },
    {
      $set: {
        "members.$.role": role,
        updatedAt: new Date(),
      },
    }
  );
}

export async function getWorkspaceMembers(
  workspaceId: string
): Promise<Workspace["members"]> {
  const workspace = await WorkspaceModel.findById(workspaceId).populate("members.user");
  return workspace?.members || [];
}

export async function getUserWorkspaces(
  userId: string
): Promise<Workspace[]> {
  return WorkspaceModel.find({
    "members.user": new Types.ObjectId(userId),
  }).populate("members.user");
}

export async function getUserRoleInWorkspace(
  workspaceId: string,
  userId: string
): Promise<"owner" | "admin" | "editor" | "commenter" | "viewer" | null> {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) return null;
  
  // Check if user is owner
  if (workspace.owner.toString() === userId) return "owner";
  
  // Check if user is a member
  const member = workspace.members.find(
    (m) => m.user.toString() === userId
  );
  return member?.role || null;
}

export async function canUserAccessWorkspace(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const role = await getUserRoleInWorkspace(workspaceId, userId);
  return role !== null;
}

export async function canUserEditWorkspace(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const role = await getUserRoleInWorkspace(workspaceId, userId);
  return role === "owner" || role === "admin" || role === "editor";
}
