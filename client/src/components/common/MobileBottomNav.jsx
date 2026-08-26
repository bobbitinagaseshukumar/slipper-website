import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const MobileBottomNav = () => {
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navItemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
      isActive ? 'text-luxury-accent font-bold scale-105' : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 px-2 py-1 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavLink to="/" className={navItemClass}>
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/shop" className={navItemClass}>
          <Compass className="w-5 h-5" />
          <span>Shop</span>
        </NavLink>

        <NavLink to="/wishlist" className={navItemClass}>
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span>Wishlist</span>
        </NavLink>

        <NavLink to="/cart" className={navItemClass}>
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-luxury-dark text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span>Bag</span>
        </NavLink>

        <NavLink to={isAuthenticated ? '/account' : '/login'} className={navItemClass}>
          <User className="w-5 h-5" />
          <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
        </NavLink>
      </div>
    </div>
  );
};

export default MobileBottomNav;
