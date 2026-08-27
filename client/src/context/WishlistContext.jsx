import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync wishlist when auth state changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          const res = await wishlistService.getWishlist();
          if (res?.data?.products) {
            setWishlist(res.data.products);
          }
        } catch (err) {
          console.warn('Failed to load wishlist:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        const stored = localStorage.getItem('aurasole_guest_wishlist');
        if (stored) {
          try {
            setWishlist(JSON.parse(stored));
          } catch (e) {
            // Ignore parse error
          }
        }
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const isWishlisted = useCallback((productId) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback(async (product) => {
    if (!product || !product.id) return false;

    if (isAuthenticated) {
      try {
        const res = await wishlistService.toggleWishlist(product.id);
        const isNowSaved = res.data?.isWishlisted;

        if (isNowSaved) {
          setWishlist((prev) => [...prev, product]);
        } else {
          setWishlist((prev) => prev.filter((p) => p.id !== product.id));
        }
        return isNowSaved;
      } catch (err) {
        console.error('Wishlist toggle error:', err);
        return false;
      }
    } else {
      // Guest Wishlist management
      const exists = wishlist.some((p) => p.id === product.id);
      let updated;
      if (exists) {
        updated = wishlist.filter((p) => p.id !== product.id);
      } else {
        updated = [...wishlist, product];
      }
      setWishlist(updated);
      localStorage.setItem('aurasole_guest_wishlist', JSON.stringify(updated));
      return !exists;
    }
  }, [isAuthenticated, wishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (isAuthenticated) {
      try {
        await wishlistService.toggleWishlist(productId);
        setWishlist((prev) => prev.filter((p) => p.id !== productId));
      } catch (err) {
        console.error('Failed to remove from wishlist:', err);
      }
    } else {
      const updated = wishlist.filter((p) => p.id !== productId);
      setWishlist(updated);
      localStorage.setItem('aurasole_guest_wishlist', JSON.stringify(updated));
    }
  }, [isAuthenticated, wishlist]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    wishlist,
    wishlistCount: wishlist.length,
    isLoading,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
  }), [wishlist, isLoading, isWishlisted, toggleWishlist, removeFromWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
