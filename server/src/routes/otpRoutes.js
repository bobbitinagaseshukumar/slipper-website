const express = require('express');
const rateLimit = require('express-rate-limit');
const otpController = require('../controllers/otpController');

const router = express.Router();

// Strict Rate Limiter for OTP operations
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 15 minutes.',
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many verification attempts. Please request a new code.',
  },
});

// Customer OTP endpoints
router.post('/send', otpSendLimiter, otpController.sendCustomerOTP);
router.post('/verify', otpVerifyLimiter, otpController.verifyCustomerOTP);

// Admin 2-Step Authentication endpoints
router.post('/admin-login', otpSendLimiter, otpController.sendAdminLoginOTP);
router.post('/admin-verify', otpVerifyLimiter, otpController.verifyAdminLoginOTP);

module.exports = router;
