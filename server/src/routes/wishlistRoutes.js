const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateUser);

router.get('/', wishlistController.getWishlist);
router.post('/toggle', wishlistController.toggleWishlist);

module.exports = router;
