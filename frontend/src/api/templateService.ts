import { api } from "./client.ts";
import Template from "../backend_objects/Template.ts";

const templateService = {
  getAllTemplates: async (): Promise<Template[]> => {
    const { data } = await api.get("/template");
    return data;
  },
  getTemplateById: async (id: string): Promise<Template> => {
    const { data } = await api.get(`/template/${id}`);
    return data;
  },
  createTemplate: async (
    payload: Record<string, unknown>,
  ): Promise<Template> => {
    const { data } = await api.post("/template", payload);
    return data;
  },
  updateTemplate: async (
    id: string,
    payload: Record<string, unknown>,
  ): Promise<Template> => {
    const { data } = await api.put(`/template/${id}`, payload);
    return data;
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/template/${id}`);
  },
};

export default templateService;