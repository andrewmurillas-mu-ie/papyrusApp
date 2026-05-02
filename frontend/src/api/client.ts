import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';

const API_BASE_URL: string = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token: string|null = localStorage.getItem('papyrus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});