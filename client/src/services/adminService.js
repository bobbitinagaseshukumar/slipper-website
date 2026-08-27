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

  // Categories
  createCategory: async (categoryData) => {
    return await api.post('/admin/categories', categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return await api.patch(`/admin/categories/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    return await api.delete(`/admin/categories/${id}`);
  },

  // Orders
  getOrders: async (params = {}) => {
    return await api.get('/admin/orders', { params });
  },

  getOrderDetails: async (id) => {
    return await api.get(`/admin/orders/${id}`);
  },

  approveOrder: async (id, data) => {
    return await api.post(`/admin/orders/${id}/approve`, data);
  },

  updateOrderStatus: async (id, data) => {
    return await api.patch(`/admin/orders/${id}/status`, data);
  },

  deleteOrder: async (id) => {
    return await api.delete(`/admin/orders/${id}`);
  },

  // Admin Notification Center
  getAdminNotifications: async (params = {}) => {
    return await api.get('/admin/notifications', { params });
  },

  markAdminNotificationRead: async (id) => {
    return await api.patch(`/admin/notifications/${id}/read`);
  },

  markAllAdminNotificationsRead: async () => {
    return await api.post('/admin/notifications/mark-all-read');
  },

  // Customers
  getCustomers: async (params = {}) => {
    return await api.get('/admin/customers', { params });
  },

  getCustomerDetails: async (id) => {
    return await api.get(`/admin/customers/${id}`);
  },

  updateCustomerStatus: async (id, data) => {
    const payload = typeof data === 'string' ? { status: data } : data;
    return await api.patch(`/admin/customers/${id}/status`, payload);
  },

  updateCustomerAdminNotes: async (id, adminNotes) => {
    return await api.patch(`/admin/customers/${id}/notes`, { adminNotes });
  },

  forceLogoutCustomer: async (id) => {
    return await api.post(`/admin/customers/${id}/force-logout`);
  },

  forcePasswordResetCustomer: async (id) => {
    return await api.post(`/admin/customers/${id}/force-password-reset`);
  },

  deactivateCustomer: async (id) => {
    return await api.post(`/admin/customers/${id}/deactivate`);
  },

  deleteCustomer: async (id) => {
    return await api.delete(`/admin/customers/${id}`);
  },

  // Categories
  getCategories: async (params = {}) => {
    return await api.get('/admin/categories', { params });
  },

  createCategory: async (data) => {
    return await api.post('/admin/categories', data);
  },

  updateCategory: async (id, data) => {
    return await api.patch(`/admin/categories/${id}`, data);
  },

  deleteCategory: async (id, force = false) => {
    return await api.delete(`/admin/categories/${id}`, { params: { force } });
  },

  reorderCategories: async (categoryOrders) => {
    return await api.post('/admin/categories/reorder', { categoryOrders });
  },

  // Subcategories
  getSubCategories: async (params = {}) => {
    return await api.get('/admin/subcategories', { params });
  },

  createSubCategory: async (data) => {
    return await api.post('/admin/subcategories', data);
  },

  updateSubCategory: async (id, data) => {
    return await api.patch(`/admin/subcategories/${id}`, data);
  },

  deleteSubCategory: async (id, force = false) => {
    return await api.delete(`/admin/subcategories/${id}`, { params: { force } });
  },

  reorderSubCategories: async (subCategoryOrders) => {
    return await api.post('/admin/subcategories/reorder', { subCategoryOrders });
  },

  // Brands (NORMAL & COMPANY BRANDING)
  getBrands: async (params = {}) => {
    return await api.get('/admin/brands', { params });
  },

  createBrand: async (data) => {
    return await api.post('/admin/brands', data);
  },

  updateBrand: async (id, data) => {
    return await api.patch(`/admin/brands/${id}`, data);
  },

  deleteBrand: async (id, force = false) => {
    return await api.delete(`/admin/brands/${id}`, { params: { force } });
  },

  reorderBrands: async (brandOrders) => {
    return await api.post('/admin/brands/reorder', { brandOrders });
  },

  getBrandProducts: async (id) => {
    return await api.get(`/admin/brands/${id}/products`);
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

  updateBanner: async (id, bannerData) => {
    return await api.put(`/admin/banners/${id}`, bannerData);
  },

  deleteBanner: async (id) => {
    return await api.delete(`/admin/banners/${id}`);
  },

  reorderBanners: async (bannerOrders) => {
    return await api.post('/admin/banners/reorder', { bannerOrders });
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

  // Homepage Sections & Festival Campaigns
  getSections: async () => {
    return await api.get('/admin/sections');
  },

  createSection: async (data) => {
    return await api.post('/admin/sections', data);
  },

  updateSection: async (id, data) => {
    return await api.patch(`/admin/sections/${id}`, data);
  },

  deleteSection: async (id) => {
    return await api.delete(`/admin/sections/${id}`);
  },

  reorderSections: async (sectionOrders) => {
    return await api.post('/admin/sections/reorder', { sectionOrders });
  },

  assignProductToSection: async (sectionId, productId) => {
    return await api.post(`/admin/sections/${sectionId}/products`, { productId });
  },

  removeProductFromSection: async (sectionId, productId) => {
    return await api.delete(`/admin/sections/${sectionId}/products/${productId}`);
  },

  // Custom Registration Fields Management
  getCustomRegistrationFields: async () => {
    return await api.get('/admin/registration-fields');
  },

  createCustomRegistrationField: async (data) => {
    return await api.post('/admin/registration-fields', data);
  },

  updateCustomRegistrationField: async (id, data) => {
    return await api.put(`/admin/registration-fields/${id}`, data);
  },

  deleteCustomRegistrationField: async (id) => {
    return await api.delete(`/admin/registration-fields/${id}`);
  },

  reorderCustomRegistrationFields: async (orderedIds) => {
    return await api.post('/admin/registration-fields/reorder', { orderedIds });
  },

  updateCustomerProfileAdmin: async (id, data) => {
    return await api.put(`/admin/customers/${id}/profile`, data);
  },

  getAuthAuditLogs: async (params) => {
    return await api.get('/admin/auth-logs', { params });
  },
};

export default adminService;
