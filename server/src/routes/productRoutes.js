const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Public Slipper Discovery APIs
router.get('/', productController.getProducts);
router.get('/suggestions', productController.getSuggestions);
router.get('/filters', productController.getFilterOptions);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
