import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${BASE}/api` });

// Attach JWT from localStorage
api.interceptors.request.use(cfg => {
  try {
    const auth = JSON.parse(localStorage.getItem('zerone_auth') || 'null');
    if (auth?.token) cfg.headers.Authorization = `Bearer ${auth.token}`;
  } catch {}
  return cfg;
});

api.interceptors.response.use(
  r => r.data,
  err => Promise.reject(err?.response?.data?.error || err.message || 'Request failed')
);

export default api;
