import api from './api';

export const cartService = {
  getCart: async () => {
    return await api.get('/cart');
  },

  addToCart: async (itemData) => {
    return await api.post('/cart/items', itemData);
  },

  updateQuantity: async (itemId, quantity) => {
    return await api.patch(`/cart/items/${itemId}`, { quantity });
  },

  removeItem: async (itemId) => {
    return await api.delete(`/cart/items/${itemId}`);
  },

  moveToWishlist: async (itemId) => {
    return await api.post(`/cart/items/${itemId}/move-to-wishlist`);
  },

  mergeCart: async (guestItems) => {
    return await api.post('/cart/merge', { guestItems });
  },

  clearCart: async () => {
    return await api.delete('/cart');
  },
};

export default cartService;
