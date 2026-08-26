import api from './api';

export const authService = {
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  firebaseSync: async (firebaseData) => {
    return await api.post('/auth/firebase-sync', firebaseData);
  },

  completeOnboarding: async (onboardingData) => {
    return await api.post('/auth/complete-onboarding', onboardingData);
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data) => {
    return await api.post('/auth/reset-password', data);
  },
};

export default authService;
