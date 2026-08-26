const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get User Wishlist
 */
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                discountPercentage: true,
                rating: true,
                reviewCount: true,
                stock: true,
                isActive: true,
                images: {
                  select: { url: true, isPrimary: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user.id },
        include: { items: [] },
      });
    }

    const products = wishlist.items.map((item) => item.product);

    return successResponse(res, 'Wishlist retrieved', {
      wishlistId: wishlist.id,
      itemCount: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Product in Wishlist (Add if not present, remove if present)
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required.', 400);
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user.id },
      });
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id },
      });
      return successResponse(res, 'Removed from wishlist', { isWishlisted: false });
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      return successResponse(res, 'Added to wishlist', { isWishlisted: true });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
