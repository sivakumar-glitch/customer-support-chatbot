import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 15000,
});

export const getSummary = () => api.get('/api/stats/summary');
export const getDistribution = () => api.get('/api/stats/distribution');
export const getBySource = () => api.get('/api/stats/by-source');
export const getTrends = () => api.get('/api/stats/trends');
export const getAutomationOpportunities = () => api.get('/api/automation-opportunities');
export const getQueries = (params) => api.get('/api/queries', { params });
export const classifyQuery = (message, source) =>
  api.post('/api/classify', { message, source });
export const getAutoReply = (message) =>
  api.get('/api/auto-reply', { params: { message } });

export default api;
