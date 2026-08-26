import api from './api';

export const notificationService = {
  subscribe: async (email) => {
    return await api.post('/notifications/subscribe', { email });
  },

  unsubscribe: async (data) => {
    return await api.post('/notifications/unsubscribe', data);
  },

  getPreferences: async () => {
    return await api.get('/notifications/preferences');
  },

  updatePreferences: async (preferences) => {
    return await api.put('/notifications/preferences', preferences);
  },

  // Admin endpoints
  createCampaign: async (campaignData) => {
    return await api.post('/notifications/campaigns', campaignData);
  },

  getCampaigns: async () => {
    return await api.get('/notifications/campaigns');
  },

  sendTestEmail: async (email) => {
    return await api.post('/notifications/test-email', { email });
  },

  getEmailLogs: async () => {
    return await api.get('/notifications/logs');
  },

  getSubscribers: async () => {
    return await api.get('/notifications/subscribers');
  },
};

export default notificationService;
