import api from './api';

export const userService = {
  getDashboard: async () => {
    return await api.get('/users/dashboard');
  },

  getProfile: async () => {
    return await api.get('/users/profile');
  },

  updateProfile: async (data) => {
    return await api.patch('/users/profile', data);
  },

  changePassword: async (passwords) => {
    return await api.post('/users/change-password', passwords);
  },

  deactivateAccount: async () => {
    return await api.post('/users/deactivate');
  },

  // Sessions & Devices Management
  getSessions: async () => {
    return await api.get('/users/sessions');
  },

  revokeSession: async (sessionId) => {
    return await api.delete(`/users/sessions/${sessionId}`);
  },

  logoutAllSessions: async () => {
    return await api.post('/users/sessions/logout-all');
  },

  // Email Change with Mandatory OTP Verification
  requestEmailChangeOtp: async (newEmail) => {
    return await api.post('/users/email/request-otp', { newEmail });
  },

  verifyEmailChangeOtp: async (newEmail, otp) => {
    return await api.post('/users/email/verify-otp', { newEmail, otp });
  },

  // Security Notifications
  getSecurityNotifications: async () => {
    return await api.get('/users/notifications/security');
  },
};

export default userService;
