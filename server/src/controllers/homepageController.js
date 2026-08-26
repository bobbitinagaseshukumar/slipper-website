const prisma = require('../config/db');
const { successResponse } = require('../utils/responseHandler');

/**
 * Consolidated Homepage Data API
 */
const getHomepageData = async (req, res, next) => {
  try {
    const [
      banners,
      categories,
      newArrivals,
      trending,
      bestSellers,
      mensCollection,
      womensCollection,
      kidsCollection,
      reviews,
      settingsRaw,
    ] = await Promise.all([
      // 1. Hero Banners
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),

      // 2. Categories
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
      }),

      // 3. New Arrivals (Latest 8)
      prisma.product.findMany({
        where: { isActive: true, isNewArrival: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true }, orderBy: { sortOrder: 'asc' } },
          variants: { select: { size: true, colorName: true, colorCode: true } },
        },
      }),

      // 4. Trending Slippers (8)
      prisma.product.findMany({
        where: { isActive: true, isTrending: true },
        take: 8,
        orderBy: { rating: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true }, orderBy: { sortOrder: 'asc' } },
          variants: { select: { size: true, colorName: true, colorCode: true } },
        },
      }),

      // 5. Best Sellers (8)
      prisma.product.findMany({
        where: { isActive: true, isBestSeller: true },
        take: 8,
        orderBy: { reviewCount: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true }, orderBy: { sortOrder: 'asc' } },
          variants: { select: { size: true, colorName: true, colorCode: true } },
        },
      }),

      // 6. Men's Featured Collection (4)
      prisma.product.findMany({
        where: { isActive: true, gender: 'MEN' },
        take: 4,
        orderBy: { isFeatured: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true } },
        },
      }),

      // 7. Women's Featured Collection (4)
      prisma.product.findMany({
        where: { isActive: true, gender: 'WOMEN' },
        take: 4,
        orderBy: { isFeatured: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true } },
        },
      }),

      // 8. Kids' Featured Collection (4)
      prisma.product.findMany({
        where: { isActive: true, gender: 'KIDS' },
        take: 4,
        orderBy: { isFeatured: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true } },
        },
      }),

      // 9. Verified Customer Testimonials (4)
      prisma.review.findMany({
        where: { isApproved: true, rating: { gte: 4 } },
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, profileImage: true } },
          product: { select: { name: true, slug: true } },
        },
      }),

      // 10. Public Site Settings
      prisma.siteSetting.findMany({
        where: { isPublic: true },
      }),
    ]);

    // Format settings into a key-value object
    const settings = settingsRaw.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return successResponse(res, 'Homepage data loaded successfully', {
      banners,
      categories,
      newArrivals,
      trending,
      bestSellers,
      collections: {
        men: mensCollection,
        women: womensCollection,
        kids: kidsCollection,
      },
      reviews,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomepageData,
};
