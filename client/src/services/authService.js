import api from './api';

export const authService = {
  getAuthSettings: async () => {
    return await api.get('/auth/settings');
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  googleLogin: async (data) => {
    return await api.post('/auth/google', data);
  },

  facebookLogin: async (data) => {
    return await api.post('/auth/facebook', data);
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data) => {
    return await api.post('/auth/reset-password', data);
  },

  firebaseSync: async (firebaseData) => {
    return await api.post('/auth/firebase-sync', firebaseData);
  },

  completeOnboarding: async (onboardingData) => {
    return await api.post('/auth/complete-onboarding', onboardingData);
  },
};

export default authService;
