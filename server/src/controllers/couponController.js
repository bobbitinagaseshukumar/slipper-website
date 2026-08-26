const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get List of Active Public Coupons
 */
const getActiveCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderAmount: true,
        maxDiscount: true,
        validUntil: true,
      },
      orderBy: { discountValue: 'desc' },
    });

    return successResponse(res, 'Active coupons retrieved', coupons);
  } catch (error) {
    next(error);
  }
};

/**
 * Validate and Calculate Coupon Discount (Server-Side Authoritative)
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;
    const cartAmount = parseFloat(subtotal) || 0;

    if (!code || !code.trim()) {
      return errorResponse(res, 'Please provide a coupon code.', 400);
    }

    const normalizedCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon || !coupon.isActive) {
      return errorResponse(res, 'Invalid coupon code.', 404);
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validUntil < now) {
      return errorResponse(res, 'This coupon code has expired.', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return errorResponse(res, 'This coupon code has reached its maximum usage limit.', 400);
    }

    if (cartAmount < coupon.minOrderAmount) {
      return errorResponse(
        res,
        `This coupon requires a minimum cart amount of ₹${coupon.minOrderAmount}.`,
        400
      );
    }

    // Authoritative calculation
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (cartAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // Flat discount
      discountAmount = Math.min(coupon.discountValue, cartAmount);
    }

    discountAmount = Math.round(discountAmount);

    return successResponse(res, `Coupon "${normalizedCode}" applied successfully!`, {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalSubtotal: Math.max(0, cartAmount - discountAmount),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveCoupons,
  validateCoupon,
};
