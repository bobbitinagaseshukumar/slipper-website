const express = require('express');
const settingController = require('../controllers/settingController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Storefront Settings (safe, no secrets)
router.get('/public', settingController.getPublicSettings);

// Admin-only Settings Endpoints
router.get('/admin', authenticateUser, requireRole(['ADMIN', 'SUPER_ADMIN']), settingController.getAdminSettings);
router.put('/admin', authenticateUser, requireRole(['ADMIN', 'SUPER_ADMIN']), settingController.updateSettings);

module.exports = router;
