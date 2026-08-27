const express = require('express');
const brandController = require('../controllers/brandController');

const router = express.Router();

router.get('/', brandController.getBrands);
router.get('/:slug', brandController.getBrandBySlug);

module.exports = router;
