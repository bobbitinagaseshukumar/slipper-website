import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  X,
  ChevronRight,
  User,
  ShoppingBag,
  Heart,
  Package,
  Sparkles,
  PhoneCall,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileMenu = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-luxury-warmWhite">
            <Link to="/" onClick={onClose} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-luxury-dark text-luxury-accent flex items-center justify-center font-display font-bold text-sm">
                A
              </div>
              <span className="font-display font-black text-lg tracking-tight text-luxury-dark">
                Aura<span className="text-luxury-accent">Sole</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Bar */}
          <div className="p-4 bg-luxury-dark text-white">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-luxury-accent text-white font-bold flex items-center justify-center text-sm shadow-inner">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-luxury-accent">Welcome back,</p>
                  <p className="text-sm font-bold truncate">{user?.name}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-luxury-muted">Welcome to AuraSole Footwear</p>
                <div className="flex gap-2 mt-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="flex-1 py-1.5 bg-luxury-accent hover:bg-luxury-accentHover text-luxury-dark text-center rounded-lg text-xs font-bold transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white text-center rounded-lg text-xs font-semibold transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
              Collections
            </p>
            <NavLink
              to="/shop"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-luxury-warmWhite hover:text-luxury-accent transition-colors"
            >
              <span>Shop All Slippers</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </NavLink>
            <NavLink
              to="/shop?category=men"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-luxury-warmWhite hover:text-luxury-accent transition-colors"
            >
              <span>Men's Slippers & Slides</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </NavLink>
            <NavLink
              to="/shop?category=women"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-luxury-warmWhite hover:text-luxury-accent transition-colors"
            >
              <span>Women's Cloud Comfort</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </NavLink>
            <NavLink
              to="/shop?category=kids"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-luxury-warmWhite hover:text-luxury-accent transition-colors"
            >
              <span>Kids' Play Slippers</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </NavLink>
            <NavLink
              to="/shop?category=unisex"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-luxury-warmWhite hover:text-luxury-accent transition-colors"
            >
              <span>Orthopedic & Wellness</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </NavLink>

            <div className="pt-4 border-t border-gray-100 my-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
                Account & Help
              </p>
              {isAuthenticated && (
                <>
                  <Link
                    to="/account"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-luxury-warmWhite"
                  >
                    <User className="w-4 h-4 text-luxury-accent" /> Profile Settings
                  </Link>
                  <Link
                    to="/account"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-luxury-warmWhite"
                  >
                    <Package className="w-4 h-4 text-luxury-accent" /> My Orders
                  </Link>
                </>
              )}
              <Link
                to="/shop"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-luxury-warmWhite"
              >
                <Heart className="w-4 h-4 text-luxury-accent" /> Wishlist
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info in drawer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          ) : (
            <div className="text-center text-xs text-gray-500">
              <p className="font-semibold text-luxury-dark">Customer Support Helpline</p>
              <p className="mt-0.5 text-luxury-accent font-bold">1800-202-3030</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
