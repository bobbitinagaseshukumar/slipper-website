import api from './api';

export const reviewService = {
  // Public product reviews
  getProductReviews: async (productId) => {
    return await api.get(`/reviews/${productId}`);
  },

  // Check if current user is eligible to review (has DELIVERED order for this product)
  checkEligibility: async (productId) => {
    return await api.get(`/reviews/eligibility/${productId}`);
  },

  // Get current user's written reviews
  getUserReviews: async () => {
    return await api.get('/reviews/user/my-reviews');
  },

  // Submit verified review (Strict Delivered-Only validation on backend)
  addReview: async (productId, reviewData) => {
    return await api.post(`/reviews/${productId}`, reviewData);
  },

  // Delete own review
  deleteReview: async (id) => {
    return await api.delete(`/reviews/${id}`);
  },

  // Admin: Get all reviews across all products
  getAllReviewsAdmin: async () => {
    return await api.get('/reviews/admin/all');
  },

  // Admin: Toggle review approval status
  toggleReviewApproval: async (id, isApproved) => {
    return await api.patch(`/reviews/admin/${id}/status`, { isApproved });
  },

  // Admin: Delete review permanently
  deleteReviewAdmin: async (id) => {
    return await api.delete(`/reviews/admin/${id}`);
  },
};

export default reviewService;
