import { api } from "./client.ts";
import Page from "../backend_objects/Page.ts";

const pageService = {
  getAllPages: async (): Promise<Page[]> => {
    const { data } = await api.get("/page");
    return data;
  },
  getPageById: async (id: string): Promise<Page> => {
    const { data } = await api.get(`/page/${id}`);
    return data;
  },
  createPage: async (payload: string): Promise<void> => {
    const { data } = await api.post("/page", payload);
    return data;
  },
  updatePage: async (
    id: string,
    payload: Record<string, unknown>,
  ): Promise<any> => {
    const { data } = await api.put(`/page/${id}`, payload);
    return data;
  },
  deletePage: async (id: string): Promise<void> => {
    await api.delete(`/page/${id}`);
  },
};

export default pageService;
