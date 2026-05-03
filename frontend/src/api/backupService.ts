import { api } from "./client.ts";
import Backup from "../backend_objects/Beckup.ts";

const backupService = {
  getAll: async (): Promise<Backup[]> => {
    const { data } = await api.get("/backup");
    return data;
  },
  getBackupById: async (id: string): Promise<Backup> => {
    const { data } = await api.get(`/backup/${id}`);
    return data;
  },
  createBackup: async (payload: Record<string, unknown>): Promise<Backup> => {
    const { data } = await api.post("/backup", payload);
    return data;
  },
  deleteBackup: async (id: string): Promise<void> => {
    await api.delete(`/backup/${id}`);
  },
};

export default backupService;
