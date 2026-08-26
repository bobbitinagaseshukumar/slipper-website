const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get current user's Cart with full item details and calculated subtotal
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
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
                stock: true,
                isActive: true,
                images: {
                  select: { url: true, isPrimary: true },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                colorName: true,
                colorCode: true,
                stock: true,
                priceOverride: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: [] },
      });
    }

    // Calculate subtotal and item count
    let subtotal = 0;
    let originalSubtotal = 0;
    let itemCount = 0;

    const formattedItems = cart.items.map((item) => {
      const unitPrice = item.variant?.priceOverride || item.product.price;
      const originalPrice = item.product.originalPrice || unitPrice;
      const itemTotal = unitPrice * item.quantity;

      subtotal += itemTotal;
      originalSubtotal += originalPrice * item.quantity;
      itemCount += item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        slug: item.product.slug,
        image: item.product.images[0]?.url || '',
        variantId: item.variantId,
        size: item.size || item.variant?.size,
        color: item.color || item.variant?.colorName,
        quantity: item.quantity,
        unitPrice,
        originalPrice,
        totalPrice: itemTotal,
        stockAvailable: item.variant ? item.variant.stock : item.product.stock,
      };
    });

    const savings = Math.max(0, originalSubtotal - subtotal);

    return successResponse(res, 'Cart retrieved', {
      cartId: cart.id,
      items: formattedItems,
      itemCount,
      subtotal,
      originalSubtotal,
      savings,
      freeDeliveryEligible: subtotal >= 999,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to Cart with strict backend price and stock validation
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, size, color, quantity = 1 } = req.body;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (!productId) {
      return errorResponse(res, 'Product ID is required.', 400);
    }

    // 1. Authoritative Backend Product Verification
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      return errorResponse(res, 'This slipper is no longer available.', 404);
    }

    // 2. Authoritative Variant & Stock Verification
    let selectedVariant = null;
    if (variantId) {
      selectedVariant = product.variants.find((v) => v.id === variantId && v.isActive);
    } else if (size && color) {
      selectedVariant = product.variants.find(
        (v) => v.size === size && v.colorName.toLowerCase() === color.toLowerCase() && v.isActive
      );
    }

    const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (availableStock < qty) {
      return errorResponse(
        res,
        `Only ${availableStock} pair(s) available in this size/color combination.`,
        400
      );
    }

    // 3. Authoritative Price Calculation (Ignores any client-supplied price)
    const authoritativePrice = selectedVariant?.priceOverride || product.price;

    // 4. Find or Create User Cart
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    // 5. Check if same product & variant already exists in Cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: selectedVariant?.id || null,
        size: size || selectedVariant?.size || null,
      },
    });

    let cartItem;
    if (existingItem) {
      const newQuantity = existingItem.quantity + qty;
      if (newQuantity > availableStock) {
        return errorResponse(
          res,
          `You already have ${existingItem.quantity} in your cart. Only ${availableStock} total available.`,
          400
        );
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price: authoritativePrice,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: selectedVariant?.id || null,
          size: size || selectedVariant?.size || null,
          color: color || selectedVariant?.colorName || null,
          quantity: qty,
          price: authoritativePrice,
        },
      });
    }

    return successResponse(res, 'Added to your shopping bag!', cartItem, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Cart Item Quantity
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (isNaN(qty) || qty < 1) {
      return errorResponse(res, 'Quantity must be at least 1.', 400);
    }

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
        product: true,
        variant: true,
      },
    });

    if (!item || item.cart.userId !== req.user.id) {
      return errorResponse(res, 'Cart item not found.', 404);
    }

    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (qty > availableStock) {
      return errorResponse(
        res,
        `Cannot set quantity to ${qty}. Only ${availableStock} available in stock.`,
        400
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: qty },
    });

    return successResponse(res, 'Cart item updated', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove Item from Cart
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      return errorResponse(res, 'Cart item not found.', 404);
    }

    await prisma.cartItem.delete({ where: { id } });
    return successResponse(res, 'Item removed from bag');
  } catch (error) {
    next(error);
  }
};

/**
 * Move Cart Item to Wishlist
 */
const moveToWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      return errorResponse(res, 'Cart item not found.', 404);
    }

    await prisma.$transaction(async (tx) => {
      // Find or create wishlist
      let wishlist = await tx.wishlist.findUnique({
        where: { userId: req.user.id },
      });
      if (!wishlist) {
        wishlist = await tx.wishlist.create({
          data: { userId: req.user.id },
        });
      }

      // Add to wishlist if not already there
      const existingWishlistItem = await tx.wishlistItem.findUnique({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId: item.productId,
          },
        },
      });

      if (!existingWishlistItem) {
        await tx.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId: item.productId,
          },
        });
      }

      // Delete from cart
      await tx.cartItem.delete({ where: { id } });
    });

    return successResponse(res, 'Item moved to wishlist');
  } catch (error) {
    next(error);
  }
};

/**
 * Merge Guest Cart into Customer Cart on Login
 */
const mergeCart = async (req, res, next) => {
  try {
    const { guestItems = [] } = req.body;

    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return successResponse(res, 'No items to merge');
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
    }

    for (const gItem of guestItems) {
      if (!gItem.productId) continue;

      const product = await prisma.product.findUnique({
        where: { id: gItem.productId },
        include: { variants: true },
      });

      if (!product || !product.isActive) continue;

      const variant = gItem.variantId
        ? product.variants.find((v) => v.id === gItem.variantId && v.isActive)
        : null;

      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock <= 0) continue;

      const requestedQty = Math.min(availableStock, Math.max(1, gItem.quantity || 1));
      const authoritativePrice = variant?.priceOverride || product.price;

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: gItem.productId,
          variantId: variant?.id || null,
          size: gItem.size || variant?.size || null,
        },
      });

      if (existingItem) {
        const mergedQty = Math.min(availableStock, existingItem.quantity + requestedQty);
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: mergedQty, price: authoritativePrice },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: gItem.productId,
            variantId: variant?.id || null,
            size: gItem.size || variant?.size || null,
            color: gItem.color || variant?.colorName || null,
            quantity: requestedQty,
            price: authoritativePrice,
          },
        });
      }
    }

    return successResponse(res, 'Guest bag merged with account successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  moveToWishlist,
  mergeCart,
};
