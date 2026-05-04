import { api } from "./client.ts";
import Page from "../backend_objects/Page.ts";

export interface SavePagePayload {
  title: string;
  contentHtml: string;
}

const pageService = {
  getAll: async (): Promise<Page[]> => {
    const { data } = await api.get<Page[]>("/page");
    return data;
  },

  getPageById: async (id: string): Promise<Page> => {
    const { data } = await api.get<Page>(`/page/${id}`);
    return data;
  },

  createPage: async (payload: SavePagePayload): Promise<Page> => {
    const { data } = await api.post<Page>("/page", payload);
    return data;
  },

  updatePage: async (
    id: string,
    payload: SavePagePayload,
  ): Promise<Page> => {
    const { data } = await api.put<Page>(`/page/${id}`, payload);
    return data;
  },

  deletePage: async (id: string): Promise<void> => {
    await api.delete(`/page/${id}`);
  },
};

export default pageService;
