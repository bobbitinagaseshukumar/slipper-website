import api from './api';

export const otpService = {
  /**
   * Request OTP for Customer Login / Registration / Verification
   */
  sendCustomerOTP: async ({ email, purpose = 'LOGIN', name }) => {
    return await api.post('/auth/otp/send', { email, purpose, name });
  },

  /**
   * Verify Customer OTP and receive authenticated session
   */
  verifyCustomerOTP: async ({ email, otp, purpose = 'LOGIN', name }) => {
    return await api.post('/auth/otp/verify', { email, otp, purpose, name });
  },

  /**
   * Admin Step 1: Validate Admin Credentials and Dispatch Mandatory 2FA OTP
   */
  sendAdminLoginOTP: async ({ email, password }) => {
    return await api.post('/auth/otp/admin-login', { email, password });
  },

  /**
   * Admin Step 2: Verify Mandatory 2FA OTP and Receive Admin JWT Session
   */
  verifyAdminLoginOTP: async ({ email, otp }) => {
    return await api.post('/auth/otp/admin-verify', { email, otp });
  },
};

export default otpService;
