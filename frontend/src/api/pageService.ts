import { api } from "./client";
import { WorkspacePage } from "../types/page";

export interface SavePagePayload {
  title: string;
  contentHtml: string;
}

const pageService = {
  getAll: async (params?: { workspaceId?: string }): Promise<WorkspacePage[]> => {
    const url = params?.workspaceId ? `/page?workspaceId=${params.workspaceId}` : "/page";
    const { data } = await api.get(url);
    return data;
  },
  
  getPageById: async (id: string): Promise<WorkspacePage> => {
    const { data } = await api.get(`/page/${id}`);
    return data;
  },

  createPage: async (payload: Partial<WorkspacePage> | SavePagePayload): Promise<WorkspacePage> => {
    const { data } = await api.post("/page", payload);
    return data;
  },

  updatePage: async (
    id: string,
    payload: Partial<WorkspacePage> | SavePagePayload,
  ): Promise<WorkspacePage> => {
    const { data } = await api.put(`/page/${id}`, payload);
    return data;
  },

  deletePage: async (id: string): Promise<void> => {
    await api.delete(`/page/${id}`);
  },
};

export default pageService;
