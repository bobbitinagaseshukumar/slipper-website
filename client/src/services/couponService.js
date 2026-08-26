import api from './api';

export const couponService = {
  getActiveCoupons: async () => {
    return await api.get('/coupons');
  },

  validateCoupon: async (code, subtotal) => {
    return await api.post('/coupons/validate', { code, subtotal });
  },
};

export default couponService;
