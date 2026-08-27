import api from './api';

export const categoryService = {
  getCategories: async (params = {}) => {
    return await api.get('/categories', { params });
  },

  getCategoryBySlug: async (slug) => {
    return await api.get(`/categories/${slug}`);
  },

  getSubcategoryBySlug: async (categorySlug, subcategorySlug) => {
    return await api.get(`/categories/${categorySlug}/${subcategorySlug}`);
  },
};

export default categoryService;
