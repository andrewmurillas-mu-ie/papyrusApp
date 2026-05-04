import { api } from "./client";
import { Workspace, WorkspaceMember } from "../types/page";

const workspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    const { data } = await api.get("/workspace");
    return data;
  },
  getWorkspaceById: async (id: string): Promise<Workspace> => {
    const { data } = await api.get(`/workspace/${id}`);
    return data;
  },
  createWorkspace: async (payload: {
    name: string;
    description?: string;
    icon?: string;
    settings?: {
      allowPublicSharing?: boolean;
      defaultMemberRole?: 'editor' | 'commenter' | 'viewer';
    };
  }): Promise<Workspace> => {
    const { data } = await api.post("/workspace", payload);
    return data;
  },
  updateWorkspace: async (
    id: string,
    payload: Partial<Workspace>,
  ): Promise<void> => {
    await api.put(`/workspace/${id}`, payload);
  },
  deleteWorkspace: async (id: string): Promise<void> => {
    await api.delete(`/workspace/${id}`);
  },
  
  // Member management
  getMembers: async (workspaceId: string): Promise<WorkspaceMember[]> => {
    const { data } = await api.get(`/workspace/${workspaceId}/members`);
    return data;
  },
  addMember: async (workspaceId: string, userId: string, role: 'admin' | 'editor' | 'commenter' | 'viewer'): Promise<void> => {
    await api.post(`/workspace/${workspaceId}/members`, { userId, role });
  },
  removeMember: async (workspaceId: string, userId: string): Promise<void> => {
    await api.delete(`/workspace/${workspaceId}/members`, { data: { userId } });
  },
  updateMemberRole: async (workspaceId: string, userId: string, role: 'admin' | 'editor' | 'commenter' | 'viewer'): Promise<void> => {
    await api.put(`/workspace/${workspaceId}/members`, { userId, role });
  },
};

export default workspaceService;
