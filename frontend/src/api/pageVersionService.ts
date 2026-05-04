import { api } from "./client";

export interface PageVersion {
  id: string;
  pageId: string;
  version: number;
  title: string;
  content: string;
  contentHtml: string;
  contentText: string;
  createdBy: string;
  createdAt: string;
  changeDescription?: string;
}

const pageVersionService = {
  // Get all versions of a page
  getVersions: async (pageId: string): Promise<PageVersion[]> => {
    const { data } = await api.get(`/page/${pageId}/versions`);
    return data;
  },

  // Get a specific version of a page
  getVersion: async (pageId: string, version: number): Promise<PageVersion> => {
    const { data } = await api.get(`/page/${pageId}/versions/${version}`);
    return data;
  },

  // Restore a page to a specific version
  restoreVersion: async (pageId: string, version: number): Promise<any> => {
    const { data } = await api.post(`/page/${pageId}/versions/${version}/restore`);
    return data;
  },
};

export default pageVersionService;
