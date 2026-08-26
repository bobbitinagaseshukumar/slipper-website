const express = require('express');
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateUser);

// Profile & Dashboard
router.get('/dashboard', userController.getDashboard);
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.post('/deactivate', userController.deactivateAccount);

// Session & Device Security Management
router.get('/sessions', userController.getUserSessions);
router.delete('/sessions/:sessionId', userController.revokeSession);
router.post('/sessions/logout-all', userController.logoutAllSessions);

// Email Change with Mandatory OTP Verification
router.post('/email/request-otp', userController.requestEmailChangeOtp);
router.post('/email/verify-otp', userController.verifyEmailChangeOtp);

// Security Notifications
router.get('/notifications/security', userController.getSecurityNotifications);

module.exports = router;
