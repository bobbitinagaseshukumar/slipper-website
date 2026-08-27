const prisma = require('../config/db');
const { successResponse } = require('../utils/responseHandler');

// Simple in-memory cache for homepage data (5-minute TTL)
let homepageCache = null;
let homepageCacheExpiry = 0;
const HOMEPAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Call this to invalidate cache when admin updates homepage content
const invalidateHomepageCache = () => {
  homepageCache = null;
  homepageCacheExpiry = 0;
};

/**
 * Consolidated Homepage Data API
 */
const getHomepageData = async (req, res, next) => {
  try {
    if (homepageCache && Date.now() < homepageCacheExpiry) {
      return successResponse(res, 'Homepage loaded (cached)', homepageCache);
    }

    const now = new Date();

    const [
      banners,
      categories,
      brands,
      newArrivals,
      trending,
      bestSellers,
      mensCollection,
      womensCollection,
      kidsCollection,
      reviews,
      settingsRaw,
      sections,
      festivalDeals,
      flashSales,
      offers,
      storeSettingsRecord,
    ] = await Promise.all([
      // 1. Hero Banners (Active, Published, Within Scheduled Window)
      prisma.banner.findMany({
        where: {
          isActive: true,
          status: 'PUBLISHED',
          OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: now }, endDate: null },
            { startDate: null, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: { gte: now } },
          ],
        },
        orderBy: { displayOrder: 'asc' },
      }),

      // 2. Categories (Admin Published only)
      prisma.category.findMany({
        where: { isActive: true, status: 'PUBLISHED', showOnHomepage: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          imageAlt: true,
          _count: { select: { products: { where: { isActive: true, status: 'PUBLISHED' } } } },
        },
      }),

      // 3. Brands (Admin Published only)
      prisma.brand.findMany({
        where: { isActive: true, status: 'PUBLISHED', showOnHomepage: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          imageAlt: true,
          brandingType: true,
          _count: { select: { products: { where: { isActive: true, status: 'PUBLISHED' } } } },
        },
      }),

      // 4. New Arrivals (Latest 8)
      prisma.product.findMany({
        where: { isActive: true, status: 'PUBLISHED', isNewArrival: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true }, orderBy: { sortOrder: 'asc' } },
          variants: { select: { size: true, colorName: true, colorCode: true, stock: true } },
        },
      }),

      // 5. Trending Slippers (8)
      prisma.product.findMany({
        where: { isActive: true, status: 'PUBLISHED', isTrending: true },
        take: 8,
        orderBy: { rating: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true }, orderBy: { sortOrder: 'asc' } },
          variants: { select: { size: true, colorName: true, colorCode: true, stock: true } },
        },
      }),

      // 6. Best Sellers (8)
      prisma.product.findMany({
        where: { isActive: true, status: 'PUBLISHED', isBestSeller: true },
        take: 8,
        orderBy: { reviewCount: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true }, orderBy: { sortOrder: 'asc' } },
          variants: { select: { size: true, colorName: true, colorCode: true, stock: true } },
        },
      }),

      // 7. Men's Featured Collection (4)
      prisma.product.findMany({
        where: { isActive: true, status: 'PUBLISHED', gender: 'MEN' },
        take: 4,
        orderBy: { isFeatured: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true } },
        },
      }),

      // 8. Women's Featured Collection (4)
      prisma.product.findMany({
        where: { isActive: true, status: 'PUBLISHED', gender: 'WOMEN' },
        take: 4,
        orderBy: { isFeatured: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true } },
        },
      }),

      // 9. Kids' Featured Collection (4)
      prisma.product.findMany({
        where: { isActive: true, status: 'PUBLISHED', gender: 'KIDS' },
        take: 4,
        orderBy: { isFeatured: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true } },
        },
      }),

      // 10. Verified Customer Testimonials (4)
      prisma.review.findMany({
        where: { isApproved: true, rating: { gte: 4 } },
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, profileImage: true } },
          product: { select: { name: true, slug: true } },
        },
      }),

      // 11. Public Site Settings
      prisma.siteSetting.findMany({
        where: { isPublic: true },
      }),

      // 12. Dynamic Homepage Sections & Festival Campaigns
      prisma.homepageSection.findMany({
        where: {
          isActive: true,
          OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: now }, endDate: null },
            { startDate: null, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: { gte: now } },
          ],
        },
        orderBy: { displayOrder: 'asc' },
        include: {
          products: {
            orderBy: { sortOrder: 'asc' },
            include: {
              product: {
                include: {
                  category: { select: { name: true, slug: true } },
                  images: { select: { url: true, colorName: true, isPrimary: true }, orderBy: { sortOrder: 'asc' } },
                  variants: { select: { size: true, colorName: true, colorCode: true, stock: true } },
                },
              },
            },
          },
        },
      }),

      // 13. Festival Deals
      prisma.festivalDeal.findMany({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // 14. Flash Sales
      prisma.flashSale.findMany({
        where: {
          isActive: true,
          startTime: { lte: now },
          endTime: { gte: now },
        },
        orderBy: { endTime: 'asc' },
      }),

      // 15. Special Offers
      prisma.offer.findMany({
        where: {
          isActive: true,
          OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: now }, endDate: null },
            { startDate: null, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: { gte: now } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      }),

      // 16. Store Settings Record
      prisma.storeSettings.findFirst(),
    ]);

    // Format settings into a key-value object
    const settings = settingsRaw.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const responseData = {
      banners,
      categories,
      brands,
      newArrivals,
      trending,
      bestSellers,
      collections: {
        men: mensCollection,
        women: womensCollection,
        kids: kidsCollection,
      },
      sections,
      festivalDeals,
      flashSales,
      offers,
      reviews,
      settings: {
        ...settings,
        storeName: storeSettingsRecord?.storeName || 'AuraSole',
        tagline: storeSettingsRecord?.tagline || 'Walk With Pure Luxury',
        announcementText: storeSettingsRecord?.announcementActive ? storeSettingsRecord.announcementMessage : '',
        whatsappNumber: storeSettingsRecord?.whatsappNumber || '+91 98765 43210',
        logo: storeSettingsRecord?.logo || null,
        maintenanceMode: storeSettingsRecord?.maintenanceMode || false,
      },
    };

    homepageCache = responseData;
    homepageCacheExpiry = Date.now() + HOMEPAGE_CACHE_TTL;

    return successResponse(res, 'Homepage data loaded successfully', responseData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomepageData,
  invalidateHomepageCache,
};
