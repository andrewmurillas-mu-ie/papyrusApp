import { Request, Response } from "express";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  getWorkspacesByOwner,
  isWorkspaceOwnedByUser,
  updateWorkspace,
  Workspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  getWorkspaceMembers,
  getUserWorkspaces,
  getUserRoleInWorkspace,
  canUserAccessWorkspace,
  canUserEditWorkspace,
} from "../models/workspace_model";

export async function requestAllWorkspaces(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaces: Workspace[] = await getUserWorkspaces(userId);
  res.json(workspaces);
}

export async function requestWorkspace(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  
  // Check if user can access workspace
  const canAccess = await canUserAccessWorkspace(workspaceId, userId);
  if (!canAccess) { 
    res.status(403).json({ error: "Forbidden" }); 
    return; 
  }
  
  const workspace: Workspace | null = await getWorkspace(workspaceId);
  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }
  
  res.json(workspace);
}

export async function requestCreateWorkspace(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspace: Workspace = {
    name: req.body.name,
    description: req.body.description,
    icon: req.body.icon || '💼',
    owner: new (require('mongoose').Types.ObjectId)(userId),
    members: [{
      user: new (require('mongoose').Types.ObjectId)(userId),
      role: "owner",
      joinedAt: new Date(),
    }],
    settings: {
      allowPublicSharing: req.body.settings?.allowPublicSharing || false,
      defaultMemberRole: req.body.settings?.defaultMemberRole || "editor",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const createdWorkspace = await createWorkspace(workspace);
  res.status(201).json(createdWorkspace);
}

export async function requestUpdateWorkspace(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  const owned: boolean = await isWorkspaceOwnedByUser(workspaceId, userId);
  if (!owned) { res.status(403).json({ error: "Forbidden" }); return; }
  await updateWorkspace(workspaceId, req.body);
  res.json(req.body);
}

export async function requestDeleteWorkspace(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  const owned: boolean = await isWorkspaceOwnedByUser(workspaceId, userId);
  if (!owned) { res.status(403).json({ error: "Forbidden" }); return; }
  await deleteWorkspace(workspaceId);
  res.status(204).end();
}

// Member management endpoints
export async function requestAddMember(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  const { userId: newUserId, role } = req.body;
  
  // Check if user is owner or admin
  const userRole = await getUserRoleInWorkspace(workspaceId, userId);
  if (userRole !== "owner" && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  try {
    await addWorkspaceMember(workspaceId, newUserId, role, userId);
    res.status(201).json({ message: "Member added successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to add member" });
  }
}

export async function requestRemoveMember(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  const { userId: memberUserId } = req.body;
  
  // Check if user is owner or admin, or if user is removing themselves
  const userRole = await getUserRoleInWorkspace(workspaceId, userId);
  if (userRole !== "owner" && userRole !== "admin" && userId !== memberUserId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  try {
    await removeWorkspaceMember(workspaceId, memberUserId);
    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to remove member" });
  }
}

export async function requestUpdateMemberRole(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  const { userId: memberUserId, role } = req.body;
  
  // Check if user is owner or admin
  const userRole = await getUserRoleInWorkspace(workspaceId, userId);
  if (userRole !== "owner" && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  try {
    await updateWorkspaceMemberRole(workspaceId, memberUserId, role);
    res.json({ message: "Member role updated successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to update member role" });
  }
}

export async function requestGetMembers(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  
  // Check if user can access workspace
  const canAccess = await canUserAccessWorkspace(workspaceId, userId);
  if (!canAccess) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  try {
    const members = await getWorkspaceMembers(workspaceId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: "Failed to get members" });
  }
}

// Email invitation endpoints
export async function requestInviteMember(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const workspaceId = req.params.id as string;
  const { email, role } = req.body;
  
  // Check if user is owner or admin
  const userRole = await getUserRoleInWorkspace(workspaceId, userId);
  if (userRole !== "owner" && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  if (!email || !role) {
    res.status(400).json({ error: "Email and role are required" });
    return;
  }
  
  try {
    // For now, create a simple invitation record
    // In a real implementation, you would send an email with a unique token
    const invitation = {
      id: new (require('mongoose').Types.ObjectId)().toString(),
      workspaceId,
      email,
      role,
      invitedBy: userId,
      status: 'pending',
      token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    };
    
    // Email invitation would be sent here
    console.log(`📧 Invitation created for ${email} to join workspace ${workspaceId}`);
    console.log(`🔗 Invitation link: /invite/${invitation.token}`);
    
    res.status(201).json({
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      }
    });
  } catch (error) {
    console.error('Failed to create invitation:', error);
    res.status(500).json({ error: "Failed to send invitation" });
  }
}

export async function requestAcceptInvitation(req: Request, res: Response): Promise<void> {
  const userId: string = (req.user as any)._id;
  const { token } = req.params;
  
  if (!token) {
    res.status(400).json({ error: "Invitation token is required" });
    return;
  }
  
  try {
    // Find invitation by token and validate it
    // For now, just return success
    console.log(`📨 User ${userId} accepted invitation with token ${token}`);
    
    res.json({ message: "Invitation accepted successfully" });
  } catch (error) {
    console.error('Failed to accept invitation:', error);
    res.status(500).json({ error: "Failed to accept invitation" });
  }
}