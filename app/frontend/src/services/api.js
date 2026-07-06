import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardService = {
  getData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export const dockerService = {
  getContainers: async () => {
    const response = await api.get('/docker');
    return response.data;
  },
  restartContainer: async (id) => {
    const response = await api.post(`/docker/${id}/restart`);
    return response.data;
  },
  getLogs: async (id) => {
    const response = await api.get(`/docker/${id}/logs`);
    return response.data;
  },
  inspectContainer: async (id) => {
    const response = await api.get(`/docker/${id}/inspect`);
    return response.data;
  },
};

export const kubernetesService = {
  getData: async () => {
    const response = await api.get('/kubernetes');
    return response.data;
  },
};

export const deploymentsService = {
  getHistory: async () => {
    const response = await api.get('/deployments');
    return response.data;
  },
  deployLatest: async (payload) => {
    const response = await api.post('/deployments/deploy', payload);
    return response.data;
  },
  rollback: async (id) => {
    const response = await api.post(`/deployments/rollback/${id}`);
    return response.data;
  },
  redeploy: async (id) => {
    const response = await api.post(`/deployments/redeploy/${id}`);
    return response.data;
  },
};

export const monitoringService = {
  getMetrics: async () => {
    const response = await api.get('/monitoring');
    return response.data;
  },
};

export const metaService = {
  getVersion: async () => {
    const response = await api.get('/version');
    return response.data;
  },
  getAbout: async () => {
    const response = await api.get('/about');
    return response.data;
  },
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
};

export default api;
