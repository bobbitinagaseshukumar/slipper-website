import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Archive,
  Users,
  Star,
  Tag,
  Image,
  Activity,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Truck,
  RotateCcw,
  Loader2,
  Eye,
  Check,
  X,
  Sparkles,
  Lock,
  Unlock,
  MessageSquare,
  Gift,
  Zap,
  FolderTree,
  Folder,
  CreditCard,
  FileText,
  Settings,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react';

import adminService from '../../services/adminService';
import categoryService from '../../services/categoryService';
import { useStoreSettings } from '../../context/StoreSettingsContext';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmailCenter from '../../components/admin/AdminEmailCenter';
import AdminCategoryManager from '../../components/admin/AdminCategoryManager';
import AdminBrandManager from '../../components/admin/AdminBrandManager';
import AdminProductModal from '../../components/admin/AdminProductModal';
import AdminSectionManager from '../../components/admin/AdminSectionManager';

const AdminPortal = () => {
  const { settings: globalSettings, updateSettings: updateGlobalSettings } = useStoreSettings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dashboard Stats State
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsRange, setStatsRange] = useState('30d');

  // Products State
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [categories, setCategories] = useState([]);

  // Subcategories State
  const [subcategories, setSubcategories] = useState([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false);
  const [subCategoryForm, setSubCategoryForm] = useState({ categoryId: '', name: '', slug: '', description: '' });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [selectedOrderForView, setSelectedOrderForView] = useState(null);

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomerForView, setSelectedCustomerForView] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Offers & Deals State
  const [offers, setOffers] = useState([]);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({ title: '', code: '', discountType: 'PERCENTAGE', discountValue: '10', description: '', badgeText: 'Limited Deal' });

  // Festival Deals State
  const [festivalDeals, setFestivalDeals] = useState([]);
  const [isAddFestivalDealOpen, setIsAddFestivalDealOpen] = useState(false);
  const [festivalDealForm, setFestivalDealForm] = useState({ festivalName: 'Diwali Slipper Fest', title: 'Grand Festival Collection 50% OFF', discountPercentage: '50', couponCode: 'FESTIVAL50' });

  // Flash Sales State
  const [flashSales, setFlashSales] = useState([]);
  const [isAddFlashSaleOpen, setIsAddFlashSaleOpen] = useState(false);
  const [flashSaleForm, setFlashSaleForm] = useState({ title: 'Midnight Flash Comfort Drop', discountPercentage: '30', stockLimit: '50' });

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '15', minOrderAmount: '999', description: '' });

  // Banners State
  const [banners, setBanners] = useState([]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'AuraSole',
    tagline: 'Walk With Pure Luxury',
    description: 'Handcrafted orthotic and luxury comfort slippers engineered for effortless daily elegance.',
    logo: '',
    whatsappNumber: '+91 98765 43210',
    phone: '+91 98765 43210',
    contactEmail: 'support@aurasole.com',
    address: 'Showroom 42, Slipper Heritage Lane, Luxury Avenue, Mumbai - 400001',
    businessHours: 'Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 7:00 PM',
    currency: 'INR',
    currencySymbol: '₹',
    announcementActive: true,
    announcementMessage: '🔥 Festival Sale Live — Up to 50% OFF Signature Slippers | Express Free Shipping Across India',
    announcementLink: '/shop',
    estimatedDeliveryDays: '3-5 Business Days',
    cancellationDeadlineHours: 24,
    freeShippingThreshold: 999,
  });

  useEffect(() => {
    if (globalSettings) {
      setStoreSettings((prev) => ({
        ...prev,
        ...globalSettings,
      }));
    }
  }, [globalSettings]);

  const handleSaveStoreSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await updateGlobalSettings(storeSettings);
      showToast('success', `Settings saved! Store name updated to "${storeSettings.storeName}" everywhere.`);
    } catch (err) {
      showToast('error', err.message || 'Failed to update store settings.');
    }
  };

  // Feedback Toast
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (type, text) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Loaders
  const loadDashboard = async (range = statsRange) => {
    try {
      setIsLoadingStats(true);
      const res = await adminService.getDashboardStats(range);
      if (res?.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const res = await adminService.getProducts({ search: productSearch, category: productCategoryFilter });
      if (res?.data?.products) setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res?.data) {
        setCategories(res.data);
        if (res.data[0] && !productFormData.categoryId) {
          setProductFormData((prev) => ({ ...prev, categoryId: res.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadSubcategories = async () => {
    try {
      setIsLoadingSubcategories(true);
      const res = await adminService.getSubCategories();
      if (res?.data) setSubcategories(res.data);
    } catch (err) {
      console.error('Failed to load subcategories:', err);
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await adminService.getOrders({ status: orderStatusFilter, search: orderSearch });
      if (res?.data?.orders) setOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const res = await adminService.getCustomers();
      if (res?.data?.customers) setCustomers(res.data.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const loadOffers = async () => {
    try {
      const res = await adminService.getOffers();
      if (res?.data) setOffers(res.data);
    } catch (err) {
      console.error('Failed to load offers:', err);
    }
  };

  const loadFestivalDeals = async () => {
    try {
      const res = await adminService.getFestivalDeals();
      if (res?.data) setFestivalDeals(res.data);
    } catch (err) {
      console.error('Failed to load festival deals:', err);
    }
  };

  const loadFlashSales = async () => {
    try {
      const res = await adminService.getFlashSales();
      if (res?.data) setFlashSales(res.data);
    } catch (err) {
      console.error('Failed to load flash sales:', err);
    }
  };

  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const res = await adminService.getReviews();
      if (res?.data) setReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const loadCoupons = async () => {
    try {
      const res = await adminService.getCoupons();
      if (res?.data) setCoupons(res.data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  const loadBanners = async () => {
    try {
      const res = await adminService.getBanners();
      if (res?.data) setBanners(res.data);
    } catch (err) {
      console.error('Failed to load banners:', err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await adminService.getAuditLogs();
      if (res?.data) setAuditLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'inventory') loadProducts();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'subcategories') loadSubcategories();
    if (activeTab === 'orders' || activeTab === 'whatsapp_orders' || activeTab === 'payments') loadOrders();
    if (activeTab === 'customers') loadCustomers();
    if (activeTab === 'offers') loadOffers();
    if (activeTab === 'festival_deals') loadFestivalDeals();
    if (activeTab === 'flash_sales') loadFlashSales();
    if (activeTab === 'reviews') loadReviews();
    if (activeTab === 'coupons') loadCoupons();
    if (activeTab === 'banners') loadBanners();
    if (activeTab === 'audit-logs') loadAuditLogs();
  }, [activeTab, productSearch, productCategoryFilter, orderStatusFilter, orderSearch]);

  // Product Creation State & Handler
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    gender: 'UNISEX',
    productType: 'Slides',
    description: '',
    imageUrl1: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800',
    stock6: '10',
    stock7: '15',
    stock8: '20',
    stock9: '20',
    stock10: '15',
    stock11: '10',
  });

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const variants = [
        { size: '6', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: parseInt(productFormData.stock6, 10) || 0 },
        { size: '7', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: parseInt(productFormData.stock7, 10) || 0 },
        { size: '8', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: parseInt(productFormData.stock8, 10) || 0 },
        { size: '9', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: parseInt(productFormData.stock9, 10) || 0 },
        { size: '10', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: parseInt(productFormData.stock10, 10) || 0 },
        { size: '11', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: parseInt(productFormData.stock11, 10) || 0 },
      ];

      await adminService.createProduct({
        name: productFormData.name,
        price: parseFloat(productFormData.price),
        originalPrice: productFormData.originalPrice ? parseFloat(productFormData.originalPrice) : null,
        categoryId: productFormData.categoryId || (categories[0] ? categories[0].id : ''),
        gender: productFormData.gender,
        productType: productFormData.productType,
        description: productFormData.description,
        images: [productFormData.imageUrl1],
        variants,
      });

      showToast('success', `Product "${productFormData.name}" added successfully.`);
      setIsAddProductOpen(false);
      loadProducts();
    } catch (err) {
      showToast('error', err.message || 'Failed to create product.');
    }
  };

  const handleDeleteProductConfirm = async () => {
    if (!productToDelete) return;
    try {
      await adminService.deleteProduct(productToDelete.id);
      showToast('success', `Product "${productToDelete.name}" deleted successfully.`);
      setProductToDelete(null);
      loadProducts();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete product.');
    }
  };

  // Order Status Update Handler
  const handleUpdateOrderStatusSubmit = async () => {
    if (!selectedOrderForStatus) return;
    try {
      await adminService.updateOrderStatus(selectedOrderForStatus.id, {
        status: newOrderStatus,
        trackingNumber: trackingNumberInput,
      });
      showToast('success', `Order #${selectedOrderForStatus.orderNumber} updated to ${newOrderStatus}`);
      setSelectedOrderForStatus(null);
      loadOrders();
    } catch (err) {
      showToast('error', err.message || 'Failed to update order status.');
    }
  };

  // Customer Status Toggle & Delete
  const handleToggleCustomerBlock = async (c) => {
    try {
      const nextStatus = c.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
      await adminService.updateCustomerStatus(c.id, nextStatus);
      showToast('success', `Customer ${c.name} is now ${nextStatus}`);
      loadCustomers();
    } catch (err) {
      showToast('error', err.message || 'Failed to update customer status.');
    }
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      await adminService.deleteCustomer(customerToDelete.id);
      showToast('success', `Customer ${customerToDelete.name} deleted.`);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete customer.');
    }
  };

  // Reviews Moderation Handler
  const handleModerateReview = async (id, isApproved) => {
    try {
      await adminService.moderateReview(id, isApproved);
      showToast('success', `Review ${isApproved ? 'Approved & Published' : 'Hidden'}`);
      loadReviews();
    } catch (err) {
      showToast('error', 'Failed to update review moderation.');
    }
  };

  // Create Subcategory Handler
  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    try {
      await adminService.createSubCategory({
        categoryId: subCategoryForm.categoryId || (categories[0]?.id || ''),
        name: subCategoryForm.name,
        slug: subCategoryForm.slug,
        description: subCategoryForm.description,
      });
      showToast('success', `Subcategory "${subCategoryForm.name}" created.`);
      setIsAddSubCategoryOpen(false);
      loadSubcategories();
    } catch (err) {
      showToast('error', err.message || 'Failed to create subcategory.');
    }
  };

  // Create Offer Handler
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      await adminService.createOffer({
        title: offerForm.title,
        code: offerForm.code,
        discountType: offerForm.discountType,
        discountValue: parseFloat(offerForm.discountValue),
        description: offerForm.description,
        badgeText: offerForm.badgeText,
      });
      showToast('success', `Offer "${offerForm.title}" published.`);
      setIsAddOfferOpen(false);
      loadOffers();
    } catch (err) {
      showToast('error', err.message || 'Failed to create offer.');
    }
  };

  // Create Festival Deal Handler
  const handleCreateFestivalDeal = async (e) => {
    e.preventDefault();
    try {
      await adminService.createFestivalDeal({
        festivalName: festivalDealForm.festivalName,
        title: festivalDealForm.title,
        discountPercentage: parseFloat(festivalDealForm.discountPercentage),
        couponCode: festivalDealForm.couponCode,
      });
      showToast('success', `Festival Deal "${festivalDealForm.festivalName}" launched.`);
      setIsAddFestivalDealOpen(false);
      loadFestivalDeals();
    } catch (err) {
      showToast('error', err.message || 'Failed to create festival deal.');
    }
  };

  // Create Flash Sale Handler
  const handleCreateFlashSale = async (e) => {
    e.preventDefault();
    try {
      await adminService.createFlashSale({
        title: flashSaleForm.title,
        discountPercentage: parseFloat(flashSaleForm.discountPercentage),
        stockLimit: parseInt(flashSaleForm.stockLimit, 10),
      });
      showToast('success', `Flash Sale "${flashSaleForm.title}" activated with countdown.`);
      setIsAddFlashSaleOpen(false);
      loadFlashSales();
    } catch (err) {
      showToast('error', err.message || 'Failed to create flash sale.');
    }
  };

  // Create Coupon Handler
  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createCoupon({
        code: couponForm.code.toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue),
        minOrderAmount: parseFloat(couponForm.minOrderAmount || 0),
        description: couponForm.description,
      });
      showToast('success', `Coupon ${couponForm.code} created.`);
      setIsAddCouponOpen(false);
      loadCoupons();
    } catch (err) {
      showToast('error', err.message || 'Failed to create coupon.');
    }
  };

  // Force Logout Customer from all devices (Strict Rule)
  const handleForceLogoutCustomer = async (customer) => {
    if (!window.confirm(`Force logout customer "${customer.name || customer.email}" from ALL devices? All their active sessions will be terminated immediately.`)) {
      return;
    }
    try {
      await adminService.forceLogoutCustomer(customer.id);
      showToast('success', `All active sessions revoked for ${customer.name || customer.email}.`);
    } catch (err) {
      showToast('error', err.message || 'Failed to force logout customer.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-950 overflow-x-hidden">
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSearchQuery={(q) => {
            if (activeTab === 'products') setProductSearch(q);
            if (activeTab === 'orders') setOrderSearch(q);
          }}
          onSelectTab={setActiveTab}
        />

        {/* Global Toast */}
        {toastMsg && (
          <div
            className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-3 ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{toastMsg.text}</span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ======================================================== */}
          {/* 1. DASHBOARD TAB */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-black text-2xl text-white">Showroom Command Center</h1>
                  <p className="text-xs text-stone-400 mt-1">
                    Live revenue intelligence, inventory alerts, and omnichannel slipper operations.
                  </p>
                </div>

                {/* Range Selector */}
                <div className="flex gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-2xl">
                  {['today', '7d', '30d', '3m', '1y'].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setStatsRange(r);
                        loadDashboard(r);
                      }}
                      className={`px-3 py-1 text-[11px] font-bold rounded-xl uppercase transition-all ${
                        statsRange === r ? 'bg-luxury-accent text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI Matrix Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('orders')}
                  className="p-5 rounded-3xl bg-stone-900 border border-stone-800/80 hover:border-luxury-accent/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-luxury-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-display font-black text-2xl text-white">
                    {stats?.totalOrders ?? (isLoadingStats ? '...' : 0)}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">+12% from last cycle</span>
                </div>

                <div
                  onClick={() => setActiveTab('customers')}
                  className="p-5 rounded-3xl bg-stone-900 border border-stone-800/80 hover:border-luxury-accent/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Total Customers</span>
                    <Users className="w-4 h-4 text-luxury-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-display font-black text-2xl text-white">
                    {stats?.totalCustomers ?? (isLoadingStats ? '...' : 0)}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">VIP Slipper Members</span>
                </div>

                <div
                  onClick={() => setActiveTab('products')}
                  className="p-5 rounded-3xl bg-stone-900 border border-stone-800/80 hover:border-luxury-accent/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Active Products</span>
                    <Package className="w-4 h-4 text-luxury-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-display font-black text-2xl text-white">
                    {stats?.totalProducts ?? (isLoadingStats ? '...' : 0)}
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold">{categories.length} Categories Live</span>
                </div>

                <div
                  onClick={() => setActiveTab('inventory')}
                  className="p-5 rounded-3xl bg-stone-900 border border-stone-800/80 hover:border-luxury-accent/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Low Stock Alert</span>
                    <Archive className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-display font-black text-2xl text-rose-400">
                    {stats?.lowStockCount ?? (isLoadingStats ? '...' : 0)}
                  </div>
                  <span className="text-[10px] text-rose-400 font-bold">Needs restock</span>
                </div>

                <div
                  onClick={() => setActiveTab('whatsapp_orders')}
                  className="p-5 rounded-3xl bg-stone-900 border border-stone-800/80 hover:border-emerald-500/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>WhatsApp Orders</span>
                    <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-display font-black text-2xl text-emerald-400">
                    {orders.filter((o) => o.paymentMethod === 'WHATSAPP').length}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">Direct Showroom Chat</span>
                </div>

                <div
                  onClick={() => setActiveTab('payments')}
                  className="p-5 rounded-3xl bg-stone-900 border border-stone-800/80 hover:border-blue-500/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Razorpay Paid</span>
                    <CreditCard className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-display font-black text-2xl text-blue-400">
                    {orders.filter((o) => o.paymentMethod === 'RAZORPAY').length}
                  </div>
                  <span className="text-[10px] text-blue-400 font-bold">Instant Online Settlement</span>
                </div>

                <div
                  onClick={() => setActiveTab('coupons')}
                  className="p-5 rounded-3xl bg-stone-900 border border-stone-800/80 hover:border-luxury-accent/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Active Coupons</span>
                    <Tag className="w-4 h-4 text-luxury-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-display font-black text-2xl text-white">{coupons.length}</div>
                  <span className="text-[10px] text-luxury-accent font-bold">Promotional codes</span>
                </div>

                <div
                  onClick={() => setActiveTab('reviews')}
                  className="p-5 rounded-3xl bg-stone-900 border border-stone-800/80 hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Customer Reviews</span>
                    <Star className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-display font-black text-2xl text-amber-400">{reviews.length}</div>
                  <span className="text-[10px] text-amber-400 font-bold">4.9/5.0 Store Average</span>
                </div>
              </div>

              {/* Charts & Quick Ledger */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div>
                      <h3 className="font-display font-bold text-sm text-white">Sales & Dispatch Velocity</h3>
                      <p className="text-xs text-stone-400">Daily footwear revenue trends ({statsRange.toUpperCase()})</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-luxury-accent">
                      Total: ₹{stats?.totalRevenue ?? 0}
                    </span>
                  </div>

                  {/* Visual Chart Bar Mockup */}
                  <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-stone-800">
                    {[45, 60, 75, 50, 90, 85, 100, 70, 80, 95, 65, 88].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <div
                          style={{ height: `${val}%` }}
                          className="w-full bg-stone-800 group-hover:bg-luxury-accent rounded-t-lg transition-all"
                        />
                        <span className="text-[9px] text-stone-500 font-mono">D{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stock Alerts */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <h3 className="font-display font-bold text-sm text-white">Stock Warnings</h3>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full">
                      Critical
                    </span>
                  </div>

                  {stats?.lowStockVariants?.length > 0 ? (
                    <div className="space-y-3">
                      {stats.lowStockVariants.slice(0, 4).map((v) => (
                        <div key={v.id} className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-stone-200 truncate max-w-[140px]">{v.product?.name}</p>
                            <p className="text-[10px] text-stone-500">Size UK {v.size} • {v.colorName}</p>
                          </div>
                          <span className="px-2 py-1 bg-rose-950 text-rose-400 font-bold rounded-lg text-[10px]">
                            {v.stock} left
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 text-center py-6">All footwear inventory healthy.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. CUSTOMERS TAB */}
          {/* ======================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-xl text-white">Customer Directory</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Manage customer access, view purchase records & security.</p>
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Phone / WhatsApp</th>
                      <th className="py-3.5 px-4">Orders</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-800/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-luxury-dark border border-luxury-accent/40 text-luxury-accent flex items-center justify-center font-bold text-xs">
                            {c.name?.[0]?.toUpperCase() || 'C'}
                          </div>
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3 px-4 text-stone-400">{c.email}</td>
                        <td className="py-3 px-4">{c.phone || c.whatsappNumber || '—'}</td>
                        <td className="py-3 px-4 font-bold text-luxury-accent">{c._count?.orders || 0}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'ACTIVE'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCustomerForView(c)}
                              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold text-[11px]"
                            >
                              Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleCustomerBlock(c)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                                c.status === 'BLOCKED'
                                  ? 'bg-emerald-900 text-emerald-200 hover:bg-emerald-800'
                                  : 'bg-amber-950 text-amber-300 hover:bg-amber-900'
                              }`}
                            >
                              {c.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleForceLogoutCustomer(c)}
                              className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl font-bold text-[10px] border border-rose-800 flex items-center gap-1 transition-colors"
                              title="Force Logout from all devices"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-400" />
                              <span>Force Logout</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomerToDelete(c)}
                              className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-xl"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. ORDERS TAB */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-black text-xl text-white">Order Operations</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Review orders, update dispatch status, assign courier tracking numbers.
                  </p>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {['ALL', 'WHATSAPP_PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                        orderStatusFilter === st
                          ? 'bg-luxury-accent text-stone-950 font-black'
                          : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-black text-white">#{ord.orderNumber}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-stone-200">{ord.user?.name || 'Customer'}</p>
                          <p className="text-[10px] text-stone-500">{ord.user?.phone || ord.user?.email}</p>
                        </td>
                        <td className="py-3 px-4 font-black text-luxury-accent">₹{ord.finalAmount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              ord.paymentMethod === 'RAZORPAY'
                                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                : ord.paymentMethod === 'WHATSAPP'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-stone-800 text-stone-300'
                            }`}
                          >
                            {ord.paymentMethod === 'WHATSAPP' && <MessageSquare className="w-3 h-3" />}
                            {ord.paymentMethod} • {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : ord.status === 'CANCELLED'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : ord.status === 'WHATSAPP_PENDING'
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700 animate-pulse'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.user?.phone && (
                              <a
                                href={`https://wa.me/${ord.user.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded-xl transition-colors"
                                title="Chat with Customer on WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForStatus(ord);
                                setNewOrderStatus(ord.status === 'WHATSAPP_PENDING' ? 'CONFIRMED' : ord.status);
                                setTrackingNumberInput(ord.trackingNumber || '');
                              }}
                              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold text-[11px] transition-colors"
                            >
                              Update Status
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3.5 CATEGORIES & SUBCATEGORIES TAB */}
          {/* ======================================================== */}
          {activeTab === 'categories' && (
            <AdminCategoryManager
              categories={categories}
              onRefresh={loadCategories}
              showToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* 3.6 BRANDS TAB (NORMAL & COMPANY BRANDING) */}
          {/* ======================================================== */}
          {activeTab === 'brands' && (
            <AdminBrandManager showToast={showToast} />
          )}

          {/* ======================================================== */}
          {/* 4. PRODUCTS TAB */}
          {/* ======================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/80 border border-stone-800 p-6 rounded-3xl backdrop-blur-xl">
                <div>
                  <h2 className="font-display font-black text-xl text-white">Slipper Product Catalog</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Manage slipper models, pricing, size matrix, footbed materials, and high-res image galleries.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-stone-950 border border-stone-800 rounded-2xl px-3.5 py-2.5 text-white text-xs font-bold focus:border-luxury-accent outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsAddProductOpen(true);
                    }}
                    className="px-5 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-2xl shadow-glow transition-all flex items-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Upload Slipper Model
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              {isLoadingProducts ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-luxury-accent mx-auto" />
                  <p className="text-xs text-stone-400 font-bold">Loading Slipper Catalog...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => {
                    const primaryImg = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f';
                    const hasDiscount = p.originalPrice && p.originalPrice > p.price;
                    const discountPct = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                    return (
                      <div
                        key={p.id}
                        className="group relative bg-stone-900 border border-stone-800 hover:border-luxury-accent/50 rounded-3xl overflow-hidden transition-all flex flex-col justify-between"
                      >
                        {/* Image Banner */}
                        <div className="aspect-[4/3] rounded-t-3xl overflow-hidden bg-stone-950 relative">
                          <img
                            src={primaryImg}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent opacity-60" />

                          {/* Category Badge */}
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-[10px] font-bold text-luxury-accent border border-stone-800">
                            {p.category?.name || 'Slides'}
                          </span>

                          {/* Discount Tag */}
                          {hasDiscount && (
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800 text-[10px] font-black">
                              {discountPct}% OFF
                            </span>
                          )}

                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                            <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                              {p.gender || 'UNISEX'} • {p.productType || 'Footwear'}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-display font-bold text-base text-white group-hover:text-luxury-accent transition-colors">
                              {p.name}
                            </h4>
                            <p className="text-xs text-stone-400 line-clamp-2 mt-1">
                              {p.description || 'Handcrafted luxury comfort slipper engineered for daily elegance.'}
                            </p>
                          </div>

                          {/* Price & Variants */}
                          <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-black text-lg text-white">₹{p.price}</span>
                                {p.originalPrice && (
                                  <span className="text-xs text-stone-500 line-through font-bold">₹{p.originalPrice}</span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-500 font-mono">
                                {p.variants?.length || 6} Size Variants
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <a
                                href={`/product/${p.slug || p.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                                title="View Storefront"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsAddProductOpen(true);
                                }}
                                className="p-2 rounded-xl bg-luxury-accent/20 hover:bg-luxury-accent hover:text-stone-950 text-luxury-accent transition-all font-bold"
                                title="Edit Slipper"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductToDelete(p)}
                                className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 text-rose-400 hover:text-rose-200 transition-colors"
                                title="Delete Slipper"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-3xl space-y-3">
                  <Package className="w-10 h-10 text-stone-600 mx-auto" />
                  <h3 className="font-bold text-white text-base">No Slippers Found</h3>
                  <p className="text-xs text-stone-400">Add your first slipper model or clear your search filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsAddProductOpen(true);
                    }}
                    className="px-4 py-2 bg-luxury-accent text-stone-950 font-bold text-xs rounded-xl shadow-glow"
                  >
                    Upload Slipper Model
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. SUBCATEGORIES TAB */}
          {/* ======================================================== */}
          {activeTab === 'subcategories' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-xl text-white">Subcategory Architecture</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Nested taxonomy (Category → Subcategory → Slippers).</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddSubCategoryOpen(true)}
                  className="px-4 py-2.5 bg-luxury-accent text-stone-950 font-bold text-xs rounded-2xl shadow-glow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Subcategory
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {subcategories.map((sub) => (
                  <div key={sub.id} className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-luxury-accent text-[10px] font-bold">
                      {sub.category?.name || 'Category'}
                    </span>
                    <h4 className="font-display font-bold text-base text-white">{sub.name}</h4>
                    <p className="text-xs text-stone-400">{sub.description || 'Specialized slipper range'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. OFFERS & DEALS TAB */}
          {/* ======================================================== */}
          {activeTab === 'offers' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-xl text-white">General Offers & Deals</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Configure 10% OFF, Buy More Save More, Weekend Sales.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOfferOpen(true)}
                  className="px-4 py-2.5 bg-luxury-accent text-stone-950 font-bold text-xs rounded-2xl shadow-glow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create Offer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {offers.map((off) => (
                  <div key={off.id} className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-luxury-accent text-[10px] font-bold">
                      {off.badgeText || 'Special Offer'}
                    </span>
                    <h4 className="font-display font-bold text-base text-white">{off.title}</h4>
                    <p className="text-xs font-black text-luxury-accent">{off.discountValue}% OFF Storewide</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. HOMEPAGE SECTIONS & FESTIVAL CAMPAIGNS TAB */}
          {/* ======================================================== */}
          {(activeTab === 'homepage' || activeTab === 'festival_deals') && (
            <div className="animate-in fade-in">
              <AdminSectionManager showToast={showToast} />
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. FLASH SALES TAB */}
          {/* ======================================================== */}
          {activeTab === 'flash_sales' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-xl text-white">Flash Sales & Countdown Drops</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Time-limited slipper drops with live ticking timers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddFlashSaleOpen(true)}
                  className="px-4 py-2.5 bg-luxury-accent text-stone-950 font-bold text-xs rounded-2xl shadow-glow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Activate Flash Sale
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {flashSales.map((fs) => (
                  <div key={fs.id} className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full">
                        LIVE FLASH
                      </span>
                      <span className="text-xs font-mono text-stone-400">Stock Limit: {fs.stockLimit}</span>
                    </div>
                    <h4 className="font-display font-bold text-base text-white">{fs.title}</h4>
                    <p className="text-xs font-black text-luxury-accent">{fs.discountPercentage}% Instant Discount</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. INVENTORY TAB */}
          {/* ======================================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-display font-black text-xl text-white">Footwear Stock Ledger</h2>
                <p className="text-xs text-stone-400 mt-0.5">Real-time inventory levels across all UK sizes and colorways.</p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Slipper Model</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Total Stock</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {products.map((p) => {
                      const totalStock = p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                      return (
                        <tr key={p.id} className="hover:bg-stone-800/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                          <td className="py-3 px-4 text-stone-400">{p.category?.name}</td>
                          <td className="py-3 px-4 font-mono font-black text-luxury-accent">{totalStock} pairs</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                totalStock > 15
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : totalStock > 0
                                  ? 'bg-amber-950 text-amber-400'
                                  : 'bg-rose-950 text-rose-400'
                              }`}
                            >
                              {totalStock > 15 ? 'IN STOCK' : totalStock > 0 ? 'LOW STOCK' : 'OUT OF STOCK'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 10. WHATSAPP ORDERS TAB */}
          {/* ======================================================== */}
          {activeTab === 'whatsapp_orders' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-display font-black text-xl text-white">WhatsApp Direct Orders</h2>
                <p className="text-xs text-stone-400 mt-0.5">Orders initiated directly from WhatsApp click-to-chat showroom buttons.</p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {orders
                      .filter((o) => o.paymentMethod === 'WHATSAPP' || o.isWhatsAppOrder)
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-800/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-black text-white">#{ord.orderNumber}</td>
                          <td className="py-3 px-4 font-bold">{ord.user?.name || 'Customer'}</td>
                          <td className="py-3 px-4 font-black text-luxury-accent">₹{ord.finalAmount}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {ord.user?.phone && (
                                <a
                                  href={`https://wa.me/${ord.user.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Chat on WhatsApp</span>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 11. PAYMENTS TAB */}
          {/* ======================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-display font-black text-xl text-white">Razorpay Online Payment Ledger</h2>
                <p className="text-xs text-stone-400 mt-0.5">Authoritative cryptographically verified transaction IDs.</p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Method</th>
                      <th className="py-3.5 px-4">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {orders
                      .filter((o) => o.paymentMethod === 'RAZORPAY' || o.paymentStatus === 'PAID')
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-800/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-black text-white">#{ord.orderNumber}</td>
                          <td className="py-3 px-4">{ord.user?.name || 'Customer'}</td>
                          <td className="py-3 px-4 font-black text-luxury-accent">₹{ord.finalAmount}</td>
                          <td className="py-3 px-4 font-mono text-blue-400 font-bold">RAZORPAY 256-BIT SSL</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              PAID (VERIFIED)
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 12. DELIVERY MANAGEMENT TAB */}
          {/* ======================================================== */}
          {activeTab === 'delivery' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-display font-black text-xl text-white">Delivery & Logistics Control</h2>
                <p className="text-xs text-stone-400 mt-0.5">Manage express shipping partners, estimated delivery timelines, cancellation deadlines.</p>
              </div>

              <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 max-w-xl space-y-4 text-xs">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Standard Delivery Timeline</label>
                  <input
                    type="text"
                    value={storeSettings.estimatedDeliveryDays}
                    onChange={(e) => setStoreSettings({ ...storeSettings, estimatedDeliveryDays: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Cancellation Window</label>
                  <input
                    type="text"
                    value={storeSettings.cancellationDeadlineHours}
                    onChange={(e) => setStoreSettings({ ...storeSettings, cancellationDeadlineHours: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => showToast('success', 'Delivery policies updated.')}
                  className="px-6 py-2.5 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow"
                >
                  Save Delivery Settings
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 13. REVIEWS TAB */}
          {/* ======================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-xl text-white">Review Moderation Center</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Strict Delivered-Only Feedback: Review customer ratings and moderate verified purchase feedback.
                  </p>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold">
                  {reviews.length} Verified Reviews
                </span>
              </div>

              {isLoadingReviews ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-luxury-accent" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs text-white">{rev.product?.name || 'Slipper'}</p>
                            {rev.isVerifiedPurchase && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[9px] font-bold border border-emerald-800">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            By <span className="text-stone-300 font-semibold">{rev.user?.name}</span> ({rev.user?.email})
                          </p>
                          {rev.orderId && (
                            <p className="text-[10px] text-stone-500 font-mono">
                              Order Reference: {rev.orderId.slice(0, 12)}...
                            </p>
                          )}
                        </div>

                        <div className="flex text-amber-400 text-xs shrink-0">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>

                      {rev.title && (
                        <p className="font-bold text-xs text-stone-200">"{rev.title}"</p>
                      )}

                      <p className="text-xs text-stone-300 italic leading-relaxed">
                        {rev.comment}
                      </p>

                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.images.map((img, i) => (
                            <img key={i} src={img} alt="review" className="w-12 h-12 rounded-xl object-cover border border-stone-800" />
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-stone-500">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleModerateReview(rev.id, !rev.isApproved)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                              rev.isApproved
                                ? 'bg-rose-950 text-rose-400 hover:bg-rose-900'
                                : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                            }`}
                          >
                            {rev.isApproved ? 'Hide Review' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-stone-900/50 rounded-3xl p-6 border border-stone-800">
                  <Star className="w-10 h-10 text-stone-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-300">No customer reviews yet.</p>
                  <p className="text-xs text-stone-500 mt-0.5">Reviews will appear here once customers receive their delivered orders.</p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 14. COUPONS TAB */}
          {/* ======================================================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-xl text-white">Promo Coupons</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Create discounts and promotional campaign codes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(true)}
                  className="px-4 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-2xl shadow-glow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create Coupon
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-base text-luxury-accent">{c.code}</span>
                      <span className="px-2 py-0.5 bg-stone-800 text-stone-300 text-[10px] font-bold rounded-lg">
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">{c.description}</p>
                    <p className="text-[10px] text-stone-500 pt-1">Min Order: ₹{c.minOrderAmount} • Used: {c.usageCount} times</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 15. EMAIL CAMPAIGNS TAB */}
          {/* ======================================================== */}
          {activeTab === 'emails' && <AdminEmailCenter />}

          {/* ======================================================== */}
          {/* 16. BANNERS TAB */}
          {/* ======================================================== */}
          {activeTab === 'banners' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-display font-black text-xl text-white">Storefront Hero Banners</h2>
                <p className="text-xs text-stone-400 mt-0.5">Control promotional graphics on customer homepage.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="p-4 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-stone-800">
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">{b.title}</h4>
                      <p className="text-xs text-stone-400">{b.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 17. SECURITY & 2FA TAB */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-display font-black text-xl text-white">Security & 2-Factor Authentication</h2>
                <p className="text-xs text-stone-400 mt-0.5">Admin 2FA enforcement, failed login attempts, session management.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>2FA Status</span>
                  </div>
                  <h4 className="font-display font-black text-xl text-white">ACTIVE (MANDATORY)</h4>
                  <p className="text-[11px] text-stone-400">Cryptographic 6-digit email verification code required on every admin login.</p>
                </div>

                <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-luxury-accent font-bold text-xs">
                    <Clock className="w-4 h-4" />
                    <span>OTP Expiry</span>
                  </div>
                  <h4 className="font-display font-black text-xl text-white">5 MINUTES</h4>
                  <p className="text-[11px] text-stone-400">Rate-limited to 5 incorrect guesses per verification cycle.</p>
                </div>

                <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <Lock className="w-4 h-4" />
                    <span>Session Security</span>
                  </div>
                  <h4 className="font-display font-black text-xl text-white">24H JWT CLAIMS</h4>
                  <p className="text-[11px] text-stone-400">Strict backend role verification gate on every sensitive API request.</p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 18. SETTINGS TAB */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl">
              <div>
                <h2 className="font-display font-black text-xl text-white">Global Store Settings (Single Source of Truth)</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Any change made here updates the website name, logo, WhatsApp order links, header, footer, and emails immediately.
                </p>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-6 text-xs">
                {/* 1. Identity & Branding */}
                <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
                  <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
                    Store Identity & Branding
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Store Name *</label>
                      <input
                        type="text"
                        required
                        value={storeSettings.storeName || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                        placeholder="AuraSole"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Tagline</label>
                      <input
                        type="text"
                        value={storeSettings.tagline || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                        placeholder="Walk With Pure Luxury"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Store Logo URL</label>
                      <input
                        type="url"
                        value={storeSettings.logo || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, logo: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Store Favicon URL</label>
                      <input
                        type="url"
                        value={storeSettings.favicon || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, favicon: e.target.value })}
                        placeholder="https://example.com/favicon.ico"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">Store Description (Footer / Meta)</label>
                    <textarea
                      rows={2}
                      value={storeSettings.description || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, description: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* 2. Contact & WhatsApp */}
                <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
                  <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
                    Omnichannel Contact & WhatsApp
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Store WhatsApp Number * (Global)</label>
                      <input
                        type="text"
                        required
                        value={storeSettings.whatsappNumber || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                      />
                      <p className="text-[10px] text-stone-500 mt-1">Used in all "Order on WhatsApp", floating buttons, and order alerts.</p>
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Customer Support Phone</label>
                      <input
                        type="text"
                        value={storeSettings.phone || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Public Support Email</label>
                      <input
                        type="email"
                        value={storeSettings.contactEmail || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, contactEmail: e.target.value })}
                        placeholder="support@aurasole.com"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Physical Showroom Address</label>
                      <input
                        type="text"
                        value={storeSettings.address || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                        placeholder="Showroom 42, Slipper Heritage Lane, Mumbai"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">Business Operating Hours</label>
                    <input
                      type="text"
                      value={storeSettings.businessHours || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, businessHours: e.target.value })}
                      placeholder="Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 7:00 PM"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* 3. Top Announcement Bar */}
                <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
                      Storefront Announcement Bar
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={storeSettings.announcementActive !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, announcementActive: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span className="text-white font-bold">Enable Top Bar</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">Announcement Message</label>
                    <input
                      type="text"
                      value={storeSettings.announcementMessage || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, announcementMessage: e.target.value })}
                      placeholder="🔥 Festival Sale Live — Up to 50% OFF Signature Slippers"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* 4. Shipping Policies */}
                <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
                  <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
                    Shipping & Delivery Configuration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Free Delivery Min Order (₹)</label>
                      <input
                        type="number"
                        value={storeSettings.freeShippingThreshold || 999}
                        onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 font-bold uppercase mb-1">Estimated Delivery Window</label>
                      <input
                        type="text"
                        value={storeSettings.estimatedDeliveryDays || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, estimatedDeliveryDays: e.target.value })}
                        placeholder="3-5 Business Days"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow transition-all active:scale-95"
                  >
                    Save & Publish Omnichannel Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* LOGIN PAGE CONTROL TAB */}
          {/* ======================================================== */}
          {activeTab === 'login_page' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <div>
                <h2 className="font-display font-black text-xl text-white">Login Page Management</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Control all customer-facing login headlines, welcome banners, background images, and contact visibility.
                </p>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 text-xs">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Login Page Headline</label>
                  <input
                    type="text"
                    value={storeSettings.loginTitle || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, loginTitle: e.target.value })}
                    placeholder="Welcome Back"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Login Page Subtitle</label>
                  <input
                    type="text"
                    value={storeSettings.loginSubtitle || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, loginSubtitle: e.target.value })}
                    placeholder="Step into your personalized comfort showroom and orders."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">3D Showcase Welcome Message</label>
                  <input
                    type="text"
                    value={storeSettings.loginWelcomeMessage || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, loginWelcomeMessage: e.target.value })}
                    placeholder="Doctor-Engineered Cloud Slippers • Handcrafted Daily Luxury"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Custom Background Image URL</label>
                  <input
                    type="url"
                    value={storeSettings.loginBgImage || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, loginBgImage: e.target.value })}
                    placeholder="https://example.com/login-bg.jpg (Optional)"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">Display Contact Footnotes on Login</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.loginShowAddress !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, loginShowAddress: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Show Showroom Address</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.loginShowPhone !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, loginShowPhone: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Show Helpline Phone</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.loginShowWhatsApp !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, loginShowWhatsApp: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Show WhatsApp Contact</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.loginShowEmail !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, loginShowEmail: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Show Support Email</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">Social Sign-In Providers</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.loginGoogleEnabled !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, loginGoogleEnabled: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Google Sign-In Active</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.loginFacebookEnabled !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, loginFacebookEnabled: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Facebook Sign-In Active</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow"
                  >
                    Save Login Page Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* REGISTER PAGE CONTROL TAB */}
          {/* ======================================================== */}
          {activeTab === 'register_page' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <div>
                <h2 className="font-display font-black text-xl text-white">Register Page Management</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Configure registration page headlines, member perk highlights, and mandatory signup fields.
                </p>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 text-xs">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Registration Headline</label>
                  <input
                    type="text"
                    value={storeSettings.registerTitle || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, registerTitle: e.target.value })}
                    placeholder="Create Your Account"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Registration Subtitle</label>
                  <input
                    type="text"
                    value={storeSettings.registerSubtitle || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, registerSubtitle: e.target.value })}
                    placeholder="Join for exclusive slipper drops & priority shipping."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Member Privilege Banner Text</label>
                  <input
                    type="text"
                    value={storeSettings.registerWelcomeMessage || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, registerWelcomeMessage: e.target.value })}
                    placeholder="Unlock Free Shipping & 15% Welcome Savings"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">Field Requirements</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.registerPhoneRequired !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, registerPhoneRequired: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Require Mobile Phone Number</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.registerWhatsAppRequired === true}
                        onChange={(e) => setStoreSettings({ ...storeSettings, registerWhatsAppRequired: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Require WhatsApp Number</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow"
                  >
                    Save Register Page Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* CHECKOUT CONTROL TAB */}
          {/* ======================================================== */}
          {activeTab === 'checkout_page' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <div>
                <h2 className="font-display font-black text-xl text-white">Checkout Experience & Payment Gateways</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Control the ordering title, trust badges, Razorpay gateway, and WhatsApp ordering flow.
                </p>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 text-xs">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Checkout Page Heading</label>
                  <input
                    type="text"
                    value={storeSettings.checkoutTitle || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, checkoutTitle: e.target.value })}
                    placeholder="Select Your Ordering Method"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Checkout Instructions Subtitle</label>
                  <input
                    type="text"
                    value={storeSettings.checkoutInstructions || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, checkoutInstructions: e.target.value })}
                    placeholder="Choose between instant online payment or ordering directly with our store owner via WhatsApp."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Trust & Security Badge Text</label>
                  <input
                    type="text"
                    value={storeSettings.checkoutTrustBadge || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, checkoutTrustBadge: e.target.value })}
                    placeholder="🔒 256-Bit SSL Encrypted • 100% Genuine Orthopedic Footwear"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">Payment Gateway Switches</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.razorpayEnabled !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, razorpayEnabled: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Enable Online Payment (Razorpay)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.whatsappOrderEnabled !== false}
                        onChange={(e) => setStoreSettings({ ...storeSettings, whatsappOrderEnabled: e.target.checked })}
                        className="rounded accent-luxury-accent"
                      />
                      <span>Enable Order on WhatsApp</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow"
                  >
                    Save Checkout Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* POPUPS & ANNOUNCEMENTS TAB */}
          {/* ======================================================== */}
          {activeTab === 'popups_mgmt' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <div>
                <h2 className="font-display font-black text-xl text-white">Promotional Popups & Announcements</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Launch time-limited discount popups and storefront announcement banners across the site.
                </p>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div>
                    <h4 className="font-bold text-white uppercase text-xs">Global Promotional Modal</h4>
                    <p className="text-[10px] text-stone-500">Appears after 1.5s on customer entry</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storeSettings.popupActive === true}
                      onChange={(e) => setStoreSettings({ ...storeSettings, popupActive: e.target.checked })}
                      className="rounded accent-luxury-accent"
                    />
                    <span className="text-white font-bold">Popup Active</span>
                  </label>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Popup Title</label>
                  <input
                    type="text"
                    value={storeSettings.popupTitle || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, popupTitle: e.target.value })}
                    placeholder="Limited Slipper Drop 🔥"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Popup Message</label>
                  <textarea
                    rows={2}
                    value={storeSettings.popupMessage || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, popupMessage: e.target.value })}
                    placeholder="Use code COMFORT15 on checkout for an exclusive 15% discount."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">Popup Image URL</label>
                    <input
                      type="url"
                      value={storeSettings.popupImage || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, popupImage: e.target.value })}
                      placeholder="https://example.com/popup.jpg"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">CTA Button Text & Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={storeSettings.popupCtaText || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, popupCtaText: e.target.value })}
                        placeholder="Claim Offer"
                        className="w-1/2 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                      />
                      <input
                        type="text"
                        value={storeSettings.popupLink || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, popupLink: e.target.value })}
                        placeholder="/shop"
                        className="w-1/2 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow"
                  >
                    Save Popup & Announcement Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABOUT & POLICY PAGES TAB */}
          {/* ======================================================== */}
          {activeTab === 'pages_mgmt' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <div>
                <h2 className="font-display font-black text-xl text-white">About & Policy Pages Content</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Update brand story, craftsmanship mission, vision, and legal policy pages without modifying code.
                </p>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 text-xs">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Brand Footwear Story (About Page)</label>
                  <textarea
                    rows={3}
                    value={storeSettings.aboutStory || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, aboutStory: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">Brand Mission</label>
                    <textarea
                      rows={2}
                      value={storeSettings.aboutMission || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, aboutMission: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">Brand Vision</label>
                    <textarea
                      rows={2}
                      value={storeSettings.aboutVision || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, aboutVision: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow"
                  >
                    Save Custom Pages Content
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* SEO & METADATA TAB */}
          {/* ======================================================== */}
          {activeTab === 'seo_mgmt' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <div>
                <h2 className="font-display font-black text-xl text-white">Search Engine Optimization (SEO) & Meta</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Manage search engine titles, OpenGraph sharing preview images, and meta descriptions.
                </p>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 text-xs">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Browser / Meta Title</label>
                  <input
                    type="text"
                    value={storeSettings.metaTitle || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, metaTitle: e.target.value })}
                    placeholder="AuraSole — Premium Slipper Showroom & Ergonomic Footwear"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Meta Description</label>
                  <textarea
                    rows={2}
                    value={storeSettings.metaDescription || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, metaDescription: e.target.value })}
                    placeholder="Discover doctor-engineered recovery slides, orthopedic slippers, and daily luxury flip-flops."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Meta Search Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={storeSettings.metaKeywords || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, metaKeywords: e.target.value })}
                    placeholder="slippers, slides, orthopedic slippers, luxury footwear"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Social Sharing (OpenGraph) Image URL</label>
                  <input
                    type="url"
                    value={storeSettings.ogImage || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, ogImage: e.target.value })}
                    placeholder="https://example.com/og-banner.jpg"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow"
                  >
                    Save SEO & Metadata
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* 19. AUDIT LOGS TAB */}
          {/* ======================================================== */}
          {activeTab === 'audit-logs' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-display font-black text-xl text-white">Administrator Audit Trail</h2>
                <p className="text-xs text-stone-400 mt-0.5">Immutable chronological records of product updates, price changes, and order dispatches.</p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Action</th>
                      <th className="py-3.5 px-4">Administrator</th>
                      <th className="py-3.5 px-4">Details</th>
                      <th className="py-3.5 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-luxury-accent">{log.action}</td>
                        <td className="py-3 px-4 font-bold text-white">{log.admin?.name || 'Super Admin'}</td>
                        <td className="py-3 px-4 text-stone-400 max-w-xs truncate">{log.details || '—'}</td>
                        <td className="py-3 px-4 text-stone-500">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* Add / Edit Slipper Product Modal */}
      <AdminProductModal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        categories={categories}
        onSuccess={loadProducts}
        showToast={showToast}
      />

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setProductToDelete(null)} />
          <div className="relative bg-stone-900 border border-rose-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-lg text-white">Delete Slipper Model?</h3>
            <p className="text-xs text-stone-400">
              Are you sure you want to delete <strong className="text-white">{productToDelete.name}</strong>? This will remove all associated size variants and pricing records.
            </p>
            <div className="pt-3 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-5 py-2.5 bg-stone-800 text-stone-300 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProductConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCustomerToDelete(null)} />
          <div className="relative bg-stone-900 border border-rose-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-lg text-white">Permanently Delete Customer?</h3>
            <p className="text-xs text-stone-400">
              Are you sure you want to delete <strong className="text-white">{customerToDelete.name}</strong> ({customerToDelete.email})? This action cannot be undone.
            </p>
            <div className="pt-3 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-5 py-2.5 bg-stone-800 text-stone-300 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCustomer}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Order Status Modal */}
      {selectedOrderForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setSelectedOrderForStatus(null)} />
          <div className="relative bg-stone-900 border border-stone-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              Update Status: #{selectedOrderForStatus.orderNumber}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Order Status</label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="WHATSAPP_PENDING">WHATSAPP PENDING</option>
                  <option value="CONFIRMED">CONFIRMED (Approve Order)</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED (Reject Order)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Courier Tracking ID</label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. BLUEDART-9842104"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForStatus(null)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateOrderStatusSubmit}
                  className="px-6 py-2 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {isAddSubCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsAddSubCategoryOpen(false)} />
          <div className="relative bg-stone-900 border border-stone-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-display font-bold text-base text-white">Create Subcategory</h3>
            <form onSubmit={handleCreateSubcategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Parent Category</label>
                <select
                  value={subCategoryForm.categoryId}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, categoryId: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Subcategory Name</label>
                <input
                  type="text"
                  required
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                  placeholder="e.g. Leather Luxury"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddSubCategoryOpen(false)} className="px-4 py-2 bg-stone-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Offer Modal */}
      {isAddOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsAddOfferOpen(false)} />
          <div className="relative bg-stone-900 border border-stone-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-display font-bold text-base text-white">Create General Offer</h3>
            <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Offer Title</label>
                <input
                  type="text"
                  required
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  placeholder="e.g. Weekend Cloud Comfort Drop 15% OFF"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Discount (%)</label>
                  <input
                    type="number"
                    required
                    value={offerForm.discountValue}
                    onChange={(e) => setOfferForm({ ...offerForm, discountValue: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={offerForm.badgeText}
                    onChange={(e) => setOfferForm({ ...offerForm, badgeText: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOfferOpen(false)} className="px-4 py-2 bg-stone-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow">Publish Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Festival Deal Modal */}
      {isAddFestivalDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsAddFestivalDealOpen(false)} />
          <div className="relative bg-stone-900 border border-stone-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-display font-bold text-base text-white">Create Festive Deal</h3>
            <form onSubmit={handleCreateFestivalDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Festival Name</label>
                <input
                  type="text"
                  required
                  value={festivalDealForm.festivalName}
                  onChange={(e) => setFestivalDealForm({ ...festivalDealForm, festivalName: e.target.value })}
                  placeholder="e.g. Diwali Footwear Dhamaka"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Discount (%)</label>
                <input
                  type="number"
                  required
                  value={festivalDealForm.discountPercentage}
                  onChange={(e) => setFestivalDealForm({ ...festivalDealForm, discountPercentage: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddFestivalDealOpen(false)} className="px-4 py-2 bg-stone-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow">Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Flash Sale Modal */}
      {isAddFlashSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsAddFlashSaleOpen(false)} />
          <div className="relative bg-stone-900 border border-stone-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-display font-bold text-base text-white">Activate Flash Sale</h3>
            <form onSubmit={handleCreateFlashSale} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Flash Sale Title</label>
                <input
                  type="text"
                  required
                  value={flashSaleForm.title}
                  onChange={(e) => setFlashSaleForm({ ...flashSaleForm, title: e.target.value })}
                  placeholder="e.g. 2-Hour Midnight Slipper Drop"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Discount (%)</label>
                  <input
                    type="number"
                    required
                    value={flashSaleForm.discountPercentage}
                    onChange={(e) => setFlashSaleForm({ ...flashSaleForm, discountPercentage: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Stock Limit</label>
                  <input
                    type="number"
                    value={flashSaleForm.stockLimit}
                    onChange={(e) => setFlashSaleForm({ ...flashSaleForm, stockLimit: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddFlashSaleOpen(false)} className="px-4 py-2 bg-stone-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow">Start Countdown</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsAddCouponOpen(false)} />
          <div className="relative bg-stone-900 border border-stone-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-display font-bold text-base text-white">Create Promo Coupon</h3>
            <form onSubmit={handleCreateCouponSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="COMFORT20"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Discount (%)</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-black"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-luxury-accent text-stone-950 font-bold rounded-xl shadow-glow"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
