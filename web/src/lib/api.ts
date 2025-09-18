import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
