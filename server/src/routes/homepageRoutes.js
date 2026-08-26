const express = require('express');
const homepageController = require('../controllers/homepageController');

const router = express.Router();

router.get('/', homepageController.getHomepageData);

module.exports = router;
