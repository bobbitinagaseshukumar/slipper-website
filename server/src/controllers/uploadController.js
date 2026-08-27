const { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary, extractPublicId } = require('../services/uploadService');
const { isCloudinaryConfigured } = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Upload a single image
 * POST /api/upload/image
 */
const uploadSingleImage = async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return errorResponse(res, 'Image upload service is not configured. Please set Cloudinary environment variables.', 503);
    }

    if (!req.file) {
      return errorResponse(res, 'No image file provided.', 400);
    }

    const folder = req.body.folder || 'slipper-store/products';
    const result = await uploadToCloudinary(req.file.path, folder);

    return successResponse(res, 'Image uploaded successfully', { image: result }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple images (up to 10)
 * POST /api/upload/images
 */
const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return errorResponse(res, 'Image upload service is not configured. Please set Cloudinary environment variables.', 503);
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No image files provided.', 400);
    }

    const folder = req.body.folder || 'slipper-store/products';
    const results = await uploadMultipleToCloudinary(req.files, folder);

    return successResponse(res, `${results.length} image(s) uploaded successfully`, { images: results }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an image by URL or public ID
 * DELETE /api/upload/image
 */
const deleteImage = async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return errorResponse(res, 'Image upload service is not configured.', 503);
    }

    const { url, publicId } = req.body;

    if (!url && !publicId) {
      return errorResponse(res, 'Please provide either an image URL or publicId to delete.', 400);
    }

    const targetPublicId = publicId || extractPublicId(url);

    if (!targetPublicId) {
      return errorResponse(res, 'Could not determine the image to delete. Please provide a valid Cloudinary URL or publicId.', 400);
    }

    const result = await deleteFromCloudinary(targetPublicId);

    return successResponse(res, 'Image deleted successfully', { result });
  } catch (error) {
    next(error);
  }
};

/**
 * Check upload service health
 * GET /api/upload/status
 */
const getUploadStatus = async (req, res) => {
  const configured = isCloudinaryConfigured();
  return successResponse(res, configured ? 'Image upload service is active' : 'Image upload service is not configured', {
    configured,
    provider: 'cloudinary',
    maxFileSize: '5MB',
    allowedTypes: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
    maxFiles: 10,
  });
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  getUploadStatus,
};
