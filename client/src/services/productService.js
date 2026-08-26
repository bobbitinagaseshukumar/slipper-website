import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    return await api.get('/products', { params });
  },

  getProductBySlug: async (slug) => {
    return await api.get(`/products/${slug}`);
  },

  getSuggestions: async (query) => {
    return await api.get('/products/suggestions', { params: { q: query } });
  },

  getFilterOptions: async () => {
    return await api.get('/products/filters');
  },
};

export default productService;
