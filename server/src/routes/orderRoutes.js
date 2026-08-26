const express = require('express');
const rateLimit = require('express-rate-limit');
const orderController = require('../controllers/orderController');
const { authenticateUser, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: {
    success: false,
    message: 'Too many order requests. Please check your order history.',
  },
});

// WhatsApp Order Endpoints (Supports both logged-in and guest customers)
router.post('/whatsapp-order', optionalAuth, orderLimiter, orderController.createWhatsAppOrder);
router.post('/quick-product-whatsapp', optionalAuth, orderLimiter, orderController.createQuickProductWhatsAppOrder);

// Authenticated Customer Order Endpoints
router.use(authenticateUser);

router.get('/', orderController.getUserOrders);
router.get('/:orderNumber', orderController.getOrderByNumber);
router.post('/', orderLimiter, orderController.createOrder);
router.post('/:orderNumber/cancel', orderController.cancelOrder);
router.post('/:orderNumber/return', orderController.requestReturn);
router.post('/:orderNumber/reorder', orderController.reorder);

module.exports = router;
