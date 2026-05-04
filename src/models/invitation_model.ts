import mongoose, { Model, Schema, Types } from "mongoose";

type ObjectId = Types.ObjectId;

export interface Invitation {
  workspace: ObjectId;
  invitedUser: ObjectId;
  invitedBy: ObjectId;
  role: "admin" | "editor" | "commenter" | "viewer";
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expiresAt: Date;
  createdAt: Date;
  respondedAt?: Date;
}

const InvitationSchema = new Schema<Invitation>({
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  invitedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["admin", "editor", "commenter", "viewer"], required: true },
  status: { type: String, enum: ["pending", "accepted", "declined", "expired"], default: "pending" },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
});

const InvitationModel: Model<Invitation> = mongoose.model<Invitation>("Invitation", InvitationSchema);

export default InvitationModel;

// Invitation management functions
export async function createInvitation(
  workspaceId: string,
  invitedUserId: string,
  invitedByUserId: string,
  role: "admin" | "editor" | "commenter" | "viewer",
  expiresInDays: number = 7
): Promise<Invitation> {
  const token = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  return InvitationModel.create({
    workspace: new Types.ObjectId(workspaceId),
    invitedUser: new Types.ObjectId(invitedUserId),
    invitedBy: new Types.ObjectId(invitedByUserId),
    role,
    token,
    expiresAt,
  });
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  return InvitationModel.findOne({ token }).populate("workspace invitedUser invitedBy");
}

export async function acceptInvitation(token: string): Promise<void> {
  const invitation = await InvitationModel.findOne({ token });
  if (!invitation) throw new Error("Invitation not found");
  
  if (invitation.status !== "pending") throw new Error("Invitation already responded");
  if (invitation.expiresAt < new Date()) throw new Error("Invitation expired");

  // Add user to workspace
  await mongoose.model("Workspace").findByIdAndUpdate(
    invitation.workspace,
    {
      $push: {
        members: {
          user: invitation.invitedUser,
          role: invitation.role,
          joinedAt: new Date(),
          invitedBy: invitation.invitedBy,
        },
      },
      $set: { updatedAt: new Date() },
    }
  );

  // Update invitation status
  await InvitationModel.findByIdAndUpdate(invitation._id, {
    status: "accepted",
    respondedAt: new Date(),
  });
}

export async function declineInvitation(token: string): Promise<void> {
  await InvitationModel.findOneAndUpdate(
    { token },
    {
      status: "declined",
      respondedAt: new Date(),
    }
  );
}

export async function getPendingInvitationsForUser(userId: string): Promise<Invitation[]> {
  return InvitationModel.find({
    invitedUser: new Types.ObjectId(userId),
    status: "pending",
    expiresAt: { $gt: new Date() },
  })
    .populate("workspace invitedBy")
    .sort({ createdAt: -1 });
}

export async function getInvitationsForWorkspace(workspaceId: string): Promise<Invitation[]> {
  return InvitationModel.find({
    workspace: new Types.ObjectId(workspaceId),
  })
    .populate("invitedUser invitedBy")
    .sort({ createdAt: -1 });
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  await InvitationModel.findByIdAndDelete(invitationId);
}

export async function expireOldInvitations(): Promise<void> {
  await InvitationModel.updateMany(
    {
      status: "pending",
      expiresAt: { $lt: new Date() },
    },
    {
      status: "expired",
      respondedAt: new Date(),
    }
  );
}

// Helper function to generate invitation token
function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function isUserInvitedToWorkspace(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const invitation = await InvitationModel.findOne({
    workspace: new Types.ObjectId(workspaceId),
    invitedUser: new Types.ObjectId(userId),
    status: "pending",
    expiresAt: { $gt: new Date() },
  });
  return !!invitation;
}
