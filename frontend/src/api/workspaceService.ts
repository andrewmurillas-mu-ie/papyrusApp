import { api } from "./client.ts";
import Workspace from "../backend_objects/Workspace.ts";

const workspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    const { data } = await api.get("/workspace");
    return data;
  },
  getWorkspaceById: async (id: string): Promise<Workspace> => {
    const { data } = await api.get(`/workspace/${id}`);
    return data;
  },
  createWorkspace: async (payload: string): Promise<void> => {
    const { data } = await api.post("/workspace", payload);
    return data;
  },
  updateWorkspace: async (
    id: string,
    payload: Record<string, unknown>,
  ): Promise<any> => {
    const { data } = await api.put(`/workspace/${id}`, payload);
    return data;
  },
  deleteWorkspace: async (id: string): Promise<void> => {
    await api.delete(`/workspace/${id}`);
  },
};

export default workspaceService;
