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
      brandId,
      brandingType = 'Normal Branding',
      gender = 'UNISEX',
      productType = 'Slides',
      material,
      soleMaterial,
      upperMaterial,
      occasion,
      comfortFeatures,
      careInstructions,
      countryOfOrigin = 'India',
      price,
      originalPrice,
      shippingFee = 0,
      lowStockThreshold = 3,
      status = 'PUBLISHED',
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
    if (!price || parseFloat(price) <= 0) {
      return errorResponse(res, 'Valid selling price is required.', 422);
    }
    if (!categoryId) {
      return errorResponse(res, 'Product category is required.', 422);
    }

    // Validate that subcategory belongs to category
    if (subcategoryId) {
      const sub = await prisma.subCategory.findUnique({ where: { id: subcategoryId } });
      if (!sub || sub.categoryId !== categoryId) {
        return errorResponse(res, 'The selected subcategory does not belong to the selected category.', 422);
      }
    }

    // Resolve brand name from brandId if provided
    let resolvedBrand = brand ? brand.trim() : 'AuraSole';
    if (brandId) {
      const b = await prisma.brand.findUnique({ where: { id: brandId } });
      if (b) resolvedBrand = b.name;
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
          brand: resolvedBrand,
          brandId: brandId || null,
          brandingType: brandingType || 'Normal Branding',
          gender,
          productType,
          material,
          soleMaterial,
          upperMaterial,
          occasion,
          comfortFeatures,
          careInstructions,
          countryOfOrigin: countryOfOrigin || 'India',
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          discountPercentage:
            originalPrice && parseFloat(originalPrice) > parseFloat(price)
              ? Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)
              : 0,
          shippingFee: parseFloat(shippingFee) || 0,
          lowStockThreshold: parseInt(lowStockThreshold, 10) || 3,
          status: status || (isActive ? 'PUBLISHED' : 'DRAFT'),
          categoryId,
          subcategoryId: subcategoryId || null,
          isFeatured: Boolean(isFeatured),
          isTrending: Boolean(isTrending),
          isNewArrival: Boolean(isNewArrival),
          isBestSeller: Boolean(isBestSeller),
          isActive: status === 'PUBLISHED' || Boolean(isActive),
          stock: variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0) || 20,
        },
      });

      // Insert Images (with colorName support)
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].url;
          const imgColorName = typeof images[i] === 'object' ? images[i].colorName : null;
          const imgAlt = typeof images[i] === 'object' ? images[i].altText : null;
          const imgPrimary = typeof images[i] === 'object' ? Boolean(images[i].isPrimary) : i === 0;

          if (imgUrl && imgUrl.trim().length > 3) {
            await tx.productImage.create({
              data: {
                productId: created.id,
                url: imgUrl.trim(),
                altText: imgAlt || `${name} photo`,
                colorName: imgColorName || null,
                isPrimary: imgPrimary,
                sortOrder: i,
              },
            });
          }
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
              stock: parseInt(v.stock, 10) || 0,
              priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
              sku: v.sku || `AS-${created.id.slice(0, 4)}-${v.size}-${(v.colorName || 'DEF').slice(0, 3)}`.toUpperCase(),
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
      brandId,
      brandingType,
      gender,
      productType,
      material,
      soleMaterial,
      upperMaterial,
      occasion,
      comfortFeatures,
      careInstructions,
      countryOfOrigin,
      price,
      originalPrice,
      shippingFee,
      lowStockThreshold,
      status,
      categoryId,
      subcategoryId,
      isFeatured,
      isTrending,
      isNewArrival,
      isBestSeller,
      isActive,
      images,
      variants,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, 'Product not found.', 404);

    const targetCategoryId = categoryId || existing.categoryId;

    // Validate that subcategory belongs to category
    if (subcategoryId) {
      const sub = await prisma.subCategory.findUnique({ where: { id: subcategoryId } });
      if (!sub || sub.categoryId !== targetCategoryId) {
        return errorResponse(res, 'The selected subcategory does not belong to the selected category.', 422);
      }
    }

    // Resolve brand name from brandId if provided
    let resolvedBrand = brand ? brand.trim() : undefined;
    if (brandId) {
      const b = await prisma.brand.findUnique({ where: { id: brandId } });
      if (b) resolvedBrand = b.name;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(description && { description }),
          ...(resolvedBrand && { brand: resolvedBrand }),
          ...(brandId !== undefined && { brandId: brandId || null }),
          ...(brandingType && { brandingType }),
          ...(gender && { gender }),
          ...(productType && { productType }),
          ...(material && { material }),
          ...(soleMaterial && { soleMaterial }),
          ...(upperMaterial !== undefined && { upperMaterial }),
          ...(occasion !== undefined && { occasion }),
          ...(comfortFeatures && { comfortFeatures }),
          ...(careInstructions !== undefined && { careInstructions }),
          ...(countryOfOrigin !== undefined && { countryOfOrigin }),
          ...(price && { price: parseFloat(price) }),
          ...(originalPrice !== undefined && {
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            discountPercentage:
              originalPrice && parseFloat(originalPrice) > (price || existing.price)
                ? Math.round(((parseFloat(originalPrice) - (price || existing.price)) / parseFloat(originalPrice)) * 100)
                : 0,
          }),
          ...(shippingFee !== undefined && { shippingFee: parseFloat(shippingFee) }),
          ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold, 10) }),
          ...(status && {
            status,
            isActive: status === 'PUBLISHED',
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

      // If images array passed, replace product images
      if (images && Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        for (let i = 0; i < images.length; i++) {
          const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].url;
          const imgColorName = typeof images[i] === 'object' ? images[i].colorName : null;
          const imgAlt = typeof images[i] === 'object' ? images[i].altText : null;
          const imgPrimary = typeof images[i] === 'object' ? Boolean(images[i].isPrimary) : i === 0;

          if (imgUrl && imgUrl.trim().length > 3) {
            await tx.productImage.create({
              data: {
                productId: id,
                url: imgUrl.trim(),
                altText: imgAlt || `${prod.name} photo`,
                colorName: imgColorName || null,
                isPrimary: imgPrimary,
                sortOrder: i,
              },
            });
          }
        }
      }

      // If variants passed, update or recreate
      if (variants && Array.isArray(variants) && variants.length > 0) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        for (const v of variants) {
          await tx.productVariant.create({
            data: {
              productId: id,
              size: String(v.size || '8'),
              colorName: v.colorName || 'Black',
              colorCode: v.colorCode || '#1A1A1A',
              stock: parseInt(v.stock, 10) || 0,
              priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
              sku: v.sku || `AS-${id.slice(0, 4)}-${v.size}-${(v.colorName || 'DEF').slice(0, 3)}`.toUpperCase(),
            },
          });
        }

        // Recalculate total stock
        const totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
        await tx.product.update({
          where: { id },
          data: { stock: totalStock },
        });
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
/**
 * 3. Orders Management
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      status,
      search,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(status && status !== 'ALL' && { status }),
      ...(paymentMethod && paymentMethod !== 'ALL' && { paymentMethod }),
      ...(paymentStatus && paymentStatus !== 'ALL' && { paymentStatus }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search.trim(), mode: 'insensitive' } },
          { user: { name: { contains: search.trim(), mode: 'insensitive' } } },
          { user: { email: { contains: search.trim(), mode: 'insensitive' } } },
          { user: { phone: { contains: search.trim(), mode: 'insensitive' } } },
          { trackingNumber: { contains: search.trim(), mode: 'insensitive' } },
          { items: { some: { productName: { contains: search.trim(), mode: 'insensitive' } } } },
        ],
      }),
    };

    const [total, orders, statusCounts, unreadAlertsCount] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              whatsappNumber: true,
              profileImage: true,
              status: true,
            },
          },
          address: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
                },
              },
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.adminNotification.count({
        where: { isRead: false, type: 'NEW_ORDER' },
      }),
    ]);

    const counts = {
      ALL: 0,
      PENDING: 0,
      APPROVED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    statusCounts.forEach((sc) => {
      counts[sc.status] = sc._count.status;
      counts.ALL += sc._count.status;
    });

    return successResponse(res, 'Admin orders retrieved', {
      orders,
      counts,
      unreadNewOrdersCount: unreadAlertsCount,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsappNumber: true,
            profileImage: true,
            customFields: true,
            status: true,
            isBlocked: true,
            createdAt: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                brand: true,
                category: { select: { name: true } },
                images: { select: { url: true, isPrimary: true } },
              },
            },
            variant: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) return errorResponse(res, 'Order not found.', 404);

    return successResponse(res, 'Order details retrieved', order);
  } catch (error) {
    next(error);
  }
};

const approveOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      cancellationDeadline,
      shippingDate,
      expectedDeliveryDate,
      courierName,
      trackingNumber,
      trackingUrl,
      adminNotes,
      deliveryNotes,
    } = req.body;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { user: true, items: true },
    });

    if (!order) return errorResponse(res, 'Order not found.', 404);

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED' && order.status !== 'WHATSAPP_PENDING') {
      return errorResponse(res, `Cannot approve order currently in ${order.status} status.`, 400);
    }

    // Validate dates
    const parsedDeadline = cancellationDeadline ? new Date(cancellationDeadline) : new Date(Date.now() + 24 * 3600 * 1000);
    const parsedShipping = shippingDate ? new Date(shippingDate) : null;
    const parsedDelivery = expectedDeliveryDate ? new Date(expectedDeliveryDate) : null;

    if (parsedShipping && parsedDelivery && parsedDelivery < parsedShipping) {
      return errorResponse(res, 'Expected delivery date cannot be earlier than shipping date.', 422);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'APPROVED',
          cancellationDeadline: parsedDeadline,
          shippingDate: parsedShipping,
          expectedDeliveryDate: parsedDelivery,
          courierName: courierName ? courierName.trim() : order.courierName,
          trackingNumber: trackingNumber ? trackingNumber.trim() : order.trackingNumber,
          trackingUrl: trackingUrl ? trackingUrl.trim() : order.trackingUrl,
          adminNotes: adminNotes ? adminNotes.trim() : order.adminNotes,
          deliveryNotes: deliveryNotes ? deliveryNotes.trim() : order.deliveryNotes,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'APPROVED',
          actorRole: 'ADMIN',
          actorId: req.user.id,
          comment: `Order approved by admin. Cancellation available until ${parsedDeadline.toLocaleString('en-IN')}.`,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.userId,
          title: `Order Approved: #${order.orderNumber}`,
          message: `Your slipper order #${order.orderNumber} has been approved. You may cancel until ${parsedDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: 'ORDER',
          link: `/account/orders/${order.orderNumber}`,
        },
      });

      return ord;
    });

    if (order.user) {
      emailService.sendOrderConfirmedEmail(updated, order.user);
    }

    await logAdminAction(req.user.id, 'ORDER_APPROVED', {
      orderNumber: order.orderNumber,
      cancellationDeadline: parsedDeadline,
    });

    return successResponse(res, 'Order approved successfully.', updated);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      trackingNumber,
      courierName,
      trackingUrl,
      shippingDate,
      expectedDeliveryDate,
      notes,
      adminNotes,
      cancellationReason,
    } = req.body;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { user: true, items: true },
    });

    if (!order) return errorResponse(res, 'Order not found.', 404);

    const now = new Date();
    const isShipped = status === 'SHIPPED';
    const isDelivered = status === 'DELIVERED';
    const isCancelled = status === 'CANCELLED';

    const updated = await prisma.$transaction(async (tx) => {
      // 1. If cancelling, restore inventory stock
      if (isCancelled && order.status !== 'CANCELLED') {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      // 2. Update Order
      const ord = await tx.order.update({
        where: { id: order.id },
        data: {
          ...(status && { status }),
          ...(trackingNumber !== undefined && { trackingNumber: trackingNumber ? trackingNumber.trim() : null }),
          ...(courierName !== undefined && { courierName: courierName ? courierName.trim() : null }),
          ...(trackingUrl !== undefined && { trackingUrl: trackingUrl ? trackingUrl.trim() : null }),
          ...(shippingDate && { shippingDate: new Date(shippingDate) }),
          ...(expectedDeliveryDate && { expectedDeliveryDate: new Date(expectedDeliveryDate) }),
          ...(notes !== undefined && { notes }),
          ...(adminNotes !== undefined && { adminNotes }),
          ...(isShipped && { shippedAt: now }),
          ...(isDelivered && { deliveredAt: now, paymentStatus: 'PAID' }),
          ...(isCancelled && {
            cancelledAt: now,
            cancelledBy: 'ADMIN',
            cancellationReason: cancellationReason || 'Cancelled by administrator.',
          }),
        },
      });

      // 3. Record OrderStatusHistory
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: status || order.status,
          actorRole: 'ADMIN',
          actorId: req.user.id,
          comment: isCancelled
            ? (cancellationReason || 'Cancelled by store administrator.')
            : isShipped
            ? `Shipped via ${courierName || 'Express Courier'} (Tracking: ${trackingNumber || 'N/A'})`
            : isDelivered
            ? 'Delivered to customer doorstep.'
            : `Order transitioned to ${status}.`,
        },
      });

      // 4. Create in-app Customer Notification
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: isDelivered
            ? `Order Delivered: #${order.orderNumber} 🎉`
            : isShipped
            ? `Order Shipped: #${order.orderNumber} 🚚`
            : isCancelled
            ? `Order Cancelled: #${order.orderNumber}`
            : `Order Update: #${order.orderNumber} (${status})`,
          message: isDelivered
            ? `Your order #${order.orderNumber} has been delivered! Tap to leave a verified review.`
            : isShipped
            ? `Your order #${order.orderNumber} is on the way! Courier: ${courierName || 'Standard'} ${trackingNumber ? `(${trackingNumber})` : ''}`
            : isCancelled
            ? `Your order #${order.orderNumber} was cancelled. ${cancellationReason || ''}`
            : `Your order #${order.orderNumber} status changed to ${status.toLowerCase().replace(/_/g, ' ')}.`,
          type: isDelivered ? 'ORDER_DELIVERED' : isShipped ? 'ORDER_SHIPPED' : 'ORDER',
          link: `/account/orders/${order.orderNumber}`,
        },
      });

      return ord;
    });

    // 5. Trigger Asynchronous Transactional Emails
    if (order.user) {
      if (status === 'SHIPPED') {
        emailService.sendOrderShippedEmail(updated, order.user, trackingNumber);
      } else if (status === 'DELIVERED') {
        emailService.sendOrderDeliveredEmail(updated, order.user);
      } else if (status === 'CANCELLED') {
        emailService.sendOrderCancelledEmail(updated, order.user, cancellationReason || 'Cancelled by store administrator.');
      }
    }

    await logAdminAction(req.user.id, 'ORDER_STATUS_CHANGED', {
      orderNumber: order.orderNumber,
      newStatus: status,
      trackingNumber,
    });

    return successResponse(res, `Order #${order.orderNumber} updated to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Admin Notification Center (🔴 Red Alerts & Unread Badges)
 */
const getAdminNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(type && type !== 'ALL' && { type }),
    };

    const [total, unreadCount, newOrdersCount, notifications] = await Promise.all([
      prisma.adminNotification.count({ where }),
      prisma.adminNotification.count({ where: { isRead: false } }),
      prisma.adminNotification.count({ where: { isRead: false, type: 'NEW_ORDER' } }),
      prisma.adminNotification.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse(res, 'Admin notifications retrieved', {
      notifications,
      unreadCount,
      newOrdersCount,
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

const markAdminNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return successResponse(res, 'Notification marked as read', updated);
  } catch (error) {
    next(error);
  }
};

const markAllAdminNotificationsRead = async (req, res, next) => {
  try {
    await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return successResponse(res, 'All admin notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Customers Management (Deep Directory, Profiles, Addresses, Orders & Security)
 */
const getAdminCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search, status, filter } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      role: 'CUSTOMER',
      ...(status && status !== 'ALL' && { status }),
      ...(filter === 'WITH_ORDERS' && { orders: { some: {} } }),
      ...(filter === 'NO_ORDERS' && { orders: { none: {} } }),
      ...(filter === 'BLOCKED' && { isBlocked: true }),
      ...(search && {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { email: { contains: search.trim(), mode: 'insensitive' } },
          { phone: { contains: search.trim(), mode: 'insensitive' } },
          { whatsappNumber: { contains: search.trim(), mode: 'insensitive' } },
          { id: { contains: search.trim(), mode: 'insensitive' } },
        ],
      }),
    };

    const [total, rawCustomers] = await Promise.all([
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
          whatsappNumber: true,
          profileImage: true,
          status: true,
          isBlocked: true,
          blockedReason: true,
          adminNotes: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true, addresses: true } },
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { finalAmount: true, createdAt: true, status: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    // Calculate customer total spent deterministically
    const customers = await Promise.all(
      rawCustomers.map(async (c) => {
        const spendingAgg = await prisma.order.aggregate({
          where: { userId: c.id, status: { not: 'CANCELLED' } },
          _sum: { finalAmount: true },
        });
        return {
          ...c,
          totalSpent: spendingAgg._sum.finalAmount || 0,
          lastOrderDate: c.orders[0]?.createdAt || null,
        };
      })
    );

    return successResponse(res, 'Admin customers retrieved', {
      customers,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCustomerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
        notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
        sessions: { where: { isRevoked: false }, orderBy: { lastActivityAt: 'desc' } },
        _count: { select: { orders: true, reviews: true, addresses: true } },
      },
    });

    if (!customer) return errorResponse(res, 'Customer not found.', 404);

    // Calculate real stats
    const totalSpentAgg = await prisma.order.aggregate({
      where: { userId: id, status: { not: 'CANCELLED' } },
      _sum: { finalAmount: true },
    });

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: { userId: id },
      _count: { status: true },
    });

    const counts = {
      total: customer.orders.length,
      pending: 0,
      approved: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalSpent: totalSpentAgg._sum.finalAmount || 0,
    };

    statusCounts.forEach((sc) => {
      if (counts[sc.status.toLowerCase()] !== undefined) {
        counts[sc.status.toLowerCase()] = sc._count.status;
      }
    });

    return successResponse(res, 'Customer details retrieved', {
      customer,
      stats: counts,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomerAdminNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { adminNotes: adminNotes ? adminNotes.trim() : null },
      select: { id: true, adminNotes: true },
    });

    await logAdminAction(req.user.id, 'CUSTOMER_NOTES_UPDATED', { customerId: id });
    return successResponse(res, 'Admin notes updated.', updated);
  } catch (error) {
    next(error);
  }
};

const forcePasswordResetCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await prisma.user.findUnique({ where: { id } });
    if (!customer) return errorResponse(res, 'Customer not found.', 404);

    const authService = require('../services/authService');
    await authService.forgotPassword(customer.email);

    await logAdminAction(req.user.id, 'CUSTOMER_FORCE_PASSWORD_RESET', {
      customerId: id,
      customerEmail: customer.email,
    });

    return successResponse(res, `Password reset email dispatched to ${customer.email}.`);
  } catch (error) {
    next(error);
  }
};

const softDeleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await prisma.user.findUnique({ where: { id } });
    if (!customer) return errorResponse(res, 'Customer not found.', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: {
        status: 'DELETED',
        isBlocked: true,
        blockedReason: 'Account deactivated/deleted by administrator. Historical orders preserved.',
      },
    });

    await sessionService.revokeAllUserSessions(id, 'ADMIN_DEACTIVATE_ACCOUNT', true);

    await logAdminAction(req.user.id, 'CUSTOMER_DEACTIVATED', { customerId: id });
    return successResponse(res, `Customer ${customer.name || customer.email} deactivated. Order history preserved.`);
  } catch (error) {
    next(error);
  }
};

const updateCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, blockedReason } = req.body;

    const customer = await prisma.user.findUnique({ where: { id } });
    if (!customer) return errorResponse(res, 'Customer not found.', 404);

    const isBlocked = status === 'BLOCKED';

    const updated = await prisma.user.update({
      where: { id },
      data: {
        status: isBlocked ? 'BLOCKED' : 'ACTIVE',
        isBlocked,
        blockedReason: isBlocked ? (blockedReason || 'Temporarily blocked by administrator.') : null,
      },
      select: { id: true, name: true, email: true, status: true, isBlocked: true, blockedReason: true },
    });

    if (isBlocked) {
      await sessionService.revokeAllUserSessions(id, 'ADMIN_BLOCK_USER', true);
    }

    await logAdminAction(req.user.id, isBlocked ? 'ACCOUNT_BLOCKED' : 'ACCOUNT_UNBLOCKED', {
      customerId: id,
      newStatus: updated.status,
      blockedReason: updated.blockedReason,
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
    const {
      title,
      subtitle,
      tagline,
      image,
      mobileImage,
      link,
      ctaText = 'Shop Now',
      badge,
      startDate,
      endDate,
      status = 'PUBLISHED',
      targetType,
      targetId,
      isActive = true,
    } = req.body;

    if (!title || !image) {
      return errorResponse(res, 'Title and banner image are required.', 422);
    }

    // Get max display order
    const maxOrder = await prisma.banner.aggregate({ _max: { displayOrder: true } });
    const nextOrder = (maxOrder._max.displayOrder || 0) + 1;

    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        subtitle,
        tagline,
        image,
        mobileImage,
        link: link || '/shop',
        ctaText,
        badge,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        targetType,
        targetId,
        displayOrder: nextOrder,
        isActive: Boolean(isActive),
      },
    });

    await logAdminAction(req.user.id, 'BANNER_CREATED', { bannerId: banner.id, title });
    return successResponse(res, 'Banner created successfully', banner, 201);
  } catch (error) {
    next(error);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      tagline,
      image,
      mobileImage,
      link,
      ctaText,
      badge,
      startDate,
      endDate,
      status,
      targetType,
      targetId,
      isActive,
      displayOrder,
    } = req.body;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Banner not found.', 404);
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(subtitle !== undefined && { subtitle }),
        ...(tagline !== undefined && { tagline }),
        ...(image !== undefined && { image }),
        ...(mobileImage !== undefined && { mobileImage }),
        ...(link !== undefined && { link }),
        ...(ctaText !== undefined && { ctaText }),
        ...(badge !== undefined && { badge }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status !== undefined && { status }),
        ...(targetType !== undefined && { targetType }),
        ...(targetId !== undefined && { targetId }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) }),
      },
    });

    await logAdminAction(req.user.id, 'BANNER_UPDATED', { bannerId: id, title: updated.title });
    return successResponse(res, 'Banner updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Banner not found.', 404);
    }

    await prisma.banner.delete({ where: { id } });
    await logAdminAction(req.user.id, 'BANNER_DELETED', { bannerId: id, title: existing.title });
    return successResponse(res, 'Banner deleted successfully');
  } catch (error) {
    next(error);
  }
};

const reorderBanners = async (req, res, next) => {
  try {
    const { bannerOrders } = req.body;
    if (!Array.isArray(bannerOrders)) {
      return errorResponse(res, 'bannerOrders array is required.', 400);
    }

    await Promise.all(
      bannerOrders.map((item, index) =>
        prisma.banner.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder ?? index + 1 },
        })
      )
    );

    await logAdminAction(req.user.id, 'BANNERS_REORDERED', { count: bannerOrders.length });
    return successResponse(res, 'Banners layout reordered successfully');
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
    const { categoryId, search, status } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status && status !== 'ALL') where.status = status;

    const subCategories = await prisma.subCategory.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
    return successResponse(res, 'Subcategories retrieved', subCategories);
  } catch (error) {
    next(error);
  }
};

const createSubCategory = async (req, res, next) => {
  try {
    const {
      categoryId,
      name,
      slug,
      description,
      image,
      imageAlt,
      status = 'PUBLISHED',
      displayOrder,
      showOnHomepage = false,
      seoTitle,
      seoDescription,
      isActive = true,
    } = req.body;

    if (!categoryId || !name || name.trim().length < 2) {
      return errorResponse(res, 'Category ID and Subcategory Name are required.', 400);
    }
    const cleanSlug = (slug || `${name}-${Date.now().toString().slice(-4)}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const maxOrder = await prisma.subCategory.findFirst({
      where: { categoryId },
      orderBy: { displayOrder: 'desc' },
    });
    const orderNum = displayOrder !== undefined ? parseInt(displayOrder, 10) : (maxOrder?.displayOrder || 0) + 1;

    const sub = await prisma.subCategory.create({
      data: {
        categoryId,
        name: name.trim(),
        slug: cleanSlug,
        description: description ? description.trim() : null,
        image: image || null,
        imageAlt: imageAlt || name.trim(),
        status: status || 'PUBLISHED',
        displayOrder: orderNum,
        showOnHomepage: Boolean(showOnHomepage),
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        isActive: status === 'PUBLISHED' && Boolean(isActive),
      },
      include: { category: { select: { name: true, slug: true } } },
    });

    await logAdminAction(req.user.id, 'SUBCATEGORY_CREATED', { subCategoryId: sub.id, name: sub.name });
    return successResponse(res, 'Subcategory created successfully.', sub, 201);
  } catch (error) {
    next(error);
  }
};

const updateSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      name,
      slug,
      description,
      image,
      imageAlt,
      status,
      displayOrder,
      showOnHomepage,
      seoTitle,
      seoDescription,
      isActive,
    } = req.body;

    const updateData = {};
    if (categoryId) updateData.categoryId = categoryId;
    if (name) {
      updateData.name = name.trim();
      if (slug) {
        updateData.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    }
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (image !== undefined) updateData.image = image;
    if (imageAlt !== undefined) updateData.imageAlt = imageAlt;
    if (status !== undefined) {
      updateData.status = status;
      updateData.isActive = status === 'PUBLISHED';
    }
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder, 10);
    if (showOnHomepage !== undefined) updateData.showOnHomepage = Boolean(showOnHomepage);
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const sub = await prisma.subCategory.update({
      where: { id },
      data: updateData,
      include: { category: { select: { name: true, slug: true } } },
    });

    await logAdminAction(req.user.id, 'SUBCATEGORY_UPDATED', { subCategoryId: id, name: sub.name });
    return successResponse(res, 'Subcategory updated successfully.', sub);
  } catch (error) {
    next(error);
  }
};

const reorderSubCategories = async (req, res, next) => {
  try {
    const { subCategoryOrders } = req.body; // [{ id, displayOrder }]
    if (!subCategoryOrders || !Array.isArray(subCategoryOrders)) {
      return errorResponse(res, 'Invalid subCategoryOrders array.', 400);
    }

    await prisma.$transaction(
      subCategoryOrders.map((item) =>
        prisma.subCategory.update({
          where: { id: item.id },
          data: { displayOrder: parseInt(item.displayOrder, 10) },
        })
      )
    );

    await logAdminAction(req.user.id, 'SUBCATEGORIES_REORDERED', { count: subCategoryOrders.length });
    return successResponse(res, 'Subcategories reordered successfully.');
  } catch (error) {
    next(error);
  }
};

const deleteSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force = false } = req.query;

    const count = await prisma.product.count({ where: { subcategoryId: id } });
    if (count > 0 && !force) {
      return errorResponse(
        res,
        `Cannot delete subcategory. It is assigned to ${count} products. Please reassign products or archive this subcategory.`,
        400,
        { productCount: count, safeAction: 'ARCHIVE' }
      );
    }

    await prisma.subCategory.delete({ where: { id } });
    await logAdminAction(req.user.id, 'SUBCATEGORY_DELETED', { subCategoryId: id });
    return successResponse(res, 'Subcategory deleted successfully.');
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
  updateBanner,
  deleteBanner,
  reorderBanners,
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

  // ==========================================
  // 12. CATEGORY MANAGEMENT
  // ==========================================

  getAdminCategories: async (req, res, next) => {
    try {
      const { search, status } = req.query;
      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (status && status !== 'ALL') where.status = status;

      const categories = await prisma.category.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        include: {
          subCategories: {
            orderBy: { displayOrder: 'asc' },
            include: {
              _count: { select: { products: true } },
            },
          },
          _count: {
            select: { products: true },
          },
        },
      });

      return successResponse(res, 'Admin categories loaded successfully.', categories);
    } catch (error) {
      next(error);
    }
  },

  createCategory: async (req, res, next) => {
    try {
      const {
        name,
        slug,
        description,
        image,
        imageAlt,
        status = 'PUBLISHED',
        displayOrder,
        showOnHomepage = true,
        seoTitle,
        seoDescription,
        isActive = true,
      } = req.body;

      if (!name || name.trim().length < 2) {
        return errorResponse(res, 'Category name is required.', 400);
      }
      const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Check duplicate slug
      const existing = await prisma.category.findFirst({
        where: {
          OR: [{ name: { equals: name.trim(), mode: 'insensitive' } }, { slug: cleanSlug }],
        },
      });
      if (existing) {
        return errorResponse(res, 'A category with this name or slug already exists.', 400);
      }

      const maxOrder = await prisma.category.findFirst({ orderBy: { displayOrder: 'desc' } });
      const orderNum = displayOrder !== undefined ? parseInt(displayOrder, 10) : (maxOrder?.displayOrder || 0) + 1;

      const cat = await prisma.category.create({
        data: {
          name: name.trim(),
          slug: cleanSlug,
          description: description ? description.trim() : null,
          image: image || null,
          imageAlt: imageAlt || name.trim(),
          status: status || 'PUBLISHED',
          displayOrder: orderNum,
          showOnHomepage: Boolean(showOnHomepage),
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          isActive: status === 'PUBLISHED' && Boolean(isActive),
        },
      });

      await logAdminAction(req.user.id, 'CATEGORY_CREATED', { categoryId: cat.id, name: cat.name });
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
      const {
        name,
        slug,
        description,
        image,
        imageAlt,
        status,
        displayOrder,
        showOnHomepage,
        seoTitle,
        seoDescription,
        isActive,
      } = req.body;

      const updateData = {};
      if (name) {
        updateData.name = name.trim();
        updateData.slug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (description !== undefined) updateData.description = description ? description.trim() : null;
      if (image !== undefined) updateData.image = image;
      if (imageAlt !== undefined) updateData.imageAlt = imageAlt;
      if (status !== undefined) {
        updateData.status = status;
        updateData.isActive = status === 'PUBLISHED';
      }
      if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder, 10);
      if (showOnHomepage !== undefined) updateData.showOnHomepage = Boolean(showOnHomepage);
      if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
      if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      const cat = await prisma.category.update({
        where: { id },
        data: updateData,
      });

      await logAdminAction(req.user.id, 'CATEGORY_UPDATED', { categoryId: id, name: cat.name });
      return successResponse(res, 'Category updated successfully.', cat);
    } catch (error) {
      next(error);
    }
  },

  reorderCategories: async (req, res, next) => {
    try {
      const { categoryOrders } = req.body; // [{ id, displayOrder }]
      if (!categoryOrders || !Array.isArray(categoryOrders)) {
        return errorResponse(res, 'Invalid categoryOrders array.', 400);
      }

      await prisma.$transaction(
        categoryOrders.map((item) =>
          prisma.category.update({
            where: { id: item.id },
            data: { displayOrder: parseInt(item.displayOrder, 10) },
          })
        )
      );

      await logAdminAction(req.user.id, 'CATEGORIES_REORDERED', { count: categoryOrders.length });
      return successResponse(res, 'Categories reordered successfully.');
    } catch (error) {
      next(error);
    }
  },

  deleteCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { force = false } = req.query;

      const productCount = await prisma.product.count({ where: { categoryId: id } });
      if (productCount > 0 && !force) {
        return errorResponse(
          res,
          `Cannot delete category. This category is assigned to ${productCount} products. Please reassign products or archive this category instead.`,
          400,
          { productCount, safeAction: 'ARCHIVE' }
        );
      }

      await prisma.category.delete({ where: { id } });
      await logAdminAction(req.user.id, 'CATEGORY_DELETED', { categoryId: id });
      return successResponse(res, 'Category deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // 13. BRAND MANAGEMENT (NORMAL & COMPANY BRANDING)
  // ==========================================

  getAdminBrands: async (req, res, next) => {
    try {
      const { search, status, brandingType } = req.query;
      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (status && status !== 'ALL') where.status = status;
      if (brandingType && brandingType !== 'ALL') where.brandingType = brandingType;

      const brands = await prisma.brand.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: { select: { products: true } },
        },
      });

      return successResponse(res, 'Admin brands retrieved successfully.', brands);
    } catch (error) {
      next(error);
    }
  },

  createBrand: async (req, res, next) => {
    try {
      const {
        name,
        slug,
        description,
        image,
        imageAlt,
        brandingType = 'NORMAL',
        status = 'PUBLISHED',
        displayOrder,
        showOnHomepage = true,
        showInSearch = true,
        showInFilter = true,
        seoTitle,
        seoDescription,
        isActive = true,
      } = req.body;

      if (!name || name.trim().length < 2) {
        return errorResponse(res, 'Brand name is required.', 400);
      }
      const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const existing = await prisma.brand.findFirst({
        where: {
          OR: [{ name: { equals: name.trim(), mode: 'insensitive' } }, { slug: cleanSlug }],
        },
      });
      if (existing) {
        return errorResponse(res, 'A brand with this name or slug already exists.', 400);
      }

      const maxOrder = await prisma.brand.findFirst({ orderBy: { displayOrder: 'desc' } });
      const orderNum = displayOrder !== undefined ? parseInt(displayOrder, 10) : (maxOrder?.displayOrder || 0) + 1;

      const brand = await prisma.brand.create({
        data: {
          name: name.trim(),
          slug: cleanSlug,
          description: description ? description.trim() : null,
          image: image || null,
          imageAlt: imageAlt || name.trim(),
          brandingType: brandingType || 'NORMAL',
          status: status || 'PUBLISHED',
          displayOrder: orderNum,
          showOnHomepage: Boolean(showOnHomepage),
          showInSearch: Boolean(showInSearch),
          showInFilter: Boolean(showInFilter),
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          isActive: status === 'PUBLISHED' && Boolean(isActive),
        },
      });

      await logAdminAction(req.user.id, 'BRAND_CREATED', { brandId: brand.id, name: brand.name });
      return successResponse(res, 'Brand created successfully.', brand, 201);
    } catch (error) {
      if (error.code === 'P2002') {
        return errorResponse(res, 'A brand with this slug already exists.', 400);
      }
      next(error);
    }
  },

  updateBrand: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        name,
        slug,
        description,
        image,
        imageAlt,
        brandingType,
        status,
        displayOrder,
        showOnHomepage,
        showInSearch,
        showInFilter,
        seoTitle,
        seoDescription,
        isActive,
      } = req.body;

      const updateData = {};
      if (name) {
        updateData.name = name.trim();
        updateData.slug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (description !== undefined) updateData.description = description ? description.trim() : null;
      if (image !== undefined) updateData.image = image;
      if (imageAlt !== undefined) updateData.imageAlt = imageAlt;
      if (brandingType !== undefined) updateData.brandingType = brandingType;
      if (status !== undefined) {
        updateData.status = status;
        updateData.isActive = status === 'PUBLISHED';
      }
      if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder, 10);
      if (showOnHomepage !== undefined) updateData.showOnHomepage = Boolean(showOnHomepage);
      if (showInSearch !== undefined) updateData.showInSearch = Boolean(showInSearch);
      if (showInFilter !== undefined) updateData.showInFilter = Boolean(showInFilter);
      if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
      if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      const brand = await prisma.brand.update({
        where: { id },
        data: updateData,
      });

      await logAdminAction(req.user.id, 'BRAND_UPDATED', { brandId: id, name: brand.name });
      return successResponse(res, 'Brand updated successfully.', brand);
    } catch (error) {
      next(error);
    }
  },

  reorderBrands: async (req, res, next) => {
    try {
      const { brandOrders } = req.body; // [{ id, displayOrder }]
      if (!brandOrders || !Array.isArray(brandOrders)) {
        return errorResponse(res, 'Invalid brandOrders array.', 400);
      }

      await prisma.$transaction(
        brandOrders.map((item) =>
          prisma.brand.update({
            where: { id: item.id },
            data: { displayOrder: parseInt(item.displayOrder, 10) },
          })
        )
      );

      await logAdminAction(req.user.id, 'BRANDS_REORDERED', { count: brandOrders.length });
      return successResponse(res, 'Brands reordered successfully.');
    } catch (error) {
      next(error);
    }
  },

  deleteBrand: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { force = false } = req.query;

      const count = await prisma.product.count({ where: { brandId: id } });
      if (count > 0 && !force) {
        return errorResponse(
          res,
          `Cannot delete brand. This brand is assigned to ${count} products. Please reassign products or archive this brand.`,
          400,
          { productCount: count, safeAction: 'ARCHIVE' }
        );
      }

      await prisma.brand.delete({ where: { id } });
      await logAdminAction(req.user.id, 'BRAND_DELETED', { brandId: id });
      return successResponse(res, 'Brand deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  getBrandProducts: async (req, res, next) => {
    try {
      const { id } = req.params;
      const products = await prisma.product.findMany({
        where: { brandId: id },
        include: {
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true, slug: true } },
          images: { select: { url: true, isPrimary: true }, orderBy: { sortOrder: 'asc' } },
        },
      });

      return successResponse(res, 'Brand products retrieved successfully.', products);
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // 13. HOMEPAGE SECTIONS & FESTIVAL CAMPAIGNS
  // ==========================================

  getAdminSections: async (req, res, next) => {
    try {
      const sections = await prisma.homepageSection.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
          products: {
            orderBy: { sortOrder: 'asc' },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  originalPrice: true,
                  stock: true,
                  images: {
                    select: { url: true, isPrimary: true },
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
        },
      });

      return successResponse(res, 'Sections loaded successfully.', sections);
    } catch (error) {
      next(error);
    }
  },

  createAdminSection: async (req, res, next) => {
    try {
      const {
        title,
        subtitle,
        description,
        type = 'CUSTOM',
        bannerImage,
        badgeText,
        startDate,
        endDate,
        layout = 'GRID',
        productLimit = 12,
        sortMethod = 'MANUAL',
        isActive = true,
        productIds = [],
      } = req.body;

      if (!title || title.trim().length < 2) {
        return errorResponse(res, 'Section title is required.', 422);
      }

      // Find max displayOrder
      const maxOrderSection = await prisma.homepageSection.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      const nextOrder = (maxOrderSection?.displayOrder || 0) + 1;

      const created = await prisma.$transaction(async (tx) => {
        const section = await tx.homepageSection.create({
          data: {
            title: title.trim(),
            subtitle: subtitle ? subtitle.trim() : null,
            description: description ? description.trim() : null,
            type: type || 'CUSTOM',
            bannerImage: bannerImage || null,
            badgeText: badgeText ? badgeText.trim() : null,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            layout: layout || 'GRID',
            productLimit: parseInt(productLimit, 10) || 12,
            sortMethod: sortMethod || 'MANUAL',
            displayOrder: nextOrder,
            isActive: Boolean(isActive),
          },
        });

        if (productIds && productIds.length > 0) {
          for (let i = 0; i < productIds.length; i++) {
            await tx.homepageSectionProduct.create({
              data: {
                sectionId: section.id,
                productId: productIds[i],
                sortOrder: i,
              },
            });
          }
        }

        return section;
      });

      await logAdminAction(req.user.id, 'HOMEPAGE_SECTION_CREATED', { sectionId: created.id, title: created.title });
      return successResponse(res, 'Section created successfully.', created, 201);
    } catch (error) {
      next(error);
    }
  },

  updateAdminSection: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        title,
        subtitle,
        description,
        type,
        bannerImage,
        badgeText,
        startDate,
        endDate,
        layout,
        productLimit,
        sortMethod,
        displayOrder,
        isActive,
        productIds,
      } = req.body;

      const updated = await prisma.$transaction(async (tx) => {
        const section = await tx.homepageSection.update({
          where: { id },
          data: {
            ...(title && { title: title.trim() }),
            ...(subtitle !== undefined && { subtitle: subtitle ? subtitle.trim() : null }),
            ...(description !== undefined && { description: description ? description.trim() : null }),
            ...(type && { type }),
            ...(bannerImage !== undefined && { bannerImage }),
            ...(badgeText !== undefined && { badgeText: badgeText ? badgeText.trim() : null }),
            ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
            ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
            ...(layout && { layout }),
            ...(productLimit !== undefined && { productLimit: parseInt(productLimit, 10) }),
            ...(sortMethod && { sortMethod }),
            ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) }),
            ...(isActive !== undefined && { isActive: Boolean(isActive) }),
          },
        });

        if (productIds && Array.isArray(productIds)) {
          await tx.homepageSectionProduct.deleteMany({ where: { sectionId: id } });
          for (let i = 0; i < productIds.length; i++) {
            await tx.homepageSectionProduct.create({
              data: {
                sectionId: id,
                productId: productIds[i],
                sortOrder: i,
              },
            });
          }
        }

        return section;
      });

      await logAdminAction(req.user.id, 'HOMEPAGE_SECTION_UPDATED', { sectionId: id });
      return successResponse(res, 'Section updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  },

  deleteAdminSection: async (req, res, next) => {
    try {
      const { id } = req.params;
      // Deleting section only removes section-product relations, NOT the products themselves
      await prisma.homepageSection.delete({ where: { id } });
      await logAdminAction(req.user.id, 'HOMEPAGE_SECTION_DELETED', { sectionId: id });
      return successResponse(res, 'Section removed successfully. Products remain safe in catalog.');
    } catch (error) {
      next(error);
    }
  },

  reorderAdminSections: async (req, res, next) => {
    try {
      const { sectionOrders } = req.body; // Array of { id, displayOrder }
      if (!sectionOrders || !Array.isArray(sectionOrders)) {
        return errorResponse(res, 'Invalid sectionOrders array.', 400);
      }

      await prisma.$transaction(
        sectionOrders.map((item) =>
          prisma.homepageSection.update({
            where: { id: item.id },
            data: { displayOrder: parseInt(item.displayOrder, 10) },
          })
        )
      );

      await logAdminAction(req.user.id, 'HOMEPAGE_SECTIONS_REORDERED', { count: sectionOrders.length });
      return successResponse(res, 'Homepage layout reordered successfully.');
    } catch (error) {
      next(error);
    }
  },

  assignProductToSection: async (req, res, next) => {
    try {
      const { id } = req.params; // sectionId
      const { productId } = req.body;

      if (!productId) return errorResponse(res, 'Product ID is required.', 400);

      // Check if already assigned
      const existing = await prisma.homepageSectionProduct.findUnique({
        where: {
          sectionId_productId: {
            sectionId: id,
            productId,
          },
        },
      });

      if (existing) {
        return successResponse(res, 'Product is already in this section.', existing);
      }

      const count = await prisma.homepageSectionProduct.count({ where: { sectionId: id } });
      const record = await prisma.homepageSectionProduct.create({
        data: {
          sectionId: id,
          productId,
          sortOrder: count,
        },
      });

      return successResponse(res, 'Product assigned to section.', record, 201);
    } catch (error) {
      next(error);
    }
  },

  removeProductFromSection: async (req, res, next) => {
    try {
      const { id, productId } = req.params;
      await prisma.homepageSectionProduct.deleteMany({
        where: {
          sectionId: id,
          productId,
        },
      });

      return successResponse(res, 'Product removed from section. Main catalog item untouched.');
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // CUSTOM REGISTRATION FIELDS MANAGEMENT
  // ==========================================
  getAdminCustomFields: async (req, res, next) => {
    try {
      const fields = await prisma.customRegistrationField.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return successResponse(res, 'Custom registration fields retrieved', fields);
    } catch (error) {
      next(error);
    }
  },

  createCustomField: async (req, res, next) => {
    try {
      const { fieldName, fieldKey, fieldType, placeholder, options, isRequired, isEnabled, isCustomerEditable } = req.body;

      if (!fieldName || !fieldKey) {
        return errorResponse(res, 'Field Name and Field Key are required.', 400);
      }

      const cleanKey = fieldKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

      const existing = await prisma.customRegistrationField.findUnique({
        where: { fieldKey: cleanKey },
      });

      if (existing) {
        return errorResponse(res, `Field key "${cleanKey}" already exists.`, 409);
      }

      const count = await prisma.customRegistrationField.count();

      const newField = await prisma.customRegistrationField.create({
        data: {
          fieldName: fieldName.trim(),
          fieldKey: cleanKey,
          fieldType: fieldType || 'TEXT',
          placeholder: placeholder ? placeholder.trim() : null,
          options: options ? (Array.isArray(options) ? options.join(', ') : options.trim()) : null,
          isRequired: Boolean(isRequired),
          isEnabled: isEnabled !== false,
          isCustomerEditable: isCustomerEditable !== false,
          displayOrder: count,
        },
      });

      await logAdminAction(req.user.id, 'CUSTOM_FIELD_CREATED', { fieldId: newField.id, fieldKey: cleanKey });

      return successResponse(res, 'Custom field created successfully.', newField, 201);
    } catch (error) {
      next(error);
    }
  },

  updateCustomField: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fieldName, fieldType, placeholder, options, isRequired, isEnabled, isCustomerEditable, displayOrder } = req.body;

      const field = await prisma.customRegistrationField.findUnique({ where: { id } });
      if (!field) return errorResponse(res, 'Custom field not found.', 404);

      const updated = await prisma.customRegistrationField.update({
        where: { id },
        data: {
          ...(fieldName && { fieldName: fieldName.trim() }),
          ...(fieldType && { fieldType }),
          placeholder: placeholder !== undefined ? (placeholder ? placeholder.trim() : null) : field.placeholder,
          options: options !== undefined ? (Array.isArray(options) ? options.join(', ') : options ? options.trim() : null) : field.options,
          ...(isRequired !== undefined && { isRequired: Boolean(isRequired) }),
          ...(isEnabled !== undefined && { isEnabled: Boolean(isEnabled) }),
          ...(isCustomerEditable !== undefined && { isCustomerEditable: Boolean(isCustomerEditable) }),
          ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder, 10) }),
        },
      });

      await logAdminAction(req.user.id, 'CUSTOM_FIELD_UPDATED', { fieldId: id, fieldKey: field.fieldKey });

      return successResponse(res, 'Custom field updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  },

  deleteCustomField: async (req, res, next) => {
    try {
      const { id } = req.params;
      const field = await prisma.customRegistrationField.findUnique({ where: { id } });
      if (!field) return errorResponse(res, 'Custom field not found.', 404);

      await prisma.customRegistrationField.delete({ where: { id } });
      await logAdminAction(req.user.id, 'CUSTOM_FIELD_DELETED', { fieldId: id, fieldKey: field.fieldKey });

      return successResponse(res, `Custom field "${field.fieldName}" deleted.`);
    } catch (error) {
      next(error);
    }
  },

  reorderCustomFields: async (req, res, next) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return errorResponse(res, 'orderedIds array is required.', 400);
      }

      await prisma.$transaction(
        orderedIds.map((id, index) =>
          prisma.customRegistrationField.update({
            where: { id },
            data: { displayOrder: index },
          })
        )
      );

      return successResponse(res, 'Custom fields reordered successfully.');
    } catch (error) {
      next(error);
    }
  },

  updateCustomerProfileAdmin: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone, whatsappNumber, customFields = {} } = req.body;

      const customer = await prisma.user.findUnique({ where: { id } });
      if (!customer) return errorResponse(res, 'Customer not found.', 404);

      const existingCustom = typeof customer.customFields === 'object' && customer.customFields !== null ? customer.customFields : {};
      const mergedCustom = { ...existingCustom, ...customFields };

      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(whatsappNumber && { whatsappNumber: whatsappNumber.trim() }),
          customFields: mergedCustom,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsappNumber: true,
          customFields: true,
          status: true,
          isBlocked: true,
        },
      });

      await logAdminAction(req.user.id, 'ADMIN_CUSTOMER_PROFILE_UPDATED', { customerId: id });

      return successResponse(res, 'Customer profile updated by administrator.', updated);
    } catch (error) {
      next(error);
    }
  },

  getAuthAuditLogs: async (req, res, next) => {
    try {
      const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
      const skip = (pageNum - 1) * limitNum;

      const authActions = [
        'ACCOUNT_CREATED',
        'CUSTOMER_LOGIN',
        'CUSTOMER_LOGOUT',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_RESET_COMPLETED',
        'GOOGLE_LOGIN',
        'FACEBOOK_LOGIN',
        'ACCOUNT_BLOCKED',
        'ACCOUNT_UNBLOCKED',
        'ADMIN_FORCE_LOGOUT',
        'CUSTOMER_FORCE_LOGOUT_ALL_DEVICES',
      ];

      const where = {
        action: { in: authActions },
      };

      const [total, logs] = await Promise.all([
        prisma.adminActivity.count({ where }),
        prisma.adminActivity.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        }),
      ]);

      return successResponse(res, 'Authentication audit logs retrieved', {
        logs,
        pagination: {
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
