import { api } from './client';

export const userService = {
  getAllUsers: async () => {
    const { data } = await api.get('/user');
    return data;
  },
  getUserById: async (id) => {
    const { data } = await api.get(`/user/${id}`);
    return data;
  },
  createUser: async (payload) => {
    const { data } = await api.post('/user', payload);
    return data;
  },
  updateUser: async (id, payload) => {
    const { data } = await api.put(`/user/${id}`, payload);
    return data;
  },
  deleteUser: async (id) => {
    await api.delete(`/user/${id}`);
  },
};