import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  createWhatsAppOrder: async (orderData) => {
    return await api.post('/orders/whatsapp-order', orderData);
  },

  createQuickProductWhatsAppOrder: async (productData) => {
    return await api.post('/orders/quick-product-whatsapp', productData);
  },

  getUserOrders: async (params = {}) => {
    return await api.get('/orders', { params });
  },

  getOrderByNumber: async (orderNumber) => {
    return await api.get(`/orders/${orderNumber}`);
  },

  cancelOrder: async (orderNumber, reason) => {
    return await api.post(`/orders/${orderNumber}/cancel`, { reason });
  },

  requestReturn: async (orderNumber, data) => {
    return await api.post(`/orders/${orderNumber}/return`, data);
  },

  reorder: async (orderNumber) => {
    return await api.post(`/orders/${orderNumber}/reorder`);
  },
};

export default orderService;
