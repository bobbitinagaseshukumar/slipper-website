const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get All Active, Published Brands (Customer-Facing)
 */
const getBrands = async (req, res, next) => {
  try {
    const { homepageOnly, searchOnly, filterOnly } = req.query;
    const where = {
      isActive: true,
      status: 'PUBLISHED',
    };
    if (homepageOnly === 'true' || homepageOnly === true) where.showOnHomepage = true;
    if (searchOnly === 'true' || searchOnly === true) where.showInSearch = true;
    if (filterOnly === 'true' || filterOnly === true) where.showInFilter = true;

    const brands = await prisma.brand.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true, status: 'PUBLISHED' } } },
        },
      },
    });

    return successResponse(res, 'Brands retrieved successfully', brands);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Brand by Slug with its published products (Customer-Facing)
 */
const getBrandBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const brand = await prisma.brand.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        _count: {
          select: { products: { where: { isActive: true, status: 'PUBLISHED' } } },
        },
      },
    });

    if (!brand || !brand.isActive || brand.status !== 'PUBLISHED') {
      return errorResponse(res, 'Brand not found or currently inactive.', 404);
    }

    return successResponse(res, 'Brand details retrieved successfully', brand);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBrands,
  getBrandBySlug,
};
