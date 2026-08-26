const crypto = require('crypto');
const prisma = require('../config/db');
const { razorpayInstance, RAZORPAY_KEY_SECRET, isConfigured } = require('../config/razorpay');
const emailService = require('./emailService');

/**
 * Authoritative Backend Price, Stock, & Coupon Calculation
 */
const calculateAuthoritativeCart = async (userId, itemsPayload, couponCode) => {
  let itemsToProcess = [];

  if (itemsPayload && itemsPayload.length > 0) {
    itemsToProcess = itemsPayload;
  } else if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
    if (!cart || cart.items.length === 0) {
      throw new Error('Your shopping cart is empty.');
    }
    itemsToProcess = cart.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    }));
  } else {
    throw new Error('No items provided for checkout.');
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of itemsToProcess) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: {
        variants: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    if (!product || !product.isActive) {
      throw new Error(`Product "${item.productName || 'A slipper'}" is no longer available.`);
    }

    let variant = null;
    if (item.variantId) {
      variant = product.variants.find((v) => v.id === item.variantId);
    } else if (item.size && item.color) {
      variant = product.variants.find((v) => v.size === item.size && v.colorName === item.color);
    }

    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}" (${item.size || ''} / ${item.color || ''}). Only ${availableStock} available.`
      );
    }

    const unitPrice = variant?.priceOverride || product.price;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    verifiedItems.push({
      productId: product.id,
      variantId: variant?.id || null,
      productName: product.name,
      size: item.size || variant?.size || 'Standard',
      color: item.color || variant?.colorName || 'Classic',
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotal,
      productImage: product.images?.[0]?.url || null,
    });
  }

  // Delivery Fee Calculation (Free delivery over ₹999, else ₹49)
  const deliveryFee = subtotal >= 999 ? 0 : 49;

  // Coupon Validation
  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    });

    if (coupon && coupon.isActive) {
      const now = new Date();
      const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < now;
      const isLimitReached = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;
      const isBelowMinOrder = coupon.minOrderAmount && subtotal < coupon.minOrderAmount;

      if (!isExpired && !isLimitReached && !isBelowMinOrder) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, subtotal);
        appliedCoupon = coupon;
      }
    }
  }

  const finalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  return {
    verifiedItems,
    subtotal,
    discountAmount,
    deliveryFee,
    finalAmount,
    appliedCoupon,
  };
};

/**
 * 1. Create Razorpay Order
 */
const createRazorpayOrder = async ({ userId, addressId, items, couponCode, notes }) => {
  // Authoritative calculation
  const { verifiedItems, subtotal, discountAmount, deliveryFee, finalAmount, appliedCoupon } =
    await calculateAuthoritativeCart(userId, items, couponCode);

  // Generate Receipt ID
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `AS-${dateStr}-${randomSuffix}`;

  // Amount in Paise (e.g. ₹999 = 99900 paise)
  const amountInPaise = Math.round(finalAmount * 100);

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: orderNumber,
    notes: {
      userId: userId || 'guest',
      orderNumber,
      notes: notes || '',
    },
  });

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: finalAmount,
    amountInPaise,
    currency: razorpayOrder.currency,
    orderNumber,
    subtotal,
    discountAmount,
    deliveryFee,
    items: verifiedItems,
  };
};

/**
 * 2. Verify Razorpay Payment Signature
 */
const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!isConfigured) {
    // In mock development mode, accept any non-empty signature or test signature
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expectedSignature === razorpaySignature;
};

/**
 * 3. Atomic Order Confirmation & Inventory Fulfillment
 */
const fulfillPaidOrder = async ({
  userId,
  addressId,
  orderNumber,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  items,
  couponCode,
  notes,
}) => {
  // 1. Idempotency Check: Don't process the same Razorpay payment twice
  const existingOrder = await prisma.order.findFirst({
    where: {
      OR: [{ razorpayOrderId }, { razorpayPaymentId }],
    },
    include: { items: true, user: true },
  });

  if (existingOrder) {
    console.log(`ℹ️ Order fulfillment skipped: Already exists with Razorpay Order ID ${razorpayOrderId}`);
    return existingOrder;
  }

  // 2. Authoritative Price & Stock Recalculation
  const { verifiedItems, subtotal, discountAmount, deliveryFee, finalAmount, appliedCoupon } =
    await calculateAuthoritativeCart(userId, items, couponCode);

  let addressSnapshotString = null;
  if (addressId) {
    const addr = await prisma.address.findUnique({ where: { id: addressId } });
    if (addr) {
      addressSnapshotString = JSON.stringify({
        fullName: addr.fullName,
        phone: addr.phone,
        alternatePhone: addr.alternatePhone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        landmark: addr.landmark,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
      });
    }
  }

  // 3. Atomic Prisma Transaction
  const createdOrder = await prisma.$transaction(async (tx) => {
    // Create Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        deliveryAddressSnapshot: addressSnapshotString,
        status: 'CONFIRMED',
        totalAmount: subtotal,
        discountAmount,
        shippingAmount: deliveryFee,
        finalAmount,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        notes: notes ? notes.trim() : null,
      },
    });

    // Create Order Items & Decrement Stock
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

    // Record Payment Entry
    await tx.payment.create({
      data: {
        orderId: order.id,
        transactionId: razorpayPaymentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod: 'RAZORPAY',
        amount: finalAmount,
        currency: 'INR',
        status: 'PAID',
        verifiedAt: new Date(),
      },
    });

    // Increment Coupon Usage
    if (appliedCoupon) {
      await tx.coupon.update({
        where: { id: appliedCoupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Clear User's Cart
    const userCart = await tx.cart.findUnique({ where: { userId } });
    if (userCart) {
      await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
    }

    // Create In-App Notification
    await tx.notification.create({
      data: {
        userId,
        title: `Payment Successful! 🎉 — #${orderNumber}`,
        message: `Your payment of ₹${finalAmount} was verified. Your order is confirmed and moving to packing.`,
        type: 'ORDER',
        link: `/account/orders/${orderNumber}`,
      },
    });

    return order;
  });

  // Asynchronously dispatch Transactional Confirmation Email
  const user = await prisma.user.findUnique({ where: { id: userId } });
  emailService.sendOrderPlacedEmail(
    {
      ...createdOrder,
      items: verifiedItems,
      totalAmount: finalAmount,
    },
    user
  );

  return createdOrder;
};

module.exports = {
  calculateAuthoritativeCart,
  createRazorpayOrder,
  verifyPaymentSignature,
  fulfillPaidOrder,
};
