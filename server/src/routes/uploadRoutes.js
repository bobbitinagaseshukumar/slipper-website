const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../services/uploadService');
const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  getUploadStatus,
} = require('../controllers/uploadController');

// All upload routes require admin authentication
router.use(authenticateUser);
router.use(requireAdmin);

// GET /api/upload/status — Check if upload service is configured
router.get('/status', getUploadStatus);

// POST /api/upload/image — Upload single image
router.post('/image', upload.single('image'), uploadSingleImage);

// POST /api/upload/images — Upload multiple images (max 10)
router.post('/images', upload.array('images', 10), uploadMultipleImages);

// DELETE /api/upload/image — Delete an image by URL or publicId
router.delete('/image', deleteImage);

module.exports = router;
