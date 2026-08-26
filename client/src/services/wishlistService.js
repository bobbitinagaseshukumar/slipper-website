import api from './api';

export const wishlistService = {
  getWishlist: async () => {
    return await api.get('/wishlist');
  },

  toggleWishlist: async (productId) => {
    return await api.post('/wishlist/toggle', { productId });
  },
};

export default wishlistService;
