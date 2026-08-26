const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * 1. Get Product Reviews & Ratings Summary (Public)
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const [reviews, totalCount, ratingStats] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isApproved: true },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
      }),
      prisma.review.count({ where: { productId, isApproved: true } }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId, isApproved: true },
        _count: { rating: true },
      }),
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;

    ratingStats.forEach((stat) => {
      distribution[stat.rating] = stat._count.rating;
      totalScore += stat.rating * stat._count.rating;
    });

    const averageRating = totalCount > 0 ? parseFloat((totalScore / totalCount).toFixed(1)) : 5.0;

    return successResponse(res, 'Reviews retrieved', {
      reviews,
      summary: {
        totalReviews: totalCount,
        averageRating,
        distribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Check Customer Review Eligibility (Strict Delivered-Only Check)
 */
const checkReviewEligibility = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
    });

    // Check for any delivered order containing this product for this customer
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: {
            productId,
          },
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        deliveredAt: true,
      },
    });

    // Check for any pending non-delivered orders
    const nonDeliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: { not: 'DELIVERED' },
        items: {
          some: {
            productId,
          },
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
      },
    });

    const hasPurchased = Boolean(deliveredOrder || nonDeliveredOrder);
    const isDelivered = Boolean(deliveredOrder);
    const hasReviewed = Boolean(existingReview);
    const canReview = isDelivered && !hasReviewed;

    let message = 'Reviews are available only after your order has been delivered.';
    if (hasReviewed) {
      message = 'You have already reviewed this product.';
    } else if (canReview) {
      message = 'You are eligible to review this delivered product.';
    } else if (nonDeliveredOrder) {
      message = `Your order #${nonDeliveredOrder.orderNumber} is currently ${nonDeliveredOrder.status}. Reviews unlock upon delivery.`;
    }

    return successResponse(res, 'Eligibility checked', {
      canReview,
      hasPurchased,
      isDelivered,
      hasReviewed,
      orderId: deliveredOrder ? deliveredOrder.id : null,
      orderNumber: deliveredOrder ? deliveredOrder.orderNumber : null,
      existingReview: existingReview || null,
      message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Add Review for Product (Authenticated - STRICT DELIVERED-ONLY ENFORCEMENT)
 */
const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images, orderId } = req.body;
    const userId = req.user.id;

    const score = parseInt(rating, 10);
    if (isNaN(score) || score < 1 || score > 5) {
      return errorResponse(res, 'Rating must be an integer between 1 and 5.', 422);
    }

    if (!comment || comment.trim().length < 5) {
      return errorResponse(res, 'Please write a review of at least 5 characters.', 422);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return errorResponse(res, 'Product not found.', 404);
    }

    // STRICT CHECK 1: Prevent Duplicate Reviews
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId },
    });

    if (existingReview) {
      return errorResponse(res, 'You have already submitted a review for this slipper.', 409);
    }

    // STRICT CHECK 2: Mandatory Delivered Order Verification
    // The customer must own an order containing this product that is in DELIVERED status.
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        ...(orderId ? { id: orderId } : {}),
        userId,
        status: 'DELIVERED',
        items: {
          some: {
            productId,
          },
        },
      },
    });

    if (!deliveredOrder) {
      // Check if order exists in another state (Shipped, Out for Delivery, Confirmed, etc.)
      const anyOrder = await prisma.order.findFirst({
        where: {
          userId,
          items: {
            some: {
              productId,
            },
          },
        },
        select: { status: true, orderNumber: true },
      });

      if (anyOrder) {
        return errorResponse(
          res,
          `Reviews are available only after your order (#${anyOrder.orderNumber}) has been delivered. Current status: ${anyOrder.status}.`,
          403
        );
      }

      return errorResponse(
        res,
        'Reviews are available only after your order has been delivered. No delivered purchase was found for your account.',
        403
      );
    }

    // Format images if provided
    let reviewImages = [];
    if (Array.isArray(images)) {
      reviewImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    }

    // Create Review Record with Verified Purchase = true
    const newReview = await prisma.review.create({
      data: {
        productId,
        userId,
        orderId: deliveredOrder.id,
        rating: score,
        title: title ? title.trim() : null,
        comment: comment.trim(),
        images: reviewImages,
        isVerifiedPurchase: true,
        isApproved: true,
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
    });

    // Recalculate average rating & review count for the product
    const allReviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const newAvg = (
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    ).toFixed(1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(newAvg),
        reviewCount: allReviews.length,
      },
    });

    return successResponse(res, 'Thank you! Your verified purchase review has been published.', newReview, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get Reviews Written by Logged-In User
 */
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
          },
        },
      },
    });

    return successResponse(res, 'User reviews retrieved', reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Delete User Review
 */
const deleteUserReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== req.user.id) {
      return errorResponse(res, 'Review not found.', 404);
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate average
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId, isApproved: true },
      select: { rating: true },
    });

    const newAvg = allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : 5.0;

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: parseFloat(newAvg),
        reviewCount: allReviews.length,
      },
    });

    return successResponse(res, 'Review deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Admin: Get All Reviews
 */
const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return successResponse(res, 'All reviews retrieved for administration', reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Admin: Toggle Review Approval
 */
const toggleReviewApprovalAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return errorResponse(res, 'Review not found.', 404);
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    // Recalculate product rating
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId, isApproved: true },
      select: { rating: true },
    });

    const newAvg = allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : 5.0;

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: parseFloat(newAvg),
        reviewCount: allReviews.length,
      },
    });

    return successResponse(res, `Review ${isApproved ? 'approved' : 'hidden'} successfully`, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Admin: Delete Review
 */
const deleteReviewAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return errorResponse(res, 'Review not found.', 404);
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate average
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId, isApproved: true },
      select: { rating: true },
    });

    const newAvg = allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : 5.0;

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: parseFloat(newAvg),
        reviewCount: allReviews.length,
      },
    });

    return successResponse(res, 'Review deleted by administrator');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  checkReviewEligibility,
  addReview,
  getUserReviews,
  deleteUserReview,
  getAllReviewsAdmin,
  toggleReviewApprovalAdmin,
  deleteReviewAdmin,
};
