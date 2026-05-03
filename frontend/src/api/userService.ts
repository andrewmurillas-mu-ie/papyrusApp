import { api } from "./client.ts";
import User from "../backend_objects/User.ts";

const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get("/user");
    return data;
  },
  getUserById: async (id: string): Promise<User> => {
    const { data } = await api.get(`/user/${id}`);
    return data;
  },
  createUser: async (payload: string): Promise<void> => {
    const { data } = await api.post("/user", payload);
    return data;
  },
  updateUser: async (
    id: string,
    payload: Record<string, unknown>,
  ): Promise<any> => {
    const { data } = await api.put(`/user/${id}`, payload);
    return data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/user/${id}`);
  },
};

export default userService;
