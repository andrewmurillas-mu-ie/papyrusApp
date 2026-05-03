import { api } from "./client.ts";
import Block from "../backend_objects/Block.ts";

const blockService = {
  getAllBlocks: async (): Promise<Block[]> => {
    const { data } = await api.get("/block");
    return data;
  },
  getBlockById: async (id: string): Promise<Block> => {
    const { data } = await api.get(`/block/${id}`);
    return data;
  },
  createBlock: async (payload: Record<string, unknown>): Promise<Block> => {
    const { data } = await api.post("/block", payload);
    return data;
  },
  updateBlock: async (
    id: string,
    payload: Record<string, unknown>,
  ): Promise<Block> => {
    const { data } = await api.put(`/block/${id}`, payload);
    return data;
  },
  deleteBlock: async (id: string): Promise<void> => {
    await api.delete(`/block/${id}`);
  },
};

export default blockService;