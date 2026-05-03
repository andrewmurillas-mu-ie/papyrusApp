import { api } from "./client.ts";
import Version from "../backend_objects/Version.ts";

const versionService = {
  getAll: async (): Promise<Version[]> => {
    const { data } = await api.get("/version");
    return data;
  },
  getVersionById: async (id: string): Promise<Version> => {
    const { data } = await api.get(`/version/${id}`);
    return data;
  },
  createVersion: async (payload: Record<string, unknown>): Promise<Version> => {
    const { data } = await api.post("/version", payload);
    return data;
  },
  deleteVersion: async (id: string): Promise<void> => {
    await api.delete(`/version/${id}`);
  },
};

export default versionService;
