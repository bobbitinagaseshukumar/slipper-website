const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// 2. Customer Protected routes
router.use(authenticateUser);

router.get('/eligibility/:productId', reviewController.checkReviewEligibility);
router.get('/user/my-reviews', reviewController.getUserReviews);
router.post('/:productId', reviewController.addReview);
router.delete('/:id', reviewController.deleteUserReview);

// 3. Admin Protected routes
router.get('/admin/all', requireRole(['ADMIN', 'SUPER_ADMIN']), reviewController.getAllReviewsAdmin);
router.patch('/admin/:id/status', requireRole(['ADMIN', 'SUPER_ADMIN']), reviewController.toggleReviewApprovalAdmin);
router.delete('/admin/:id', requireRole(['ADMIN', 'SUPER_ADMIN']), reviewController.deleteReviewAdmin);

// 1. Public reviews on product
router.get('/:productId', reviewController.getProductReviews);

module.exports = router;
