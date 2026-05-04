import { Request, Response } from "express";
import {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  getPendingInvitationsForUser,
  getInvitationsForWorkspace,
  cancelInvitation,
  isUserInvitedToWorkspace,
} from "../models/invitation_model";
import { getUserRoleInWorkspace } from "../models/workspace_model";

export async function requestCreateInvitation(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.workspaceId as string;
  const { invitedUserId, role } = req.body;
  
  // Check if user is owner or admin
  const userRole = await getUserRoleInWorkspace(workspaceId, userId);
  if (userRole !== "owner" && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  // Check if user is already invited or a member
  const alreadyInvited = await isUserInvitedToWorkspace(workspaceId, invitedUserId);
  if (alreadyInvited) {
    res.status(400).json({ error: "User already invited or is a member" });
    return;
  }
  
  try {
    const invitation = await createInvitation(workspaceId, invitedUserId, userId, role);
    res.status(201).json(invitation);
  } catch (error) {
    res.status(400).json({ error: "Failed to create invitation" });
  }
}

export async function requestAcceptInvitation(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const { token } = req.body;
  
  try {
    await acceptInvitation(token);
    res.json({ message: "Invitation accepted successfully" });
  } catch (error: any) {
    if (error.message === "Invitation not found") {
      res.status(404).json({ error: "Invitation not found" });
    } else if (error.message === "Invitation already responded") {
      res.status(400).json({ error: "Invitation already responded" });
    } else if (error.message === "Invitation expired") {
      res.status(400).json({ error: "Invitation expired" });
    } else {
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  }
}

export async function requestDeclineInvitation(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const { token } = req.body;
  
  try {
    await declineInvitation(token);
    res.json({ message: "Invitation declined successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to decline invitation" });
  }
}

export async function requestGetMyInvitations(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  
  try {
    const invitations = await getPendingInvitationsForUser(userId);
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: "Failed to get invitations" });
  }
}

export async function requestGetWorkspaceInvitations(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.workspaceId as string;
  
  // Check if user is owner or admin
  const userRole = await getUserRoleInWorkspace(workspaceId, userId);
  if (userRole !== "owner" && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  try {
    const invitations = await getInvitationsForWorkspace(workspaceId);
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: "Failed to get workspace invitations" });
  }
}

export async function requestCancelInvitation(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.workspaceId as string;
  const { invitationId } = req.body;
  
  // Check if user is owner or admin
  const userRole = await getUserRoleInWorkspace(workspaceId, userId);
  if (userRole !== "owner" && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  try {
    await cancelInvitation(invitationId);
    res.json({ message: "Invitation cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel invitation" });
  }
}

export async function requestGetInvitationByToken(req: Request, res: Response): Promise<void> {
  const token = req.params.token as string;
  
  try {
    const invitation = await getInvitationByToken(token);
    if (!invitation) {
      res.status(404).json({ error: "Invitation not found" });
      return;
    }
    
    // Check if invitation is still valid
    if (invitation.status !== "pending" || invitation.expiresAt < new Date()) {
      res.status(400).json({ error: "Invitation is no longer valid" });
      return;
    }
    
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: "Failed to get invitation" });
  }
}
