const productService = require('../services/productService');
const { successResponse } = require('../utils/responseHandler');

/**
 * Get Products Controller with multi-attribute filtering, search, pagination, and sorting
 */
const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    return successResponse(res, 'Products fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Product by Slug Controller
 */
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    return successResponse(res, 'Product fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * Autocomplete / Suggestions Controller
 */
const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await productService.getSuggestions(req.query.q);
    return successResponse(res, 'Suggestions fetched successfully', suggestions);
  } catch (error) {
    next(error);
  }
};

/**
 * Filter Metadata Options Controller
 */
const getFilterOptions = async (req, res, next) => {
  try {
    const options = await productService.getFilterOptions();
    return successResponse(res, 'Filter options fetched successfully', options);
  } catch (error) {
    next(error);
  }
};

/**
 * Record Product View
 */
const recordView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection?.remoteAddress;
    await productService.recordProductView(id, userId, ipAddress);
    return successResponse(res, 'View recorded');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Recently Viewed Products for User
 */
const getRecentlyViewed = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const products = await productService.getRecentlyViewed(userId);
    return successResponse(res, 'Recently viewed products loaded', products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getSuggestions,
  getFilterOptions,
  recordView,
  getRecentlyViewed,
};
