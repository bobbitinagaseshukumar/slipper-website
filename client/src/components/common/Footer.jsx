import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ShieldCheck,
  Shield,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  ArrowRight,
  MessageSquare,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const Footer = () => {
  const { settings } = useStoreSettings();
  const [openSections, setOpenSections] = useState({});
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-luxury-dark text-white border-t border-white/10 pt-16 pb-28 lg:pb-12">
      {/* Top Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-luxury-accent shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Fast Pan-India Delivery</p>
              <p className="text-[11px] text-gray-400">Free on orders above ₹{settings.freeShippingThreshold || 999}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-luxury-accent shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Ergonomic Guarantee</p>
              <p className="text-[11px] text-gray-400">Arch support & cloud cushion soles</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-luxury-accent shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Hassle-Free Exchange</p>
              <p className="text-[11px] text-gray-400">7-day doorstep size replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-luxury-accent shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Footwear Stylist Help</p>
              <p className="text-[11px] text-gray-400">WhatsApp: {settings.whatsappNumber || '+91 98765 43210'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation & Brand Column */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.storeName} className="h-9 max-w-[140px] object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-luxury-accent text-luxury-dark flex items-center justify-center font-display font-extrabold text-lg">
                  {settings.storeName ? settings.storeName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <span className="font-display font-black text-2xl tracking-tight text-white">
                {settings.storeName || 'AuraSole'}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              {settings.description || settings.footerText || "Crafting India's finest dedicated slipper collections. Every slide, flip-flop, and orthopedic sole is engineered for cloud-like step comfort and effortless modern luxury."}
            </p>

            <div className="space-y-1.5 text-xs text-gray-400 pt-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-luxury-accent shrink-0 mt-0.5" />
                <span>{settings.address || 'Showroom 42, Slipper Heritage Lane, Luxury Avenue, Mumbai - 400001'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-luxury-accent shrink-0" />
                <span>{settings.businessHours || 'Mon - Sat: 9:00 AM - 9:00 PM'}</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <button
              onClick={() => toggleSection('shop')}
              className="w-full lg:w-auto flex items-center justify-between font-bold text-sm text-white mb-3"
            >
              <span>Slipper Collections</span>
              <ChevronDown className={`w-4 h-4 lg:hidden transition-transform ${openSections.shop ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`space-y-2 text-xs text-gray-400 ${openSections.shop ? 'block' : 'hidden lg:block'}`}>
              <li><Link to="/shop?category=men" className="hover:text-luxury-accent transition-colors">Men's Comfort Slides</Link></li>
              <li><Link to="/shop?category=women" className="hover:text-luxury-accent transition-colors">Women's Cloud Slippers</Link></li>
              <li><Link to="/shop?category=kids" className="hover:text-luxury-accent transition-colors">Kids Lightweight Slippers</Link></li>
              <li><Link to="/shop" className="hover:text-luxury-accent transition-colors">Orthopedic Recovery Soles</Link></li>
              <li><Link to="/shop" className="hover:text-luxury-accent transition-colors">All Slipper Styles</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <button
              onClick={() => toggleSection('care')}
              className="w-full lg:w-auto flex items-center justify-between font-bold text-sm text-white mb-3"
            >
              <span>Customer Care</span>
              <ChevronDown className={`w-4 h-4 lg:hidden transition-transform ${openSections.care ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`space-y-2 text-xs text-gray-400 ${openSections.care ? 'block' : 'hidden lg:block'}`}>
              <li><Link to="/shipping-policy" className="hover:text-luxury-accent transition-colors">Express Shipping Info</Link></li>
              <li><Link to="/return-policy" className="hover:text-luxury-accent transition-colors">7-Day Return Policy</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-luxury-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-luxury-accent transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <button
              onClick={() => toggleSection('contact')}
              className="w-full lg:w-auto flex items-center justify-between font-bold text-sm text-white mb-3"
            >
              <span>Get In Touch</span>
              <ChevronDown className={`w-4 h-4 lg:hidden transition-transform ${openSections.contact ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-3 text-xs text-gray-400 ${openSections.contact ? 'block' : 'hidden lg:block'}`}>
              <p>Phone: <span className="text-white font-semibold">{settings.phone || '+91 98765 43210'}</span></p>
              <p>WhatsApp: <span className="text-emerald-400 font-semibold">{settings.whatsappNumber || '+91 98765 43210'}</span></p>
              <p>Email: <span className="text-white font-semibold">{settings.contactEmail || settings.supportEmail || 'support@aurasole.com'}</span></p>

              <div className="flex items-center gap-2.5 pt-2">
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-luxury-accent hover:text-luxury-dark flex items-center justify-center transition-colors" aria-label="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-luxury-accent hover:text-luxury-dark flex items-center justify-center transition-colors" aria-label="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings.youtubeUrl && (
                  <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-luxury-accent hover:text-luxury-dark flex items-center justify-center transition-colors" aria-label="YouTube">
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {settings.twitterUrl && (
                  <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-luxury-accent hover:text-luxury-dark flex items-center justify-center transition-colors" aria-label="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} {settings.storeName || 'AuraSole'}. {settings.copyrightText || 'All Rights Reserved.'}</p>
        <div className="flex items-center gap-6">
          <Link to="/privacy-policy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          <Link to="/shipping-policy" className="hover:text-gray-400 transition-colors">Shipping Info</Link>
          <Link to="/admin/login" className="hover:text-luxury-accent transition-colors flex items-center gap-1 text-amber-400/90 font-bold">
            <Shield className="w-3 h-3" /> Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
