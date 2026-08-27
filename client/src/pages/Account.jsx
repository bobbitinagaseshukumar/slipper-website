import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Package,
  Heart,
  MapPin,
  Star,
  Clock,
  Bell,
  Tag,
  Shield,
  HelpCircle,
  LogOut,
  Camera,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Search,
  Check,
  Phone,
  MessageCircle,
  Mail,
  ChevronDown,
  ShoppingBag,
  Settings as SettingsIcon,
  RotateCcw,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Globe,
  ShieldAlert,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  Send,
  Lock,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

import userService from '../services/userService';
import orderService from '../services/orderService';
import addressService from '../services/addressService';
import notificationService from '../services/notificationService';
import couponService from '../services/couponService';
import reviewService from '../services/reviewService';

import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';
import AccountSidebar from '../components/account/AccountSidebar';
import OrderDetailsModal from '../components/account/OrderDetailsModal';
import AddressModal from '../components/checkout/AddressModal';
import WriteReviewModal from '../components/reviews/WriteReviewModal';

const Account = () => {
  const { user, updateUser, logout } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { tab: routeTab, orderNumber } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || routeTab || (orderNumber ? 'orders' : 'dashboard');
  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderPagination, setOrderPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Settings & Communication Preferences State
  const [commPrefs, setCommPrefs] = useState({
    orderUpdatesEmail: true,
    orderUpdatesWhatsApp: true,
    promotionalOffers: true,
    newArrivalAlerts: false,
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [securityMsg, setSecurityMsg] = useState(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Active Sessions & Devices State
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // Email Change with OTP State
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [emailChangeMsg, setEmailChangeMsg] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Active Coupons State
  const [coupons, setCoupons] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  // User Written Reviews State
  const [userReviews, setUserReviews] = useState([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);

  // Recently Viewed State
  const [recentViews, setRecentViews] = useState([]);

  // FAQ Open State
  const [openFaq, setOpenFaq] = useState(null);

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      setIsLoadingDashboard(true);
      const res = await userService.getDashboard();
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // Load Orders
  const loadOrders = async (page = 1) => {
    try {
      setIsLoadingOrders(true);
      const res = await orderService.getUserOrders({
        page,
        status: orderStatusFilter,
        search: orderSearch,
      });
      if (res?.data) {
        setOrders(res.data.orders);
        setOrderPagination(res.data.pagination);

        // If URL contains orderNumber, auto-select it
        if (orderNumber) {
          const match = res.data.orders.find((o) => o.orderNumber === orderNumber);
          if (match) setSelectedOrderForModal(match);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Load Addresses
  const loadAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await addressService.getAddresses();
      if (res?.data) setAddresses(res.data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Load Notifications
  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res?.data) {
        setNotifications(res.data.notifications);
        setUnreadNotificationsCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  // Load Coupons
  const loadCoupons = async () => {
    try {
      const res = await couponService.getActiveCoupons();
      if (res?.data) setCoupons(res.data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  // Load User Reviews
  const loadUserReviews = async () => {
    try {
      const res = await reviewService.getUserReviews();
      if (res?.data) setUserReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  // Load Recently Viewed from localStorage
  const loadRecentViews = () => {
    const stored = JSON.parse(localStorage.getItem('aurasole_recent_views') || '[]');
    setRecentViews(stored.slice(0, 20));
  };

  useEffect(() => {
    loadDashboard();
    loadAddresses();
    loadNotifications();
    loadCoupons();
    loadUserReviews();
    loadRecentViews();
  }, []);

  useEffect(() => {
    if (currentTab === 'orders') {
      loadOrders(1);
    } else if (currentTab === 'security') {
      loadSessions();
    }
  }, [currentTab, orderStatusFilter, orderSearch, orderNumber]);

  // Load Active Sessions & Devices
  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const res = await userService.getSessions();
      if (res?.data) setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Revoke Specific Session
  const handleRevokeSession = async (sessionId) => {
    try {
      await userService.revokeSession(sessionId);
      await loadSessions();
      setSecurityMsg({ type: 'success', text: 'Device session logged out successfully.' });
    } catch (err) {
      setSecurityMsg({ type: 'error', text: err.message || 'Failed to revoke device session.' });
    }
  };

  // Log Out All Devices (Customer Strict)
  const handleLogoutAllSessions = async () => {
    if (!window.confirm('Are you sure you want to log out from all devices? You will need to log in again on all devices.')) {
      return;
    }
    setIsLoggingOutAll(true);
    try {
      await userService.logoutAllSessions();
      logout();
      navigate('/login');
    } catch (err) {
      setSecurityMsg({ type: 'error', text: err.message || 'Failed to log out of all devices.' });
      setIsLoggingOutAll(false);
    }
  };

  // Request Email Change OTP
  const handleRequestEmailOtp = async (e) => {
    e.preventDefault();
    setEmailChangeMsg(null);
    if (!newEmailInput) return;
    setIsSendingEmailOtp(true);
    try {
      const res = await userService.requestEmailChangeOtp(newEmailInput);
      setEmailOtpSent(true);
      setEmailChangeMsg({ type: 'success', text: res.message || 'Verification code sent to your new email.' });
    } catch (err) {
      setEmailChangeMsg({ type: 'error', text: err.message || 'Failed to send verification code.' });
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  // Verify Email Change OTP
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    setEmailChangeMsg(null);
    if (!emailOtpInput) return;
    setIsVerifyingEmailOtp(true);
    try {
      const res = await userService.verifyEmailChangeOtp(newEmailInput, emailOtpInput);
      if (res?.data) {
        updateUser(res.data);
      }
      setEmailChangeMsg({ type: 'success', text: 'Email address updated successfully!' });
      setTimeout(() => {
        setIsChangingEmail(false);
        setNewEmailInput('');
        setEmailOtpInput('');
        setEmailOtpSent(false);
        setEmailChangeMsg(null);
        loadNotifications();
      }, 1500);
    } catch (err) {
      setEmailChangeMsg({ type: 'error', text: err.message || 'Invalid or expired verification code.' });
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  // Profile Image Base64 Handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Image file size must be less than 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);

    try {
      const res = await userService.updateProfile(profileForm);
      if (res?.data) {
        updateUser(res.data);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save New Password & Force Logout All Devices
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setSecurityMsg(null);

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
        confirmPassword: securityForm.confirmPassword,
      });
      setSecurityMsg({
        type: 'success',
        text: 'Password changed successfully! All devices have been logged out for security. Redirecting to login...',
      });
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2500);
    } catch (err) {
      setSecurityMsg({ type: 'error', text: err.message || 'Failed to change password.' });
      setIsSavingPassword(false);
    }
  };

  // Mark single notification as read
  const handleMarkSingleNotificationRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadNotificationsCount((c) => Math.max(0, c - 1));
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    await notificationService.markAllAsRead();
    setUnreadNotificationsCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Delete Address
  const handleDeleteAddress = async (id) => {
    await addressService.deleteAddress(id);
    loadAddresses();
  };

  // Set Default Address
  const handleSetDefaultAddress = async (id) => {
    await addressService.setDefaultAddress(id);
    loadAddresses();
  };

  // Copy Coupon Code
  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  // Submit Product Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewProduct) return;
    setIsSubmittingReview(true);
    setReviewMsg(null);

    try {
      await reviewService.addReview(reviewProduct.id, reviewForm);
      setReviewMsg({ type: 'success', text: 'Review submitted successfully!' });
      setIsWriteReviewOpen(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      loadUserReviews();
    } catch (err) {
      setReviewMsg({ type: 'error', text: err.message || 'Failed to submit review.' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const breadcrumbs = [
    { label: 'Customer Account', link: '/account' },
    { label: currentTab.charAt(0).toUpperCase() + currentTab.slice(1).replace(/-/g, ' ') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Breadcrumbs items={breadcrumbs} />

        {/* Mobile Horizontal Navigation Tabs */}
        <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'orders', label: 'Orders' },
            { id: 'wishlist', label: `Wishlist (${wishlist.length})` },
            { id: 'profile', label: 'Profile' },
            { id: 'addresses', label: 'Addresses' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'recently-viewed', label: 'Recent' },
            { id: 'notifications', label: `Alerts (${unreadNotificationsCount})` },
            { id: 'coupons', label: 'Coupons' },
            { id: 'settings', label: 'Settings' },
            { id: 'help', label: 'Help' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-colors shadow-2xs ${
                currentTab === tab.id
                  ? 'bg-luxury-dark text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop Sidebar + Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="hidden lg:block">
            <AccountSidebar activeTab={currentTab} onSelectTab={handleSelectTab} />
          </div>

          {/* Main Sub-tab Content Area */}
          <div className="flex-1 w-full min-w-0">
            {/* 1. DASHBOARD TAB */}
            {currentTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-luxury-dark via-gray-900 to-luxury-dark rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10 space-y-2">
                    <span className="px-3 py-1 rounded-full bg-white/15 text-luxury-accent text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                      Customer Portal
                    </span>
                    <h1 className="font-display font-black text-2xl sm:text-3xl">
                      Welcome back, {user?.name?.split(' ')[0] || 'Valued Member'}!
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300 max-w-lg">
                      Track your orders, manage saved footwear addresses, view active coupons, and explore luxury slipper designs tailored for all-day comfort.
                    </p>
                  </div>
                </div>

                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div
                    onClick={() => handleSelectTab('orders')}
                    className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 text-luxury-dark flex items-center justify-center mb-3 group-hover:bg-luxury-dark group-hover:text-luxury-accent transition-colors">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="font-display font-black text-2xl text-luxury-dark block">
                      {dashboardData?.summary?.totalOrders ?? 0}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">Total Orders</span>
                  </div>

                  <div
                    onClick={() => handleSelectTab('orders')}
                    className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="font-display font-black text-2xl text-luxury-dark block">
                      {dashboardData?.summary?.pendingOrders ?? 0}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">In Transit / Pending</span>
                  </div>

                  <div
                    onClick={() => handleSelectTab('orders')}
                    className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="font-display font-black text-2xl text-luxury-dark block">
                      {dashboardData?.summary?.deliveredOrders ?? 0}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">Delivered Pairs</span>
                  </div>

                  <div
                    onClick={() => handleSelectTab('wishlist')}
                    className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      <Heart className="w-5 h-5" />
                    </div>
                    <span className="font-display font-black text-2xl text-luxury-dark block">
                      {wishlist?.length || dashboardData?.summary?.wishlistCount || 0}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">Saved Slippers</span>
                  </div>
                </div>

                {/* Recent Orders Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="font-display font-bold text-base text-luxury-dark uppercase tracking-wider">
                      Recent Orders
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('orders')}
                      className="text-xs font-bold text-luxury-accent hover:underline flex items-center gap-1"
                    >
                      View All Orders <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-2xl bg-stone-50/70 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-luxury-dark font-bold text-xs shrink-0">
                              <Package className="w-5 h-5 text-luxury-accent" />
                            </div>
                            <div>
                              <p className="font-display font-black text-xs text-gray-900">
                                #{ord.orderNumber}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {ord._count?.items || ord.items?.length || 1} items • ₹{ord.finalAmount} •{' '}
                                {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 text-[10px] font-bold">
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForModal(ord)}
                              className="px-3.5 py-1.5 bg-luxury-dark text-white hover:bg-luxury-accent hover:text-luxury-dark rounded-xl text-xs font-bold transition-colors"
                            >
                              Track Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-gray-50/50 rounded-2xl">
                      <p className="text-xs text-gray-500 mb-3">You haven't placed any slipper orders yet.</p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-luxury-dark text-white rounded-xl text-xs font-bold hover:bg-luxury-accent"
                      >
                        Explore Slippers <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Quick Action Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleSelectTab('profile')}
                    className="p-5 bg-white rounded-3xl border border-gray-100 shadow-2xs hover:shadow-md transition-all text-left group"
                  >
                    <User className="w-5 h-5 text-luxury-accent mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-display font-bold text-xs text-gray-900">Edit Profile</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Name, phone, photo</p>
                  </button>

                  <button
                    onClick={() => handleSelectTab('addresses')}
                    className="p-5 bg-white rounded-3xl border border-gray-100 shadow-2xs hover:shadow-md transition-all text-left group"
                  >
                    <MapPin className="w-5 h-5 text-luxury-accent mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-display font-bold text-xs text-gray-900">Addresses</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{addresses.length} saved places</p>
                  </button>

                  <button
                    onClick={() => handleSelectTab('coupons')}
                    className="p-5 bg-white rounded-3xl border border-gray-100 shadow-2xs hover:shadow-md transition-all text-left group"
                  >
                    <Tag className="w-5 h-5 text-luxury-accent mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-display font-bold text-xs text-gray-900">Discount Coupons</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Exclusive savings</p>
                  </button>
                </div>
              </div>
            )}

            {/* 2. PROFILE TAB */}
            {currentTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100/90 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display font-black text-xl text-luxury-dark">Personal Profile</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Update your account details and contact information.
                  </p>
                </div>

                {profileMsg && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                      profileMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {profileMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      {profileForm.profileImage ? (
                        <img
                          src={profileForm.profileImage}
                          alt="Profile"
                          className="w-20 h-20 rounded-3xl object-cover border-2 border-luxury-accent shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-3xl bg-luxury-dark text-luxury-accent font-display font-black text-2xl flex items-center justify-center shadow-md">
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <label className="absolute -bottom-2 -right-2 p-2 bg-white text-gray-700 hover:text-luxury-dark rounded-xl shadow-md border border-gray-200 cursor-pointer transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <p className="font-bold text-xs text-gray-900">Profile Photo</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, or WEBP up to 2MB</p>
                      {profileForm.profileImage && (
                        <button
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, profileImage: '' })}
                          className="text-[11px] font-bold text-rose-600 hover:underline mt-1 block"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone Number & WhatsApp Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                        WhatsApp Number (Order Alerts)
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="WhatsApp contact"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="py-3 px-8 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
                  </button>
                </form>
              </div>
            )}

            {/* 3. ORDERS & TRACKING TAB */}
            {currentTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display font-black text-xl text-luxury-dark">My Orders & Tracking</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    View complete footwear purchase history, track shipments, and request returns.
                  </p>
                </div>

                {/* Filter and Search Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4 border-b border-gray-100">
                  {/* Status Pills */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                    {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors whitespace-nowrap ${
                          orderStatusFilter === st
                            ? 'bg-luxury-dark text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {st === 'ALL' ? 'All' : st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search order number..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-luxury-accent"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Orders List */}
                {isLoadingOrders ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-luxury-accent" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl border border-gray-200/80 bg-white hover:border-gray-300 transition-all shadow-2xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                          <div>
                            <span className="font-display font-black text-sm text-luxury-dark">
                              #{ord.orderNumber}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              Placed {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : ord.status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                            <span className="font-display font-black text-sm text-luxury-dark">
                              ₹{ord.finalAmount}
                            </span>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                            {ord.items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <img
                                  src={
                                    item.product?.images?.[0]?.url ||
                                    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=100'
                                  }
                                  alt={item.productName}
                                  className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-gray-100"
                                />
                                <div className="text-xs">
                                  <p className="font-bold text-gray-900 max-w-[140px] truncate">
                                    {item.productName}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    Size UK {item.size} • Qty {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            {ord.status === 'DELIVERED' && (
                              userReviews.some((r) => r.orderId === ord.id || r.productId === ord.items?.[0]?.productId) ? (
                                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-200">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Reviewed ✓</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const firstItem = ord.items?.[0];
                                    if (firstItem) {
                                      setReviewProduct(firstItem.product || { id: firstItem.productId, name: firstItem.productName, images: firstItem.product?.images });
                                      setSelectedOrderForReview(ord.id);
                                      setIsWriteReviewOpen(true);
                                    }
                                  }}
                                  className="px-3.5 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-amber-200/70"
                                >
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span>Write a Review</span>
                                </button>
                              )
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedOrderForModal(ord)}
                              className="px-4 py-2 bg-luxury-dark text-white hover:bg-luxury-accent hover:text-luxury-dark rounded-xl text-xs font-bold transition-colors shadow-xs"
                            >
                              View Details & Tracking
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {orderPagination.totalPages > 1 && (
                      <div className="pt-4 flex justify-center gap-2">
                        {[...Array(orderPagination.totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => loadOrders(i + 1)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                              orderPagination.page === i + 1
                                ? 'bg-luxury-dark text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50/60 rounded-3xl p-6">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800">No matching orders found.</p>
                    <p className="text-xs text-gray-500 mt-0.5">Explore our footwear collections!</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. WISHLIST TAB */}
            {currentTab === 'wishlist' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-xl text-luxury-dark">Saved Wishlist</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Your saved slipper styles ({wishlist.length} items)
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    className="text-xs font-bold text-luxury-accent hover:underline flex items-center gap-1"
                  >
                    Shop More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-stone-50/60 rounded-2xl border border-gray-100 flex flex-col justify-between group"
                      >
                        <Link
                          to={`/products/${item.slug}`}
                          className="aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 mb-2 relative block"
                        >
                          <img
                            src={
                              item.images?.[0]?.url ||
                              item.image ||
                              'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=300'
                            }
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeFromWishlist(item.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-500 hover:bg-rose-50 shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <div className="space-y-2">
                          <div>
                            <p className="font-display font-bold text-xs text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="font-black text-xs text-luxury-dark mt-0.5">₹{item.price}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              addToCart({
                                productId: item.id,
                                size: '8',
                                color: 'Obsidian Black',
                                quantity: 1,
                              });
                            }}
                            className="w-full py-1.5 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" /> Move to Bag
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50/50 rounded-2xl">
                    <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Your wishlist is empty.</p>
                  </div>
                )}
              </div>
            )}

            {/* 5. ADDRESSES TAB */}
            {currentTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-xl text-luxury-dark">
                      Saved Delivery Addresses
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Manage shipping addresses for fast 1-click checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressToEdit(null);
                      setIsAddressModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-luxury-dark text-white rounded-xl text-xs font-bold hover:bg-luxury-accent hover:text-luxury-dark transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Address
                  </button>
                </div>

                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                          addr.isDefault
                            ? 'border-luxury-dark bg-luxury-warmWhite/50 shadow-xs'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-display font-bold text-xs text-gray-900">
                              {addr.fullName}
                            </span>
                            <div className="flex items-center gap-1">
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 rounded-full bg-luxury-dark text-white text-[9px] font-bold">
                                  Default
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-bold">
                                {addr.addressType}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed font-normal">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                          <p className="text-xs text-gray-600 font-semibold">
                            {addr.city}, {addr.state} — {addr.postalCode}
                          </p>
                          <p className="text-[11px] text-gray-500">Phone: {addr.phone}</p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-[11px] font-bold text-luxury-accent hover:underline"
                            >
                              Set as Default
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              ✓ Primary Address
                            </span>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAddressToEdit(addr);
                                setIsAddressModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50/50 rounded-2xl">
                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No saved addresses yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* 6. REVIEWS TAB */}
            {currentTab === 'reviews' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display font-black text-xl text-luxury-dark">
                    My Slipper Reviews
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verified feedback you have contributed to our footwear community.
                  </p>
                </div>

                {reviewMsg && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                      reviewMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    <span>{reviewMsg.text}</span>
                  </div>
                )}

                {userReviews.length > 0 ? (
                  <div className="space-y-4">
                    {userReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-5 rounded-2xl border border-gray-100 bg-stone-50/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/products/${rev.product?.slug}`}
                            className="font-display font-bold text-xs text-gray-900 hover:text-luxury-accent"
                          >
                            {rev.product?.name}
                          </Link>
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-current' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rev.title && (
                          <h4 className="font-bold text-xs text-gray-800">"{rev.title}"</h4>
                        )}
                        <p className="text-xs text-gray-600">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50/50 rounded-2xl">
                    <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">You haven't written any reviews yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* 7. RECENTLY VIEWED TAB */}
            {currentTab === 'recently-viewed' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-xl text-luxury-dark">
                      Recently Viewed Slippers
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Footwear you recently explored</p>
                  </div>
                  {recentViews.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('aurasole_recent_views');
                        setRecentViews([]);
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {recentViews.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {recentViews.map((item) => (
                      <Link
                        key={item.id}
                        to={`/products/${item.slug}`}
                        className="p-3 bg-stone-50 rounded-2xl border border-gray-100 hover:shadow-md transition-all group"
                      >
                        <div className="aspect-[4/5] rounded-xl overflow-hidden bg-white mb-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="font-display font-bold text-xs text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="font-black text-xs text-luxury-dark mt-0.5">₹{item.price}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50/50 rounded-2xl">
                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No recently viewed slippers.</p>
                  </div>
                )}
              </div>
            )}

            {/* 8. NOTIFICATIONS TAB */}
            {currentTab === 'notifications' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-xl text-luxury-dark">
                      Notification Center
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Order dispatch alerts, returns, and important announcements
                    </p>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      className="text-xs font-bold text-luxury-accent hover:underline"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((n) => {
                      const isSec = n.isSecurityAlert || n.type === 'SECURITY';
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleMarkSingleNotificationRead(n.id)}
                          className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                            isSec
                              ? n.isRead
                                ? 'bg-rose-50/30 border-rose-200/60 text-stone-800'
                                : 'bg-rose-50/80 border-rose-300 text-rose-950 shadow-xs font-semibold'
                              : n.isRead
                              ? 'bg-stone-50/60 border-gray-100 text-gray-600'
                              : 'bg-luxury-warmWhite/80 border-luxury-accent/30 text-gray-900 shadow-2xs font-semibold'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isSec
                                ? 'bg-rose-950 text-rose-400'
                                : 'bg-luxury-dark text-luxury-accent'
                            }`}
                          >
                            {isSec ? <ShieldAlert className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold">{n.title}</p>
                                {isSec && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold border border-rose-200">
                                    🔴 Security Alert
                                  </span>
                                )}
                              </div>
                              {!n.isRead && (
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isSec ? 'bg-rose-600 animate-pulse' : 'bg-luxury-accent'
                                  }`}
                                />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 font-normal">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50/50 rounded-2xl">
                    <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">You're all caught up!</p>
                  </div>
                )}
              </div>
            )}

            {/* 9. COUPONS TAB */}
            {currentTab === 'coupons' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display font-black text-xl text-luxury-dark">Active Coupons</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Exclusive discounts available for your slipper orders.
                  </p>
                </div>

                {coupons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coupons.map((c) => (
                      <div
                        key={c.id}
                        className="p-5 rounded-3xl border-2 border-dashed border-luxury-accent/50 bg-luxury-warmWhite flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-sm text-luxury-dark bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
                              {c.code}
                            </span>
                            <span className="font-bold text-xs text-emerald-700">
                              {c.discountType === 'PERCENTAGE'
                                ? `${c.discountValue}% OFF`
                                : `₹${c.discountValue} OFF`}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{c.description}</p>
                          <p className="text-[11px] text-gray-400">
                            Min. Order: ₹{c.minOrderAmount} • Expires{' '}
                            {new Date(c.validUntil).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(c.code)}
                          className="w-full py-2 bg-luxury-dark text-white hover:bg-luxury-accent hover:text-luxury-dark font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          {copiedCoupon === c.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied to Clipboard!</span>
                            </>
                          ) : (
                            <span>Copy Promo Code</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50/50 rounded-2xl">
                    <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No active coupons right now.</p>
                  </div>
                )}
              </div>
            )}

            {/* 10. SETTINGS & SECURITY TAB */}
            {(currentTab === 'settings' || currentTab === 'security') && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100/90 shadow-sm space-y-8 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-display font-black text-xl text-luxury-dark">
                      Account Security & Session Center
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Manage active devices, secure credentials, and authentication sessions.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-[11px] font-bold self-start sm:self-auto">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>4-Day Inactivity Session Rule Active</span>
                  </div>
                </div>

                {/* Status Message Banner */}
                {securityMsg && (
                  <div
                    className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                      securityMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {securityMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{securityMsg.text}</span>
                  </div>
                )}

                {/* 1. LOGIN & ACTIVE SESSIONS / LOGGED-IN DEVICES */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-2">
                        <span>Logged-in Devices & Active Sessions</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-mono">
                          {sessions.length || 1}
                        </span>
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Sessions automatically expire only after 4 days of inactivity. Continuous use keeps you signed in.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={loadSessions}
                      disabled={isLoadingSessions}
                      className="p-1.5 text-gray-400 hover:text-luxury-dark rounded-lg hover:bg-gray-100 transition-colors"
                      title="Refresh Devices"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingSessions ? (
                    <div className="py-6 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-luxury-accent" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sessions.length > 0 ? (
                        sessions.map((s) => (
                          <div
                            key={s.id}
                            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                              s.isCurrent
                                ? 'bg-luxury-warmWhite/70 border-luxury-accent/50 shadow-2xs'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-stone-100 text-luxury-dark flex items-center justify-center shrink-0 mt-0.5">
                                {s.deviceType === 'Mobile' ? (
                                  <Smartphone className="w-4 h-4 text-luxury-accent" />
                                ) : s.deviceType === 'Tablet' ? (
                                  <Tablet className="w-4 h-4 text-luxury-accent" />
                                ) : (
                                  <Laptop className="w-4 h-4 text-luxury-accent" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-xs text-gray-900">{s.deviceName}</p>
                                  {s.isCurrent && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-200">
                                      This Device
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  {s.browser} • {s.os}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  Last active: {new Date(s.lastActivityAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>

                            {!s.isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleRevokeSession(s.id)}
                                className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200/60"
                              >
                                Log Out
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full p-4 rounded-2xl bg-luxury-warmWhite/70 border border-gray-200 flex items-center gap-3">
                          <Laptop className="w-5 h-5 text-luxury-accent" />
                          <div>
                            <p className="font-bold text-xs text-gray-900">Current Active Browser</p>
                            <p className="text-[11px] text-gray-500">Inactivity timer extends on every interaction.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      disabled={isLoggingOutAll}
                      onClick={handleLogoutAllSessions}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isLoggingOutAll ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>Log out of all devices</span>
                    </button>
                  </div>
                </div>

                {/* 2. EMAIL ADDRESS & OTP VERIFICATION */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-800">
                        Email Address Verification
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Current: <span className="font-semibold text-gray-800">{user?.email}</span>
                      </p>
                    </div>

                    {!isChangingEmail && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingEmail(true);
                          setEmailOtpSent(false);
                          setEmailChangeMsg(null);
                        }}
                        className="px-3.5 py-1.5 bg-white border border-gray-200 text-luxury-dark hover:border-luxury-accent rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        Change Email
                      </button>
                    )}
                  </div>

                  {isChangingEmail && (
                    <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-3 animate-in fade-in">
                      <p className="text-xs font-bold text-gray-900">
                        Enter your new email address to receive a secure 6-digit OTP verification code:
                      </p>

                      {emailChangeMsg && (
                        <div
                          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                            emailChangeMsg.type === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {emailChangeMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>{emailChangeMsg.text}</span>
                        </div>
                      )}

                      {!emailOtpSent ? (
                        <form onSubmit={handleRequestEmailOtp} className="flex flex-col sm:flex-row gap-2 max-w-md">
                          <input
                            type="email"
                            required
                            placeholder="new.email@example.com"
                            value={newEmailInput}
                            onChange={(e) => setNewEmailInput(e.target.value)}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent"
                          />
                          <button
                            type="submit"
                            disabled={isSendingEmailOtp}
                            className="px-4 py-2 bg-luxury-dark text-white rounded-xl text-xs font-bold hover:bg-luxury-accent hover:text-luxury-dark transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {isSendingEmailOtp ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Send OTP</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsChangingEmail(false)}
                            className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyEmailOtp} className="space-y-3 max-w-md">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                              Enter 6-Digit Code sent to {newEmailInput}
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              placeholder="123456"
                              value={emailOtpInput}
                              onChange={(e) => setEmailOtpInput(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-mono tracking-widest text-center text-gray-900 focus:outline-none focus:border-luxury-accent"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={isVerifyingEmailOtp || emailOtpInput.length !== 6}
                              className="flex-1 py-2 bg-luxury-dark text-white rounded-xl text-xs font-bold hover:bg-luxury-accent hover:text-luxury-dark transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              {isVerifyingEmailOtp ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <span>Verify & Update Email</span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEmailOtpSent(false)}
                              className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                            >
                              Change Address
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. PASSWORD CHANGE FORM (WITH EYE ICONS ON EVERY FIELD) */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-800">
                      Change Password
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Changing your password will immediately revoke all active sessions across all devices for security.
                    </p>
                  </div>

                  <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
                    {/* Current Password Field */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          required
                          value={securityForm.currentPassword}
                          onChange={(e) =>
                            setSecurityForm({ ...securityForm, currentPassword: e.target.value })
                          }
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password Field */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                        New Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={securityForm.newPassword}
                          onChange={(e) =>
                            setSecurityForm({ ...securityForm, newPassword: e.target.value })
                          }
                          placeholder="At least 8 characters"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          aria-label={showNewPass ? 'Hide password' : 'Show password'}
                        >
                          {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password Field */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={securityForm.confirmPassword}
                          onChange={(e) =>
                            setSecurityForm({ ...securityForm, confirmPassword: e.target.value })
                          }
                          placeholder="Re-enter new password"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Updating your password will automatically log you out of all active devices.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="py-3 px-8 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingPassword ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* 4. COMMUNICATION PREFERENCES */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-gray-100 space-y-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-800">
                    Notification & Order Alert Channels
                  </h3>
                  <div className="space-y-3 text-xs">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={commPrefs.orderUpdatesEmail}
                        onChange={(e) => setCommPrefs({ ...commPrefs, orderUpdatesEmail: e.target.checked })}
                        className="rounded text-luxury-dark focus:ring-luxury-accent w-4 h-4"
                      />
                      <span>Email transactional dispatch & invoice updates</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={commPrefs.orderUpdatesWhatsApp}
                        onChange={(e) => setCommPrefs({ ...commPrefs, orderUpdatesWhatsApp: e.target.checked })}
                        className="rounded text-luxury-dark focus:ring-luxury-accent w-4 h-4"
                      />
                      <span>WhatsApp live order tracking & delivery alerts</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={commPrefs.promotionalOffers}
                        onChange={(e) => setCommPrefs({ ...commPrefs, promotionalOffers: e.target.checked })}
                        className="rounded text-luxury-dark focus:ring-luxury-accent w-4 h-4"
                      />
                      <span>Promotional discounts & seasonal slipper sales</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 11. HELP & SUPPORT TAB */}
            {currentTab === 'help' && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100/90 shadow-sm space-y-8">
                <div>
                  <h2 className="font-display font-black text-xl text-luxury-dark">Help & Support</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Frequently asked questions and direct assistance for your slipper orders.
                  </p>
                </div>

                {/* Contact Options Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-stone-50 border border-gray-100 space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-xs text-gray-900">WhatsApp Stylist</p>
                    <p className="text-[11px] text-gray-500">
                      Instant size advice & order status assistance.
                    </p>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:underline inline-block pt-1"
                    >
                      Chat on WhatsApp →
                    </a>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-50 border border-gray-100 space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-xs text-gray-900">Phone Support</p>
                    <p className="text-[11px] text-gray-500">Mon–Sat, 9:00 AM – 8:00 PM IST</p>
                    <a
                      href="tel:+919876543210"
                      className="text-xs font-bold text-blue-700 hover:underline inline-block pt-1"
                    >
                      +91 98765 43210
                    </a>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-50 border border-gray-100 space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-xs text-gray-900">Email Support</p>
                    <p className="text-[11px] text-gray-500">support@aurasolefootwear.com</p>
                    <a
                      href="mailto:support@aurasolefootwear.com"
                      className="text-xs font-bold text-purple-700 hover:underline inline-block pt-1"
                    >
                      Send an Email →
                    </a>
                  </div>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="font-display font-bold text-sm text-luxury-dark uppercase tracking-wider">
                    Slipper Care & Order FAQs
                  </h3>

                  {[
                    {
                      q: 'How do I choose the correct slipper size?',
                      a: 'Our slippers follow standard Indian/UK footwear sizing. You can refer to our interactive Size Guide on any product page for exact foot measurements in centimeters.',
                    },
                    {
                      q: 'How do 7-Day Doorstep Returns & Exchanges work?',
                      a: 'You can request a size exchange or return directly from the "Orders" tab within 7 days of delivery. Our courier partner will pick up the package from your doorstep.',
                    },
                    {
                      q: 'What is the best way to clean my EVA/memory foam slippers?',
                      a: 'Simply wipe them with a mild damp cloth and gentle soap. Avoid direct harsh sunlight drying to maintain cloud-soft cushioning integrity.',
                    },
                    {
                      q: 'Is Cash on Delivery (COD) available across India?',
                      a: 'Yes, Cash on Delivery is supported across 19,000+ Indian PIN codes at no extra surcharge.',
                    },
                  ].map((faq, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full p-4 text-left font-bold text-xs text-gray-800 hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <span>{faq.q}</span>
                        {openFaq === idx ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      {openFaq === idx && (
                        <div className="p-4 pt-0 text-xs text-gray-600 bg-gray-50/50 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Write Product Review Modal */}
      {isWriteReviewOpen && reviewProduct && (
        <WriteReviewModal
          isOpen={isWriteReviewOpen}
          onClose={() => {
            setIsWriteReviewOpen(false);
            setReviewProduct(null);
            setSelectedOrderForReview(null);
          }}
          product={reviewProduct}
          orderId={selectedOrderForReview}
          onReviewSubmitted={() => {
            loadUserReviews();
            loadOrders(orderPagination.page);
            loadDashboard();
          }}
        />
      )}

      {/* Order Details & Tracking Lightbox Modal */}
      <OrderDetailsModal
        order={selectedOrderForModal}
        isOpen={!!selectedOrderForModal}
        onClose={() => setSelectedOrderForModal(null)}
        onOrderUpdated={() => {
          loadOrders(orderPagination.page);
          loadDashboard();
        }}
      />

      {/* Address Form Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setAddressToEdit(null);
        }}
        addressToEdit={addressToEdit}
        onAddressSaved={loadAddresses}
      />

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Account;
