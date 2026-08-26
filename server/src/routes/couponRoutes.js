const express = require('express');
const rateLimit = require('express-rate-limit');
const couponController = require('../controllers/couponController');

const router = express.Router();

const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many coupon validation attempts, please try again in a few minutes.',
  },
});

router.get('/', couponController.getActiveCoupons);
router.post('/validate', couponLimiter, couponController.validateCoupon);

module.exports = router;
