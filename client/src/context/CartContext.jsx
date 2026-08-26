import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    originalSubtotal: 0,
    savings: 0,
    freeDeliveryEligible: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync cart when auth state changes
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          const res = await cartService.getCart();
          if (res?.data) {
            setCart(res.data);
          }
        } catch (error) {
          console.warn('Failed to load user cart:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Load guest cart from localStorage
        const stored = localStorage.getItem('aurasole_guest_cart');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCart(parsed);
          } catch (e) {
            // Ignore parse error
          }
        }
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (itemData) => {
    if (isAuthenticated) {
      const res = await cartService.addToCart(itemData);
      // Refresh cart
      const updatedCart = await cartService.getCart();
      if (updatedCart?.data) {
        setCart(updatedCart.data);
      }
      return res;
    } else {
      // Guest Cart Management
      const prevItems = cart.items || [];
      const { product, variant, size, color, quantity = 1 } = itemData;

      const unitPrice = variant?.priceOverride || product?.price || 899;
      const originalPrice = product?.originalPrice || unitPrice;

      const existingIndex = prevItems.findIndex(
        (i) => i.productId === itemData.productId && i.size === size && i.color === color
      );

      let newItems = [...prevItems];
      if (existingIndex >= 0) {
        newItems[existingIndex].quantity += quantity;
        newItems[existingIndex].totalPrice = newItems[existingIndex].quantity * unitPrice;
      } else {
        newItems.push({
          id: `guest-${Date.now()}`,
          productId: itemData.productId,
          productName: product?.name || 'Comfort Slipper',
          slug: product?.slug || '',
          image: product?.images?.[0]?.url || '',
          variantId: variant?.id || null,
          size,
          color,
          quantity,
          unitPrice,
          originalPrice,
          totalPrice: quantity * unitPrice,
          stockAvailable: variant?.stock || product?.stock || 50,
        });
      }

      let subtotal = 0;
      let originalSubtotal = 0;
      let itemCount = 0;

      newItems.forEach((i) => {
        subtotal += i.totalPrice;
        originalSubtotal += (i.originalPrice || i.unitPrice) * i.quantity;
        itemCount += i.quantity;
      });

      const updatedGuestCart = {
        items: newItems,
        itemCount,
        subtotal,
        originalSubtotal,
        savings: Math.max(0, originalSubtotal - subtotal),
        freeDeliveryEligible: subtotal >= 999,
      };

      setCart(updatedGuestCart);
      localStorage.setItem('aurasole_guest_cart', JSON.stringify(updatedGuestCart));
      return { success: true, message: 'Added to your bag' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated) {
      await cartService.updateQuantity(itemId, quantity);
      const updatedCart = await cartService.getCart();
      if (updatedCart?.data) {
        setCart(updatedCart.data);
      }
    } else {
      const newItems = cart.items
        .map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              quantity,
              totalPrice: quantity * item.unitPrice,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      let subtotal = 0;
      let originalSubtotal = 0;
      let itemCount = 0;
      newItems.forEach((i) => {
        subtotal += i.totalPrice;
        originalSubtotal += (i.originalPrice || i.unitPrice) * i.quantity;
        itemCount += i.quantity;
      });

      const updated = {
        items: newItems,
        itemCount,
        subtotal,
        originalSubtotal,
        savings: Math.max(0, originalSubtotal - subtotal),
        freeDeliveryEligible: subtotal >= 999,
      };
      setCart(updated);
      localStorage.setItem('aurasole_guest_cart', JSON.stringify(updated));
    }
  };

  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      await cartService.removeItem(itemId);
      const updatedCart = await cartService.getCart();
      if (updatedCart?.data) {
        setCart(updatedCart.data);
      }
    } else {
      const newItems = cart.items.filter((item) => item.id !== itemId);
      let subtotal = 0;
      let originalSubtotal = 0;
      let itemCount = 0;
      newItems.forEach((i) => {
        subtotal += i.totalPrice;
        originalSubtotal += (i.originalPrice || i.unitPrice) * i.quantity;
        itemCount += i.quantity;
      });

      const updated = {
        items: newItems,
        itemCount,
        subtotal,
        originalSubtotal,
        savings: Math.max(0, originalSubtotal - subtotal),
        freeDeliveryEligible: subtotal >= 999,
      };
      setCart(updated);
      localStorage.setItem('aurasole_guest_cart', JSON.stringify(updated));
    }
  };

  const value = {
    cart,
    itemCount: cart.itemCount || 0,
    subtotal: cart.subtotal || 0,
    savings: cart.savings || 0,
    freeDeliveryEligible: cart.freeDeliveryEligible,
    isLoading,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    addToCart,
    updateQuantity,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
