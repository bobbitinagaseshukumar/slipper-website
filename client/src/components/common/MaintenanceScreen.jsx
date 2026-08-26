import React from 'react';
import { Hammer, Clock, MessageCircle, Mail, MapPin } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const MaintenanceScreen = () => {
  const { settings } = useStoreSettings();

  const cleanWhatsApp = (settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-luxury-dark text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-luxury-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="flex items-center gap-3 relative z-10">
        {settings.logo ? (
          <img src={settings.logo} alt={settings.storeName} className="h-10 max-w-[140px] object-contain" />
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-luxury-accent text-stone-950 flex items-center justify-center font-display font-black text-xl">
            {settings.storeName ? settings.storeName.charAt(0).toUpperCase() : 'A'}
          </div>
        )}
        <div>
          <h2 className="font-display font-black text-xl tracking-tight text-white">
            {settings.storeName || 'AuraSole'}
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-luxury-accent font-bold">
            {settings.tagline || 'Footwear Studio'}
          </p>
        </div>
      </div>

      {/* Main Notice */}
      <div className="max-w-xl mx-auto text-center space-y-6 relative z-10 py-12">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 text-luxury-accent flex items-center justify-center mx-auto shadow-2xl">
          <Hammer className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-luxury-accent/20 text-luxury-accent text-[11px] font-black uppercase tracking-wider">
            Upgrading Showroom Experience
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            We Are Upgrading Our Digital Store
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            Our craftsmen and engineering teams are tuning the showroom for a faster, smoother shopping experience. We will be back online shortly.
          </p>
        </div>

        {/* Contact Assistance */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(`Hello ${settings.storeName || 'AuraSole'}, I am inquiring about showroom updates.`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp ({settings.whatsappNumber})</span>
          </a>

          <a
            href={`mailto:${settings.supportEmail || settings.contactEmail || 'support@aurasole.com'}`}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Email Support</span>
          </a>
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 border-t border-white/10 pt-6 relative z-10">
        <p className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-luxury-accent" />
          <span>{settings.address || 'Showroom 42, Luxury Footwear Lane, Mumbai'}</span>
        </p>
        <p>© {new Date().getFullYear()} {settings.storeName || 'AuraSole'}. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
