const prisma = require('../config/db');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const paymentService = require('../services/paymentService');
const storeSettingsService = require('../services/storeSettingsService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Generate human-friendly, collision-safe Order Number
 * Example: AS-20260826-10429
 */
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `AS-${dateStr}-${randomSuffix}`;
};

/**
 * Create Order with Strict Backend Transaction & Authoritative Pricing
 */
const createOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod = 'COD', couponCode, notes } = req.body;

    if (!addressId) {
      return errorResponse(res, 'Please select a delivery address.', 422);
    }

    // 1. Verify Delivery Address Ownership
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== req.user.id) {
      return errorResponse(res, 'Invalid delivery address selected.', 404);
    }

    // 2. Load Cart and Active Products
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 'Your shopping bag is empty.', 400);
    }

    // 3. Re-validate Stock & Authoritative Prices for all items
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;

      if (!product || !product.isActive) {
        return errorResponse(
          res,
          `"${product?.name || 'A slipper'}" in your bag is no longer available. Please update your bag.`,
          400
        );
      }

      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock < item.quantity) {
        return errorResponse(
          res,
          `Insufficient stock for "${product.name}" (${item.size || ''} / ${item.color || ''}). Only ${availableStock} available.`,
          400
        );
      }

      const unitPrice = variant?.priceOverride || product.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        variantId: variant?.id || null,
        productName: product.name,
        size: item.size || variant?.size || 'Standard',
        color: item.color || variant?.colorName || 'Standard',
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
      });
    }

    // 4. Calculate Delivery Fee (Dynamically configured by Admin in StoreSettings)
    const storeSettings = await storeSettingsService.getStoreSettings();
    const freeThreshold = typeof storeSettings.freeShippingThreshold === 'number' ? storeSettings.freeShippingThreshold : 999;
    const standardFee = typeof storeSettings.standardShippingFee === 'number' ? storeSettings.standardShippingFee : 49;
    const deliveryFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : standardFee;

    // 5. Authoritative Coupon Validation & Discount
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const normalizedCode = couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: normalizedCode },
      });

      const now = new Date();
      if (
        coupon &&
        coupon.isActive &&
        coupon.validFrom <= now &&
        coupon.validUntil >= now &&
        subtotal >= coupon.minOrderAmount &&
        (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
      ) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = Math.min(coupon.discountValue, subtotal);
        }
        discountAmount = Math.round(discountAmount);
        appliedCoupon = coupon;
      }
    }

    const finalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    // 6. Address Snapshot object
    const shippingAddressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      alternatePhone: address.alternatePhone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };

    const orderNumber = generateOrderNumber();

    // 7. Atomic Prisma Transaction for Order Creation & Inventory Decrement
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user.id,
          addressId: address.id,
          deliveryAddressSnapshot: JSON.stringify(shippingAddressSnapshot),
          status: 'PENDING',
          totalAmount: subtotal,
          discountAmount,
          shippingAmount: deliveryFee,
          finalAmount,
          paymentMethod: paymentMethod === 'ONLINE' ? 'ONLINE' : 'COD',
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          notes: notes ? notes.trim() : null,
        },
      });

      // Initial Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          actorRole: 'CUSTOMER',
          actorId: req.user.id,
          comment: 'Order placed by customer.',
        },
      });

      // Create Admin Red Alert Notification
      await tx.adminNotification.create({
        data: {
          type: 'NEW_ORDER',
          title: `🔴 NEW ORDER: #${orderNumber}`,
          message: `New slipper order for ₹${finalAmount} from ${req.user.name || 'Customer'}.`,
          orderId: order.id,
          customerId: req.user.id,
        },
      });

      // Create Order Items
      for (const itemData of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: itemData.productId,
            variantId: itemData.variantId,
            productName: itemData.productName,
            size: itemData.size,
            color: itemData.color,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            totalPrice: itemData.totalPrice,
          },
        });

        // Decrement Variant Stock if applicable
        if (itemData.variantId) {
          await tx.productVariant.update({
            where: { id: itemData.variantId },
            data: { stock: { decrement: itemData.quantity } },
          });
        }

        // Decrement Product Stock
        await tx.product.update({
          where: { id: itemData.productId },
          data: { stock: { decrement: itemData.quantity } },
        });
      }

      // Increment Coupon usage if applied
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Clear customer's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Create in-app Customer Notification
      await tx.notification.create({
        data: {
          userId: req.user.id,
          title: `Order Placed: #${orderNumber}`,
          message: `Your order for ₹${finalAmount} has been placed. You will receive an approval update shortly!`,
          type: 'ORDER',
          link: `/account/orders/${orderNumber}`,
        },
      });

      return order;
    });

    // Trigger Asynchronous Order Confirmation Email
    emailService.sendOrderPlacedEmail(
      {
        ...createdOrder,
        items: orderItemsData,
        totalAmount: finalAmount,
      },
      req.user
    ).catch(err => console.error('Email dispatch failed:', err.message));

    return successResponse(res, 'Order placed successfully!', {
      orderNumber: createdOrder.orderNumber,
      status: createdOrder.status,
      paymentMethod: createdOrder.paymentMethod,
      totalAmount: subtotal,
      discountAmount,
      deliveryFee,
      finalAmount,
      shippingAddress: shippingAddressSnapshot,
      itemsCount: orderItemsData.length,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Orders of Logged-In User with Search, Status Filter & Pagination
 */
const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId: req.user.id,
      ...(status && status !== 'ALL' && { status }),
      ...(search && search.trim() && {
        orderNumber: { contains: search.trim(), mode: 'insensitive' },
      }),
    };

    const [total, orders, statusCounts] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
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
          address: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { userId: req.user.id },
        _count: { status: true },
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

    return successResponse(res, 'Orders retrieved', {
      orders,
      counts,
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

/**
 * Get Specific Order Details by Order Number (Strict Ownership Guard)
 */
const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                brand: true,
                images: { select: { url: true, isPrimary: true } },
              },
            },
            variant: true,
          },
        },
        address: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order || order.userId !== req.user.id) {
      return errorResponse(res, 'Order not found.', 404);
    }

    return successResponse(res, 'Order details retrieved', order);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Order (Strict Server-Authoritative Deadline Check)
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order || order.userId !== req.user.id) {
      return errorResponse(res, 'Order not found.', 404);
    }

    // 1. Status Check
    const nonCancellableStatuses = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (nonCancellableStatuses.includes(order.status)) {
      return errorResponse(
        res,
        `Cannot cancel order as it is already ${order.status.toLowerCase().replace(/_/g, ' ')}.`,
        400
      );
    }

    // 2. Server-Authoritative Cancellation Deadline Enforcement
    const now = new Date();
    if (order.cancellationDeadline && now > new Date(order.cancellationDeadline)) {
      return errorResponse(
        res,
        'Cancellation period has ended. Order is being prepared for dispatch.',
        400
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Order Status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: now,
          cancelledBy: 'CUSTOMER',
          cancellationReason: reason.trim(),
        },
      });

      // 2. Record Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CANCELLED',
          actorRole: 'CUSTOMER',
          actorId: req.user.id,
          comment: `Customer cancelled order: ${reason.trim()}`,
        },
      });

      // 3. Restore Inventory Stock for all items
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

      // 4. Create in-app Customer Notification
      await tx.notification.create({
        data: {
          userId: req.user.id,
          title: `Order #${order.orderNumber} Cancelled`,
          message: `Your cancellation request for order #${order.orderNumber} has been processed successfully.`,
          type: 'ORDER_CANCELLED',
          link: `/account/orders/${order.orderNumber}`,
        },
      });

      // 5. Create Admin Notification
      await tx.adminNotification.create({
        data: {
          type: 'ORDER_CANCELLED',
          title: `Customer Cancelled Order: #${order.orderNumber}`,
          message: `Customer cancelled order #${order.orderNumber}. Reason: ${reason.trim()}`,
          orderId: order.id,
          customerId: req.user.id,
        },
      });
    });

    // Trigger Asynchronous Order Cancellation Email
    emailService.sendOrderCancelledEmail(order, req.user, reason).catch(err => console.error('Email dispatch failed:', err.message));

    return successResponse(res, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Customer Order Counts / Stats
 */
const getUserOrderStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [total, statusCounts, spendingAgg] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
      prisma.order.aggregate({
        where: { userId, status: { not: 'CANCELLED' } },
        _sum: { finalAmount: true },
      }),
    ]);

    const stats = {
      total,
      pending: 0,
      approved: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalSpent: spendingAgg._sum.finalAmount || 0,
    };

    statusCounts.forEach((sc) => {
      const key = sc.status.toLowerCase();
      if (stats[key] !== undefined) {
        stats[key] = sc._count.status;
      }
    });

    return successResponse(res, 'Customer order stats loaded', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Request Return for a Delivered Order
 */
const requestReturn = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { reason, comments } = req.body;

    if (!reason) {
      return errorResponse(res, 'Please provide a reason for the return.', 422);
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order || order.userId !== req.user.id) {
      return errorResponse(res, 'Order not found.', 404);
    }

    if (order.status !== 'DELIVERED') {
      return errorResponse(res, 'Returns can only be requested for delivered orders.', 400);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        notes: order.notes ? `${order.notes} | Return Request: ${reason} - ${comments || ''}` : `Return Request: ${reason} - ${comments || ''}`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: `Return Requested: #${order.orderNumber}`,
        message: `Your return request for order #${order.orderNumber} has been received. Our team will verify and arrange pickup.`,
        type: 'RETURN_REQUESTED',
        link: `/account/orders/${order.orderNumber}`,
      },
    });

    return successResponse(res, 'Return request submitted successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder Previous Order Items into Active Cart
 */
const reorder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: { include: { variants: true } },
          },
        },
      },
    });

    if (!order || order.userId !== req.user.id) {
      return errorResponse(res, 'Order not found.', 404);
    }

    // Find or create customer's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
    }

    let addedCount = 0;

    for (const item of order.items) {
      const prod = item.product;
      if (!prod || !prod.isActive) continue;

      const variant = item.variantId
        ? prod.variants.find((v) => v.id === item.variantId && v.isActive)
        : null;

      const stock = variant ? variant.stock : prod.stock;
      if (stock <= 0) continue;

      const qty = Math.min(stock, item.quantity);
      const price = variant?.priceOverride || prod.price;

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: prod.id,
          variantId: variant?.id || null,
          size: item.size,
          color: item.color,
          quantity: qty,
          price,
        },
      });

      addedCount++;
    }

    if (addedCount === 0) {
      return errorResponse(res, 'Items from this order are currently out of stock.', 400);
    }

    return successResponse(res, `${addedCount} items added to your shopping bag.`);
  } catch (error) {
    next(error);
  }
};

/**
 * Create WhatsApp Order Request
 */
const createWhatsAppOrder = async (req, res, next) => {
  try {
    const { addressId, items, couponCode, notes, customerName, customerEmail, whatsappNumber, guestAddress } = req.body;

    let targetUserId = req.user ? req.user.id : null;
    let effectiveCustomerName = customerName || req.user?.name || 'Valued Customer';
    let effectiveEmail = customerEmail || req.user?.email || null;
    let effectiveWhatsApp = whatsappNumber || req.user?.phone || req.user?.whatsappNumber || '';

    // If guest user without an existing user ID, locate or create a guest customer record
    if (!targetUserId) {
      if (!effectiveEmail && !effectiveWhatsApp) {
        return errorResponse(res, 'Please provide either an email or WhatsApp phone number.', 400);
      }

      const tempEmail = effectiveEmail || `whatsapp-${Date.now()}@guest.aurasole.com`;
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: tempEmail },
            ...(effectiveWhatsApp ? [{ phone: effectiveWhatsApp }] : []),
          ],
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: effectiveCustomerName,
            email: tempEmail,
            phone: effectiveWhatsApp || null,
            whatsappNumber: effectiveWhatsApp || null,
            passwordHash: 'GUEST_WHATSAPP_ACCOUNT',
            role: 'CUSTOMER',
          },
        });
      }
      targetUserId = user.id;
    }

    // Resolve Delivery Address
    let addressSnapshot = null;
    let effectiveAddressId = null;

    if (addressId) {
      const addr = await prisma.address.findUnique({ where: { id: addressId } });
      if (addr) {
        effectiveAddressId = addr.id;
        addressSnapshot = `${addr.fullName}, ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city}, ${addr.state} - ${addr.postalCode} (Phone: ${addr.phone})`;
      }
    }

    if (!addressSnapshot && guestAddress) {
      addressSnapshot = typeof guestAddress === 'string'
        ? guestAddress
        : `${guestAddress.fullName || effectiveCustomerName}, ${guestAddress.addressLine1 || ''}${guestAddress.addressLine2 ? ', ' + guestAddress.addressLine2 : ''}, ${guestAddress.city || ''}, ${guestAddress.state || ''} - ${guestAddress.postalCode || ''}`;
    }

    if (!addressSnapshot) {
      return errorResponse(res, 'Please provide a valid delivery address for your WhatsApp order.', 400);
    }

    // Authoritative calculations
    const { verifiedItems, subtotal, discountAmount, deliveryFee, finalAmount, appliedCoupon } =
      await paymentService.calculateAuthoritativeCart(targetUserId, items, couponCode);

    const orderNumber = generateOrderNumber();

    // Format WhatsApp Message
    const formattedMessage = whatsappService.formatOrderWhatsAppMessage({
      orderNumber,
      customerName: effectiveCustomerName,
      whatsappNumber: effectiveWhatsApp,
      items: verifiedItems,
      subtotal,
      discount: discountAmount,
      deliveryFee,
      totalAmount: finalAmount,
      shippingAddress: addressSnapshot,
    });

    const storePhone = await whatsappService.getStoreWhatsAppNumber();
    const whatsappUrl = whatsappService.generateWhatsAppUrl(storePhone, formattedMessage);

    // Save Order in Database with WHATSAPP_PENDING status
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: targetUserId,
          addressId: effectiveAddressId,
          deliveryAddressSnapshot: typeof addressSnapshot === 'string' ? addressSnapshot : JSON.stringify(addressSnapshot),
          status: 'WHATSAPP_PENDING',
          totalAmount: subtotal,
          discountAmount,
          shippingAmount: deliveryFee,
          finalAmount,
          paymentMethod: 'WHATSAPP',
          paymentStatus: 'PENDING',
          isWhatsAppOrder: true,
          whatsappMessage: formattedMessage,
          notes: notes ? notes.trim() : null,
        },
      });

      // Record items and decrement stock
      for (const item of verifiedItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        });

        // Decrement Variant Stock
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Decrement Product Stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Initial Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'WHATSAPP_PENDING',
          actorRole: 'CUSTOMER',
          actorId: targetUserId,
          comment: 'WhatsApp order initiated by customer.',
        },
      });

      // Create Admin Red Alert Notification
      await tx.adminNotification.create({
        data: {
          type: 'NEW_ORDER',
          title: `🔴 NEW WHATSAPP ORDER: #${orderNumber}`,
          message: `New WhatsApp order request for ₹${finalAmount} from ${effectiveCustomerName}.`,
          orderId: order.id,
          customerId: targetUserId,
        },
      });

      // Record coupon usage
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Clear customer's cart if exists
      const userCart = await tx.cart.findUnique({ where: { userId: targetUserId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      // Create in-app notification
      await tx.notification.create({
        data: {
          userId: targetUserId,
          title: `WhatsApp Order Created: #${orderNumber}`,
          message: `Your WhatsApp order request for ₹${finalAmount} has been recorded. Please send the message on WhatsApp so we can confirm it!`,
          type: 'ORDER',
          link: `/order-success/${orderNumber}`,
        },
      });

      return order;
    });

    // Send Asynchronous Email to customer
    if (effectiveEmail) {
      emailService.sendOrderPlacedEmail(
        {
          ...createdOrder,
          items: verifiedItems,
          totalAmount: finalAmount,
        },
        { name: effectiveCustomerName, email: effectiveEmail }
      ).catch(err => console.error('Email dispatch failed:', err.message));
    }

    return successResponse(res, 'WhatsApp order created successfully', {
      orderNumber: createdOrder.orderNumber,
      status: createdOrder.status,
      paymentMethod: createdOrder.paymentMethod,
      totalAmount: subtotal,
      discountAmount,
      deliveryFee,
      finalAmount,
      whatsappUrl,
      whatsappMessage: formattedMessage,
      storeWhatsAppNumber: storePhone,
      itemsCount: verifiedItems.length,
    }, 201);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to create WhatsApp order', 400);
  }
};

/**
 * Generate Quick Single-Product WhatsApp Message & URL
 */
const createQuickProductWhatsAppOrder = async (req, res, next) => {
  try {
    const { productId, variantId, size, color, quantity = 1, productUrl } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required.', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      return errorResponse(res, 'This slipper is no longer available.', 404);
    }

    let variant = null;
    if (variantId) {
      variant = product.variants.find((v) => v.id === variantId);
    } else if (size && color) {
      variant = product.variants.find((v) => v.size === size && v.colorName === color);
    }

    const effectivePrice = variant?.priceOverride || product.price;
    const storePhone = await whatsappService.getStoreWhatsAppNumber();
    const customerName = req.user ? req.user.name : '';

    const message = whatsappService.formatProductQuickInquiryMessage({
      productName: product.name,
      size: size || variant?.size || 'Standard',
      color: color || variant?.colorName || 'Classic',
      quantity,
      price: effectivePrice,
      productUrl,
      customerName,
    });

    const whatsappUrl = whatsappService.generateWhatsAppUrl(storePhone, message);

    return successResponse(res, 'Product WhatsApp link generated', {
      whatsappUrl,
      message,
      storePhone,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  createWhatsAppOrder,
  createQuickProductWhatsAppOrder,
  getUserOrders,
  getOrderByNumber,
  getUserOrderStats,
  cancelOrder,
  requestReturn,
  reorder,
};

