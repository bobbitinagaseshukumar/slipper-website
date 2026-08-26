import api from './api';

export const paymentService = {
  /**
   * Fetch public Razorpay key
   */
  getPaymentConfig: async () => {
    return await api.get('/payments/config');
  },

  /**
   * Create Razorpay Order on Backend
   */
  createRazorpayOrder: async (orderData) => {
    return await api.post('/payments/create-order', orderData);
  },

  /**
   * Verify Razorpay Payment Signature
   */
  verifyPayment: async (verificationData) => {
    return await api.post('/payments/verify', verificationData);
  },

  /**
   * Helper to load Razorpay Checkout script dynamically
   */
  loadRazorpayScript: () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },
};

export default paymentService;
