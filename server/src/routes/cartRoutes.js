const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateUser);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.patch('/items/:id', cartController.updateCartItem);
router.delete('/items/:id', cartController.removeCartItem);
router.post('/items/:id/move-to-wishlist', cartController.moveToWishlist);
router.post('/merge', cartController.mergeCart);
router.delete('/', cartController.clearCart);

module.exports = router;
