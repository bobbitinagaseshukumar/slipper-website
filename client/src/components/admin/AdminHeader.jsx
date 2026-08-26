import React from 'react';
import { Menu, Bell, User, Search, ShieldCheck, ChevronRight, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Link } from 'react-router-dom';

const AdminHeader = ({ activeTab, onToggleSidebar, onSearchQuery, onSelectTab }) => {
  const { user, logout } = useAuth();
  const { settings } = useStoreSettings();

  return (
    <header className="bg-stone-950/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-400">
          <span className="text-luxury-accent font-black">{settings.storeName || 'AuraSole'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
          <span className="text-white font-bold capitalize">{activeTab.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="hidden md:flex items-center relative max-w-xs w-full">
        <input
          type="text"
          placeholder="Quick search products, orders, customers..."
          onChange={(e) => onSearchQuery && onSearchQuery(e.target.value)}
          className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-luxury-accent transition-colors"
        />
        <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Right: Security Badge, Notifications & Admin Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* 2FA Protected Badge */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-[10px] font-bold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>2FA Verified</span>
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={() => onSelectTab && onSelectTab('notifications')}
          className="relative p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-luxury-accent animate-pulse" />
        </button>

        {/* Admin User Badge */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 pr-2 py-1 rounded-full bg-stone-900 border border-stone-800 text-xs text-stone-200">
          <div className="w-6 h-6 rounded-full bg-luxury-accent text-stone-950 font-black text-xs flex items-center justify-center">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="font-bold text-white max-w-[120px] truncate hidden sm:inline text-xs">
            {user?.name || 'Administrator'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-luxury-accent/20 text-luxury-accent text-[9px] font-bold uppercase">
            {user?.role || 'ADMIN'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
