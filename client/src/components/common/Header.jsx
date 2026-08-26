import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Search,
  LogOut,
  Package,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import SearchBar from './SearchBar';

const Header = ({ onOpenMobileMenu }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useStoreSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [cartBounced, setCartBounced] = useState(false);
  const [wishlistBounced, setWishlistBounced] = useState(false);
  const navigate = useNavigate();

  // Handle scroll shadow/glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger bounce animation when cart count changes
  useEffect(() => {
    if (itemCount > 0) {
      setCartBounced(true);
      const timer = setTimeout(() => setCartBounced(false), 400);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  // Trigger bounce animation when wishlist count changes
  useEffect(() => {
    if (wishlistCount > 0) {
      setWishlistBounced(true);
      const timer = setTimeout(() => setWishlistBounced(false), 400);
      return () => clearTimeout(timer);
    }
  }, [wishlistCount]);

  const handleLogout = async () => {
    setShowUserDropdown(false);
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-all relative py-1 hover:text-luxury-accent ${
      isActive
        ? 'text-luxury-accent font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-luxury-accent after:rounded-full'
        : 'text-gray-700'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'glass-light shadow-luxury py-3'
            : 'bg-white/95 backdrop-blur-md py-4 border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3 lg:gap-8">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo with Dynamic Settings */}
            <Link to="/" className="flex items-center gap-2.5 group active:scale-98 transition-transform">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.storeName} className="h-9 max-w-[120px] object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-luxury-dark text-luxury-accent flex items-center justify-center font-display font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
                  <span>{settings.storeName ? settings.storeName.charAt(0).toUpperCase() : 'A'}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tight text-luxury-dark leading-none">
                  {settings.storeName || 'AuraSole'}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase leading-none mt-0.5">
                  {settings.tagline || 'Footwear Studio'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 ml-2">
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/shop" className={navLinkClass}>
                Shop All
              </NavLink>
              <NavLink to="/shop?category=men" className={navLinkClass}>
                Men
              </NavLink>
              <NavLink to="/shop?category=women" className={navLinkClass}>
                Women
              </NavLink>
              <NavLink to="/shop?category=kids" className={navLinkClass}>
                Kids
              </NavLink>
              <NavLink to="/shop?category=unisex" className={navLinkClass}>
                Wellness & Ortho
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
            </nav>
          </div>

          {/* Center / Right: Search & Actions */}
          <div className="flex items-center gap-3 sm:gap-5 flex-1 max-w-md justify-end">
            {/* Desktop Search */}
            <div className="hidden md:block w-full max-w-xs">
              <SearchBar />
            </div>

            {/* Mobile Search Trigger */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="md:hidden p-2 rounded-full text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Search slippers"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link with Micro Bounce */}
            <Link
              to="/wishlist"
              className={`relative p-2 rounded-full text-gray-700 hover:text-luxury-accent hover:bg-gray-100 active:scale-95 transition-all ${
                wishlistBounced ? 'scale-110 text-rose-500' : 'scale-100'
              }`}
              title="Saved Slippers"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span
                  className={`absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center transition-transform duration-300 ${
                    wishlistBounced ? 'scale-125' : 'scale-100'
                  }`}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link with Micro Bounce */}
            <Link
              to="/cart"
              className={`relative p-2 rounded-full text-gray-700 hover:text-luxury-accent hover:bg-gray-100 active:scale-95 transition-all ${
                cartBounced ? 'scale-110 text-luxury-accent' : 'scale-100'
              }`}
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span
                  className={`absolute top-0 right-0 w-4 h-4 rounded-full bg-luxury-dark text-white text-[10px] font-bold flex items-center justify-center transition-transform duration-300 ${
                    cartBounced ? 'scale-125 bg-luxury-accent text-luxury-dark' : 'scale-100'
                  }`}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account / User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200/80 active:scale-95 transition-all text-xs font-semibold text-gray-800"
                >
                  <div className="w-6 h-6 rounded-full bg-luxury-accent text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-luxury-warmWhite hover:text-luxury-accent transition-colors"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <Link
                        to="/account?tab=orders"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-luxury-warmWhite hover:text-luxury-accent transition-colors"
                      >
                        <Package className="w-4 h-4" /> Orders & Tracking
                      </Link>
                      {isAdmin && (
                        <div className="border-t border-gray-100 my-1">
                          <Link
                            to="/admin"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-luxury-accent hover:bg-stone-900 hover:text-white transition-colors rounded-lg mx-2"
                          >
                            <Settings className="w-4 h-4" /> Admin Portal
                          </Link>
                        </div>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-luxury-dark text-white hover:bg-luxury-accent text-xs font-semibold tracking-wide active:scale-95 transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex flex-col pt-16 md:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-4 shadow-2xl relative">
            <button
              onClick={() => setIsSearchModalOpen(false)}
              className="absolute right-3 top-3 p-1.5 rounded-full text-gray-400 hover:text-gray-700 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Search Slipper Studio</h3>
            <SearchBar
              isMobile={true}
              onSearchComplete={() => setIsSearchModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
