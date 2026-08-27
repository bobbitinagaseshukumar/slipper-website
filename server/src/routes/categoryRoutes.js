const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/:categorySlug/:subcategorySlug', categoryController.getSubcategoryBySlug);

module.exports = router;
