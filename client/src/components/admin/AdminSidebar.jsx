import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  FolderTree,
  Folder,
  Archive,
  Image,
  Home,
  Gift,
  Sparkles,
  Zap,
  Tag,
  Mail,
  Bell,
  Star,
  CreditCard,
  MessageSquare,
  Truck,
  TrendingUp,
  FileText,
  Settings,
  User,
  ShieldCheck,
  Activity,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Link } from 'react-router-dom';

const AdminSidebar = ({
  activeTab,
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { logout, user } = useAuth();
  const { settings } = useStoreSettings();

  const navGroups = [
    {
      group: 'Core Commerce',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: FolderTree },
        { id: 'subcategories', label: 'Subcategories', icon: Folder },
        { id: 'inventory', label: 'Inventory', icon: Archive },
      ],
    },
    {
      group: 'Promotions & Deals',
      items: [
        { id: 'banners', label: 'Banners', icon: Image },
        { id: 'homepage', label: 'Homepage Sections', icon: Home },
        { id: 'offers', label: 'Offers & Deals', icon: Gift },
        { id: 'festival_deals', label: 'Festival Deals', icon: Sparkles },
        { id: 'flash_sales', label: 'Flash Sales', icon: Zap },
        { id: 'coupons', label: 'Coupons', icon: Tag },
      ],
    },
    {
      group: 'Operations & Channels',
      items: [
        { id: 'emails', label: 'Email Center', icon: Mail },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'whatsapp_orders', label: 'WhatsApp Orders', icon: MessageSquare },
        { id: 'delivery', label: 'Delivery Mgmt', icon: Truck },
      ],
    },
    {
      group: 'Intelligence & Reports',
      items: [
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
    },
    {
      group: 'Experience & Auth',
      items: [
        { id: 'login_page', label: 'Login Page Control', icon: User },
        { id: 'register_page', label: 'Register Page Control', icon: Users },
        { id: 'checkout_page', label: 'Checkout Control', icon: CreditCard },
        { id: 'popups_mgmt', label: 'Popups & Banner', icon: Sparkles },
        { id: 'pages_mgmt', label: 'About & Policies', icon: FileText },
        { id: 'seo_mgmt', label: 'SEO & Metadata', icon: TrendingUp },
      ],
    },
    {
      group: 'System & Security',
      items: [
        { id: 'settings', label: 'Store Settings', icon: Settings },
        { id: 'profile', label: 'Admin Profile', icon: User },
        { id: 'security', label: 'Security & 2FA', icon: ShieldCheck },
        { id: 'audit-logs', label: 'Activity Logs', icon: Activity },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`bg-stone-950 border-r border-stone-800 text-stone-200 transition-all duration-300 flex flex-col justify-between h-screen fixed lg:sticky top-0 z-50 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-stone-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-luxury-accent/20 border border-luxury-accent/50 text-luxury-accent flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div>
                  <span className="font-display font-black text-sm tracking-tight text-white block">
                    {settings.storeName || 'AuraSole'} Admin
                  </span>
                  <span className="text-[10px] font-mono text-luxury-accent font-bold uppercase">
                    25 Systems Control
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle / Mobile Close */}
            <div className="flex items-center">
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              )}
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-xl hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)] no-scrollbar">
            {navGroups.map((grp, grpIdx) => (
              <div key={grpIdx} className="space-y-1">
                {!isCollapsed && (
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 px-3 pt-2">
                    {grp.group}
                  </h4>
                )}
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-luxury-accent text-stone-950 shadow-md font-black'
                          : 'text-stone-400 hover:bg-stone-900 hover:text-white'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-stone-800 space-y-1.5 bg-stone-950">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
            title="View Storefront"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>View Storefront</span>}
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
