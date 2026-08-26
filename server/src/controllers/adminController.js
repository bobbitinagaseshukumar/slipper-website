const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const emailService = require('../services/emailService');
const sessionService = require('../services/sessionService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Helper to record Admin Audit Activity
 */
const logAdminAction = async (adminId, action, details = null, ipAddress = null) => {
  try {
    await prisma.adminActivity.create({
      data: {
        adminId,
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
};

/**
 * 1. Admin Dashboard Analytics & Metrics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;

    const now = new Date();
    let startDate = new Date();
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else {
      // Default 30d
      startDate.setDate(now.getDate() - 30);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      completedOrdersForRevenue,
      totalCustomers,
      totalProducts,
      lowStockVariants,
      outOfStockVariants,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({
        where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'] } },
      }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      // Non-cancelled orders for gross revenue
      prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        select: { finalAmount: true, createdAt: true },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.findMany({
        where: { stock: { gt: 0, lte: 5 } },
        include: { product: { select: { name: true, slug: true } } },
        take: 5,
      }),
      prisma.productVariant.findMany({
        where: { stock: 0 },
        include: { product: { select: { name: true, slug: true } } },
        take: 5,
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    // Calculate Total Revenue and Today's Revenue
    const totalRevenue = completedOrdersForRevenue.reduce((sum, o) => sum + o.finalAmount, 0);
    const todayRevenue = completedOrdersForRevenue
      .filter((o) => new Date(o.createdAt) >= todayStart)
      .reduce((sum, o) => sum + o.finalAmount, 0);

    // Build Daily Sales Trend data points for the selected range
    const daysCount = range === '7d' ? 7 : range === 'today' ? 1 : 14;
    const chartData = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      const dayOrders = completedOrdersForRevenue.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === d.toDateString();
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.finalAmount, 0);
      chartData.push({
        date: dayKey,
        revenue: Math.round(dayRevenue),
        orders: dayOrders.length,
      });
    }

    return successResponse(res, 'Dashboard statistics loaded', {
      metrics: {
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue),
        totalOrders,
        todayOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockVariants.length,
        outOfStockCount: outOfStockVariants.length,
      },
      chartData,
      lowStockVariants,
      outOfStockVariants,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Products Management
 */
const getAdminProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search, category, status, featured } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 15);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { sku: { contains: search.trim(), mode: 'insensitive' } },
        ],
      }),
      ...(category && { categoryId: category }),
      ...(status === 'PUBLISHED' && { isActive: true }),
      ...(status === 'DRAFT' && { isActive: false }),
      ...(featured === 'true' && { isFeatured: true }),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          variants: true,
          _count: { select: { reviews: true } },
        },
      }),
    ]);

    return successResponse(res, 'Admin products retrieved', {
      products,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      shortDescription,
      description,
      brand = 'AuraSole',
      gender = 'UNISEX',
      productType = 'Slides',
      material,
      soleMaterial,
      comfortFeatures,
      price,
      originalPrice,
      categoryId,
      subcategoryId,
      isFeatured = false,
      isTrending = false,
      isNewArrival = true,
      isBestSeller = false,
      isActive = true,
      images = [],
      variants = [],
    } = req.body;

    if (!name || name.trim().length < 2) {
      return errorResponse(res, 'Product name is required.', 422);
    }
    if (!price || price <= 0) {
      return errorResponse(res, 'Valid selling price is required.', 422);
    }

    // Generate clean unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    const uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: name.trim(),
          slug: uniqueSlug,
          shortDescription,
          description: description || name,
          brand,
          gender,
          productType,
          material,
          soleMaterial,
          comfortFeatures,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          discountPercentage:
            originalPrice && originalPrice > price
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : 0,
          categoryId,
          subcategoryId: subcategoryId || null,
          isFeatured: Boolean(isFeatured),
          isTrending: Boolean(isTrending),
          isNewArrival: Boolean(isNewArrival),
          isBestSeller: Boolean(isBestSeller),
          isActive: Boolean(isActive),
          stock: variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0) || 20,
        },
      });

      // Insert Images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await tx.productImage.create({
            data: {
              productId: created.id,
              url: images[i].url,
              altText: images[i].altText || `${name} view`,
              isPrimary: i === 0 || images[i].isPrimary === true,
              sortOrder: i,
            },
          });
        }
      }

      // Insert Variants
      if (variants && variants.length > 0) {
        for (const v of variants) {
          await tx.productVariant.create({
            data: {
              productId: created.id,
              size: String(v.size || '8'),
              colorName: v.colorName || 'Black',
              colorCode: v.colorCode || '#1A1A1A',
              stock: parseInt(v.stock, 10) || 10,
              priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
              sku: `AS-${created.id.slice(0, 4)}-${v.size}-${v.colorName?.slice(0, 3)}`.toUpperCase(),
            },
          });
        }
      }

      return created;
    });

    await logAdminAction(req.user.id, 'PRODUCT_CREATED', { productId: product.id, name: product.name });

    return successResponse(res, 'Product created successfully', product, 201);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      shortDescription,
      description,
      brand,
      gender,
      productType,
      material,
      soleMaterial,
      comfortFeatures,
      price,
      originalPrice,
      categoryId,
      subcategoryId,
      isFeatured,
      isTrending,
      isNewArrival,
      isBestSeller,
      isActive,
      variants,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, 'Product not found.', 404);

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(description && { description }),
          ...(brand && { brand }),
          ...(gender && { gender }),
          ...(productType && { productType }),
          ...(material && { material }),
          ...(soleMaterial && { soleMaterial }),
          ...(comfortFeatures && { comfortFeatures }),
          ...(price && { price: parseFloat(price) }),
          ...(originalPrice !== undefined && {
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            discountPercentage:
              originalPrice && originalPrice > (price || existing.price)
                ? Math.round(((originalPrice - (price || existing.price)) / originalPrice) * 100)
                : 0,
          }),
          ...(categoryId && { categoryId }),
          ...(subcategoryId !== undefined && { subcategoryId: subcategoryId || null }),
          ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
          ...(isTrending !== undefined && { isTrending: Boolean(isTrending) }),
          ...(isNewArrival !== undefined && { isNewArrival: Boolean(isNewArrival) }),
          ...(isBestSeller !== undefined && { isBestSeller: Boolean(isBestSeller) }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        },
      });

      // Update variant stock if provided
      if (variants && Array.isArray(variants)) {
        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                ...(v.stock !== undefined && { stock: parseInt(v.stock, 10) }),
                ...(v.priceOverride !== undefined && {
                  priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
                }),
              },
            });
          }
        }
      }

      return prod;
    });

    await logAdminAction(req.user.id, 'PRODUCT_UPDATED', { productId: id, name: updated.name });

    return successResponse(res, 'Product updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, 'Product not found.', 404);

    // Soft delete / archive
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await logAdminAction(req.user.id, 'PRODUCT_ARCHIVED', { productId: id, name: existing.name });

    return successResponse(res, 'Product archived successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Orders Management
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 15);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(status && status !== 'ALL' && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search.trim(), mode: 'insensitive' } },
          { user: { name: { contains: search.trim(), mode: 'insensitive' } } },
          { user: { email: { contains: search.trim(), mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          address: true,
          items: true,
        },
      }),
    ]);

    return successResponse(res, 'Admin orders retrieved', {
      orders,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) return errorResponse(res, 'Order not found.', 404);

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingNumber && { trackingNumber }),
        ...(notes && { notes }),
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date(), paymentStatus: 'PAID' }),
      },
    });

    // Notify customer in-app
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order Status: ${status.replace(/_/g, ' ')}`,
        message: `Your slipper order #${order.orderNumber} is now ${status.toLowerCase().replace(/_/g, ' ')}.`,
        type: 'ORDER',
        link: `/account/orders/${order.orderNumber}`,
      },
    });

    // Trigger Asynchronous Email Notifications
    if (order.user) {
      if (status === 'CONFIRMED') {
        emailService.sendOrderConfirmedEmail(updated, order.user);
      } else if (status === 'SHIPPED') {
        emailService.sendOrderShippedEmail(updated, order.user, trackingNumber);
      } else if (status === 'DELIVERED') {
        emailService.sendOrderDeliveredEmail(updated, order.user);
      } else if (status === 'CANCELLED') {
        emailService.sendOrderCancelledEmail(updated, order.user, notes);
      }
    }

    await logAdminAction(req.user.id, 'ORDER_STATUS_CHANGED', {
      orderNumber: order.orderNumber,
      newStatus: status,
    });

    return successResponse(res, 'Order status updated', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Customers Management
 */
const getAdminCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search, status } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 15);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      role: 'CUSTOMER',
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { email: { contains: search.trim(), mode: 'insensitive' } },
          { phone: { contains: search.trim(), mode: 'insensitive' } },
        ],
      }),
    };

    const [total, customers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true } },
        },
      }),
    ]);

    return successResponse(res, 'Admin customers retrieved', {
      customers,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const customer = await prisma.user.findUnique({ where: { id } });
    if (!customer) return errorResponse(res, 'Customer not found.', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { status: status === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE' },
      select: { id: true, name: true, email: true, status: true },
    });

    await logAdminAction(req.user.id, 'CUSTOMER_STATUS_CHANGED', {
      customerId: id,
      newStatus: updated.status,
    });

    return successResponse(res, `Customer is now ${updated.status}`, updated);
  } catch (error) {
    next(error);
  }
};

const forceLogoutCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({ where: { id } });
    if (!customer) return errorResponse(res, 'Customer not found.', 404);

    await sessionService.revokeAllUserSessions(id, 'ADMIN_FORCE_LOGOUT', true);

    await logAdminAction(req.user.id, 'CUSTOMER_FORCE_LOGOUT_ALL_DEVICES', {
      customerId: id,
      customerEmail: customer.email,
    });

    return successResponse(
      res,
      `Customer ${customer.name || customer.email} has been forcibly logged out of all devices.`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Reviews Moderation
 */
const getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(res, 'Admin reviews retrieved', reviews);
  } catch (error) {
    next(error);
  }
};

const moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    await logAdminAction(req.user.id, 'REVIEW_MODERATED', { reviewId: id, isApproved });
    return successResponse(res, 'Review approval updated', review);
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Coupons Management
 */
const getAdminCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, 'Admin coupons retrieved', coupons);
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType = 'PERCENTAGE',
      discountValue,
      minOrderAmount = 0,
      maxDiscount,
      usageLimit,
      validUntil,
    } = req.body;

    if (!code || !discountValue) {
      return errorResponse(res, 'Coupon code and discount value are required.', 422);
    }

    const created = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount || 0),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });

    await logAdminAction(req.user.id, 'COUPON_CREATED', { code: created.code });
    return successResponse(res, 'Coupon created', created, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Banners Management
 */
const getAdminBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return successResponse(res, 'Admin banners retrieved', banners);
  } catch (error) {
    next(error);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, tagline, image, link, ctaText = 'Shop Now', isActive = true } = req.body;

    if (!title || !image) {
      return errorResponse(res, 'Title and banner image are required.', 422);
    }

    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        subtitle,
        tagline,
        image,
        link: link || '/shop',
        ctaText,
        isActive: Boolean(isActive),
      },
    });

    await logAdminAction(req.user.id, 'BANNER_CREATED', { bannerId: banner.id, title });
    return successResponse(res, 'Banner created', banner, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Audit Logs
 */
const getAdminAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.adminActivity.findMany({
      take: 40,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { name: true, email: true, role: true } },
      },
    });
    return successResponse(res, 'Audit logs retrieved', logs);
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Subcategories Management
 */
const getSubCategories = async (req, res, next) => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { category: { select: { name: true, slug: true } } },
    });
    return successResponse(res, 'Subcategories retrieved', subCategories);
  } catch (error) {
    next(error);
  }
};

const createSubCategory = async (req, res, next) => {
  try {
    const { categoryId, name, slug, description } = req.body;
    if (!categoryId || !name) {
      return errorResponse(res, 'Category ID and Subcategory Name are required.', 400);
    }
    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sub = await prisma.subCategory.create({
      data: {
        categoryId,
        name: name.trim(),
        slug: cleanSlug,
        description,
      },
    });
    await logAdminAction(req.user.id, 'SUBCATEGORY_CREATED', { subCategoryId: sub.id, name });
    return successResponse(res, 'Subcategory created', sub, 201);
  } catch (error) {
    next(error);
  }
};

const deleteSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.subCategory.delete({ where: { id } });
    await logAdminAction(req.user.id, 'SUBCATEGORY_DELETED', { subCategoryId: id });
    return successResponse(res, 'Subcategory deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Offers & Deals Management
 */
const getOffers = async (req, res, next) => {
  try {
    const offers = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(res, 'Offers retrieved', offers);
  } catch (error) {
    next(error);
  }
};

const createOffer = async (req, res, next) => {
  try {
    const { title, code, discountType, discountValue, description, badgeText, bannerUrl } = req.body;
    if (!title || discountValue === undefined) {
      return errorResponse(res, 'Title and discount value are required.', 400);
    }
    const offer = await prisma.offer.create({
      data: {
        title: title.trim(),
        code: code ? code.trim().toUpperCase() : null,
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        description,
        badgeText,
        bannerUrl,
      },
    });
    await logAdminAction(req.user.id, 'OFFER_CREATED', { offerId: offer.id, title });
    return successResponse(res, 'Offer created', offer, 201);
  } catch (error) {
    next(error);
  }
};

const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.offer.delete({ where: { id } });
    await logAdminAction(req.user.id, 'OFFER_DELETED', { offerId: id });
    return successResponse(res, 'Offer deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * 11. Festival Deals Management
 */
const getFestivalDeals = async (req, res, next) => {
  try {
    const deals = await prisma.festivalDeal.findMany({ orderBy: { startDate: 'desc' } });
    return successResponse(res, 'Festival deals retrieved', deals);
  } catch (error) {
    next(error);
  }
};

const createFestivalDeal = async (req, res, next) => {
  try {
    const { festivalName, title, description, bannerUrl, discountPercentage, startDate, endDate, couponCode } = req.body;
    if (!festivalName || !title || !discountPercentage) {
      return errorResponse(res, 'Festival name, title, and discount percentage are required.', 400);
    }
    const deal = await prisma.festivalDeal.create({
      data: {
        festivalName: festivalName.trim(),
        title: title.trim(),
        description,
        bannerUrl,
        discountPercentage: parseFloat(discountPercentage),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 86400000),
        couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
      },
    });
    await logAdminAction(req.user.id, 'FESTIVAL_DEAL_CREATED', { dealId: deal.id, title });
    return successResponse(res, 'Festival deal created', deal, 201);
  } catch (error) {
    next(error);
  }
};

const deleteFestivalDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.festivalDeal.delete({ where: { id } });
    await logAdminAction(req.user.id, 'FESTIVAL_DEAL_DELETED', { dealId: id });
    return successResponse(res, 'Festival deal deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * 12. Flash Sales Management
 */
const getFlashSales = async (req, res, next) => {
  try {
    const sales = await prisma.flashSale.findMany({ orderBy: { startTime: 'desc' } });
    return successResponse(res, 'Flash sales retrieved', sales);
  } catch (error) {
    next(error);
  }
};

const createFlashSale = async (req, res, next) => {
  try {
    const { title, discountPercentage, startTime, endTime, stockLimit, bannerUrl } = req.body;
    if (!title || !discountPercentage) {
      return errorResponse(res, 'Title and discount percentage are required.', 400);
    }
    const sale = await prisma.flashSale.create({
      data: {
        title: title.trim(),
        discountPercentage: parseFloat(discountPercentage),
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 24 * 3600000),
        stockLimit: parseInt(stockLimit, 10) || 50,
        bannerUrl,
      },
    });
    await logAdminAction(req.user.id, 'FLASH_SALE_CREATED', { saleId: sale.id, title });
    return successResponse(res, 'Flash sale created', sale, 201);
  } catch (error) {
    next(error);
  }
};

const deleteFlashSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.flashSale.delete({ where: { id } });
    await logAdminAction(req.user.id, 'FLASH_SALE_DELETED', { saleId: id });
    return successResponse(res, 'Flash sale deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * 13. Customer Permanent Deletion (with Confirmation)
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return errorResponse(res, 'Customer not found.', 404);
    if (target.role === 'SUPER_ADMIN') {
      return errorResponse(res, 'Super Administrator accounts cannot be deleted.', 403);
    }

    await prisma.user.delete({ where: { id } });
    await logAdminAction(req.user.id, 'CUSTOMER_DELETED', { customerId: id, email: target.email });
    return successResponse(res, 'Customer permanently deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  updateCustomerStatus,
  deleteCustomer,
  forceLogoutCustomer,
  getAdminReviews,
  moderateReview,
  getAdminCoupons,
  createCoupon,
  getAdminBanners,
  createBanner,
  getSubCategories,
  createSubCategory,
  deleteSubCategory,
  getOffers,
  createOffer,
  deleteOffer,
  getFestivalDeals,
  createFestivalDeal,
  deleteFestivalDeal,
  getFlashSales,
  createFlashSale,
  deleteFlashSale,
  getAdminAuditLogs,

  // Categories CRUD
  createCategory: async (req, res, next) => {
    try {
      const { name, slug, description, image, displayOrder, isActive } = req.body;
      if (!name) {
        return errorResponse(res, 'Category name is required.', 400);
      }
      const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cat = await prisma.category.create({
        data: {
          name: name.trim(),
          slug: cleanSlug,
          description,
          image: image || 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800',
          displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        },
      });
      await logAdminAction(req.user.id, 'CATEGORY_CREATED', { categoryId: cat.id, name });
      return successResponse(res, 'Category created successfully.', cat, 201);
    } catch (error) {
      if (error.code === 'P2002') {
        return errorResponse(res, 'A category with this slug already exists.', 400);
      }
      next(error);
    }
  },

  updateCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, slug, description, image, displayOrder, isActive } = req.body;
      const updateData = {};
      if (name) {
        updateData.name = name.trim();
        updateData.slug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder, 10);
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      const cat = await prisma.category.update({
        where: { id },
        data: updateData,
      });
      await logAdminAction(req.user.id, 'CATEGORY_UPDATED', { categoryId: id });
      return successResponse(res, 'Category updated successfully.', cat);
    } catch (error) {
      next(error);
    }
  },

  deleteCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      await prisma.category.delete({ where: { id } });
      await logAdminAction(req.user.id, 'CATEGORY_DELETED', { categoryId: id });
      return successResponse(res, 'Category deleted successfully.');
    } catch (error) {
      next(error);
    }
  },
};
