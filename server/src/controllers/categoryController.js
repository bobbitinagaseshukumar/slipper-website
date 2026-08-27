const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get All Active, Published Categories with Subcategories (Customer-Facing)
 */
const getCategories = async (req, res, next) => {
  try {
    const { homepageOnly } = req.query;
    const where = {
      isActive: true,
      status: 'PUBLISHED',
    };
    if (homepageOnly === 'true' || homepageOnly === true) {
      where.showOnHomepage = true;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        subCategories: {
          where: { isActive: true, status: 'PUBLISHED' },
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            imageAlt: true,
            displayOrder: true,
          },
        },
        _count: {
          select: { products: { where: { isActive: true, status: 'PUBLISHED' } } },
        },
      },
    });

    return successResponse(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Category by Slug with its published subcategories (Customer-Facing)
 */
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        subCategories: {
          where: { isActive: true, status: 'PUBLISHED' },
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            imageAlt: true,
            _count: {
              select: { products: { where: { isActive: true, status: 'PUBLISHED' } } },
            },
          },
        },
        _count: {
          select: { products: { where: { isActive: true, status: 'PUBLISHED' } } },
        },
      },
    });

    if (!category || !category.isActive || category.status !== 'PUBLISHED') {
      return errorResponse(res, 'Category not found or currently unavailable.', 404);
    }

    return successResponse(res, 'Category details retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Subcategory by Category Slug and Subcategory Slug
 */
const getSubcategoryBySlug = async (req, res, next) => {
  try {
    const { categorySlug, subcategorySlug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug.toLowerCase() },
    });

    if (!category || !category.isActive || category.status !== 'PUBLISHED') {
      return errorResponse(res, 'Parent category not found.', 404);
    }

    const subcategory = await prisma.subCategory.findFirst({
      where: {
        categoryId: category.id,
        slug: subcategorySlug.toLowerCase(),
        isActive: true,
        status: 'PUBLISHED',
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: {
          select: { products: { where: { isActive: true, status: 'PUBLISHED' } } },
        },
      },
    });

    if (!subcategory) {
      return errorResponse(res, 'Subcategory not found.', 404);
    }

    return successResponse(res, 'Subcategory retrieved successfully', subcategory);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  getSubcategoryBySlug,
};
