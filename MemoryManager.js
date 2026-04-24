import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies automatically
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Track refresh state to avoid loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Response interceptor - auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
};

// ============================================
// API KEYS
// ============================================
export const keysAPI = {
  list: () => api.get('/keys'),
  add: (data) => api.post('/keys', data),
  delete: (id) => api.delete(`/keys/${id}`),
  toggle: (id) => api.patch(`/keys/${id}/toggle`),
};

// ============================================
// ORCHESTRATION
// ============================================
export const orchestrateAPI = {
  run: (data) => api.post('/orchestrate/run', data),
  getModels: () => api.get('/orchestrate/models'),
  listAgents: () => api.get('/orchestrate/agents'),
  createAgent: (data) => api.post('/orchestrate/agents', data),
  updateAgent: (id, data) => api.put(`/orchestrate/agents/${id}`, data),
  deleteAgent: (id) => api.delete(`/orchestrate/agents/${id}`),
  listConversations: () => api.get('/orchestrate/conversations'),
  getConversation: (id) => api.get(`/orchestrate/conversations/${id}`),
};

// ============================================
// MEMORY
// ============================================
export const memoryAPI = {
  list: (params) => api.get('/memory', { params }),
  upsert: (data) => api.post('/memory', data),
  delete: (id) => api.delete(`/memory/${id}`),
  categories: () => api.get('/memory/categories'),
  clear: () => api.delete('/memory/clear', { data: { confirm: 'CLEAR_ALL' } }),
};

export default api;
