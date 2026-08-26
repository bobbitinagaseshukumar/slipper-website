const express = require('express');
const rateLimit = require('express-rate-limit');
const notificationController = require('../controllers/notificationController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many subscription attempts, please try again shortly.',
  },
});

// Public customer subscription & unsubscribe
router.post('/subscribe', subscribeLimiter, notificationController.subscribe);
router.post('/unsubscribe', notificationController.unsubscribe);

// Protected customer preference management
router.get('/preferences', authenticateUser, notificationController.getPreferences);
router.put('/preferences', authenticateUser, notificationController.updatePreferences);

// Admin campaign management & logs
router.post('/campaigns', authenticateUser, requireAdmin, notificationController.createCampaign);
router.get('/campaigns', authenticateUser, requireAdmin, notificationController.getCampaigns);
router.post('/test-email', authenticateUser, requireAdmin, notificationController.sendTestEmail);
router.get('/logs', authenticateUser, requireAdmin, notificationController.getEmailLogs);
router.get('/subscribers', authenticateUser, requireAdmin, notificationController.getSubscribers);
router.get('/brevo-status', authenticateUser, requireAdmin, notificationController.getBrevoStatus);
router.post('/test-brevo', authenticateUser, requireAdmin, notificationController.sendTestBrevoEmail);

module.exports = router;
