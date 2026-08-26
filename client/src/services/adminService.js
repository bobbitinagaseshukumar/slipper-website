import api from './api';

export const adminService = {
  getDashboardStats: async (range = '30d') => {
    return await api.get('/admin/dashboard', { params: { range } });
  },

  // Products
  getProducts: async (params = {}) => {
    return await api.get('/admin/products', { params });
  },

  createProduct: async (productData) => {
    return await api.post('/admin/products', productData);
  },

  updateProduct: async (id, productData) => {
    return await api.patch(`/admin/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    return await api.delete(`/admin/products/${id}`);
  },

  // Orders
  getOrders: async (params = {}) => {
    return await api.get('/admin/orders', { params });
  },

  updateOrderStatus: async (id, data) => {
    return await api.patch(`/admin/orders/${id}/status`, data);
  },

  // Customers
  getCustomers: async (params = {}) => {
    return await api.get('/admin/customers', { params });
  },

  updateCustomerStatus: async (id, status) => {
    return await api.patch(`/admin/customers/${id}/status`, { status });
  },

  deleteCustomer: async (id) => {
    return await api.delete(`/admin/customers/${id}`);
  },

  forceLogoutCustomer: async (id) => {
    return await api.post(`/admin/customers/${id}/force-logout`);
  },

  // Subcategories
  getSubCategories: async () => {
    return await api.get('/admin/subcategories');
  },

  createSubCategory: async (data) => {
    return await api.post('/admin/subcategories', data);
  },

  deleteSubCategory: async (id) => {
    return await api.delete(`/admin/subcategories/${id}`);
  },

  // Offers & Deals
  getOffers: async () => {
    return await api.get('/admin/offers');
  },

  createOffer: async (data) => {
    return await api.post('/admin/offers', data);
  },

  deleteOffer: async (id) => {
    return await api.delete(`/admin/offers/${id}`);
  },

  // Festival Deals
  getFestivalDeals: async () => {
    return await api.get('/admin/festival-deals');
  },

  createFestivalDeal: async (data) => {
    return await api.post('/admin/festival-deals', data);
  },

  deleteFestivalDeal: async (id) => {
    return await api.delete(`/admin/festival-deals/${id}`);
  },

  // Flash Sales
  getFlashSales: async () => {
    return await api.get('/admin/flash-sales');
  },

  createFlashSale: async (data) => {
    return await api.post('/admin/flash-sales', data);
  },

  deleteFlashSale: async (id) => {
    return await api.delete(`/admin/flash-sales/${id}`);
  },

  // Reviews
  getReviews: async () => {
    return await api.get('/admin/reviews');
  },

  moderateReview: async (id, isApproved) => {
    return await api.patch(`/admin/reviews/${id}/moderate`, { isApproved });
  },

  // Coupons
  getCoupons: async () => {
    return await api.get('/admin/coupons');
  },

  createCoupon: async (couponData) => {
    return await api.post('/admin/coupons', couponData);
  },

  // Banners
  getBanners: async () => {
    return await api.get('/admin/banners');
  },

  createBanner: async (bannerData) => {
    return await api.post('/admin/banners', bannerData);
  },

  // Audit Logs
  getAuditLogs: async () => {
    return await api.get('/admin/audit-logs');
  },

  // Store Settings (Single Source of Truth)
  getStoreSettings: async () => {
    return await api.get('/settings/admin');
  },

  updateStoreSettings: async (settingsData) => {
    return await api.put('/settings/admin', settingsData);
  },
};

export default adminService;
