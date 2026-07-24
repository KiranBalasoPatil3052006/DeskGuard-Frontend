import api from './api';

export const getSecuritySettings = async () => {
  const response = await api.get('/security/settings');
  return response.data;
};

export const updateSecuritySettings = async (settingsData) => {
  const response = await api.put('/security/settings', settingsData);
  return response.data;
};

export const getLoginHistory = async (params = {}) => {
  const response = await api.get('/security/login-history', { params });
  return response.data;
};

export const getSecurityAuditLogs = async (params = {}) => {
  const response = await api.get('/security/audit', { params });
  return response.data;
};
