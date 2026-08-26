const storeSettingsService = require('../services/storeSettingsService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * 1. Get Public Store Settings for Customer Storefront
 */
const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await storeSettingsService.getPublicSettings();
    return successResponse(res, 'Public settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Admin Settings for Admin Panel
 */
const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await storeSettingsService.getStoreSettings();
    return successResponse(res, 'Admin store settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Update Store Settings (Admin Only)
 */
const updateSettings = async (req, res, next) => {
  try {
    const updated = await storeSettingsService.updateStoreSettings(req.body, req.user?.id);
    return successResponse(res, 'Store settings updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
};
