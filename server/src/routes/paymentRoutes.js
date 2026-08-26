const express = require('express');
const rateLimit = require('express-rate-limit');
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many payment requests, please try again shortly.',
  },
});

router.get('/config', paymentController.getPaymentConfig);
router.post('/create-order', authenticateUser, paymentLimiter, paymentController.createOrder);
router.post('/verify', authenticateUser, paymentLimiter, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
