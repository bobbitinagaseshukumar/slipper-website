import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AccountSidebar = ({ activeTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'Orders & Tracking', icon: Package },
    { id: 'wishlist', label: 'Saved Wishlist', icon: Heart },
    { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'recently-viewed', label: 'Recently Viewed', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'coupons', label: 'Active Coupons', icon: Tag },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'help', label: 'Help & FAQs', icon: HelpCircle },
  ];

  return (
    <aside className="w-full lg:w-72 bg-white rounded-3xl p-5 border border-gray-100/90 shadow-sm shrink-0 space-y-6">
      {/* Customer Avatar & Mini Header */}
      <div className="flex items-center gap-3.5 pb-5 border-b border-gray-100">
        <div className="relative">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-luxury-accent/30 shadow-xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-luxury-dark text-luxury-accent font-display font-black text-lg flex items-center justify-center shadow-md">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <button
            type="button"
            onClick={() => onSelectTab('profile')}
            className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-white text-gray-600 hover:text-luxury-dark shadow-sm border border-gray-100 transition-colors"
            title="Edit profile photo"
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-display font-bold text-sm text-gray-900 truncate">
            {user?.name || 'Valued Customer'}
          </h2>
          <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-luxury-dark text-white shadow-md'
                  : 'text-gray-600 hover:bg-luxury-warmWhite hover:text-luxury-dark'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-luxury-accent' : 'text-gray-400 group-hover:text-luxury-dark'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Logout Action */}
        <div className="pt-3 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default AccountSidebar;
