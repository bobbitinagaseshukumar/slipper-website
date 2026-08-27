const express = require('express');
const productController = require('../controllers/productController');
const { authenticateUser, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Slipper Discovery APIs
router.get('/', productController.getProducts);
router.get('/suggestions', productController.getSuggestions);
router.get('/filters', productController.getFilterOptions);
router.get('/user/recently-viewed', authenticateUser, productController.getRecentlyViewed);
router.post('/:id/view', optionalAuth, productController.recordView);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
