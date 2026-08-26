const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get All Active Categories with Subcategories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          select: { id: true, name: true, slug: true, description: true, image: true },
        },
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });

    return successResponse(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Category by Slug
 */
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!category || !category.isActive) {
      return errorResponse(res, 'Category not found', 404);
    }

    return successResponse(res, 'Category details retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
};
