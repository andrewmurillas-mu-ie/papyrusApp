import { api } from "./client";
import { Invitation } from "../types/page";

const invitationService = {
  // Create invitation (workspace owners/admins only)
  createInvitation: async (workspaceId: string, invitedUserId: string, role: 'admin' | 'editor' | 'commenter' | 'viewer'): Promise<Invitation> => {
    const { data } = await api.post(`/workspace/${workspaceId}/invitations`, { invitedUserId, role });
    return data;
  },
  
  // Accept invitation
  acceptInvitation: async (token: string): Promise<void> => {
    await api.post("/invitations/accept", { token });
  },
  
  // Decline invitation
  declineInvitation: async (token: string): Promise<void> => {
    await api.post("/invitations/decline", { token });
  },
  
  // Get my pending invitations
  getMyInvitations: async (): Promise<Invitation[]> => {
    const { data } = await api.get("/invitations/my");
    return data;
  },
  
  // Get workspace invitations (workspace owners/admins only)
  getWorkspaceInvitations: async (workspaceId: string): Promise<Invitation[]> => {
    const { data } = await api.get(`/workspace/${workspaceId}/invitations`);
    return data;
  },
  
  // Cancel invitation (workspace owners/admins only)
  cancelInvitation: async (workspaceId: string, invitationId: string): Promise<void> => {
    await api.delete(`/workspace/${workspaceId}/invitations`, { data: { invitationId } });
  },
  
  // Get invitation by token (for viewing invitation details)
  getInvitationByToken: async (token: string): Promise<Invitation> => {
    const { data } = await api.get(`/invitations/${token}`);
    return data;
  },
};

export default invitationService;
