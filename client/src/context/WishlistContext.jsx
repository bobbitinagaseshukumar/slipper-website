import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (!product || !product.id) return;

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
      }
    } else {
      // Guest Wishlist management
      const exists = isWishlisted(product.id);
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
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      await wishlistService.toggleWishlist(productId);
      setWishlist((prev) => prev.filter((p) => p.id !== productId));
    } else {
      const updated = wishlist.filter((p) => p.id !== productId);
      setWishlist(updated);
      localStorage.setItem('aurasole_guest_wishlist', JSON.stringify(updated));
    }
  };

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    isLoading,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
  };

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
