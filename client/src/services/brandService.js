import api from './api';

export const brandService = {
  getBrands: async (params = {}) => {
    return await api.get('/brands', { params });
  },

  getBrandBySlug: async (slug) => {
    return await api.get(`/brands/${slug}`);
  },
};

export default brandService;
