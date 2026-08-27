import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const DEFAULT_SETTINGS = {
  storeName: 'AuraSole',
  brandName: 'AuraSole',
  storeTitle: 'AuraSole — Luxury Slipper Showroom',
  tagline: 'Walk With Pure Luxury',
  description: 'Handcrafted orthotic and luxury comfort slippers engineered for effortless daily elegance.',
  logo: null,
  logoDark: null,
  favicon: null,
  footerLogo: null,
  contactEmail: 'support@aurasole.com',
  supportEmail: 'support@aurasole.com',
  phone: '+91 98765 43210',
  whatsappNumber: '+91 98765 43210',
  whatsappCommunityLink: '',
  whatsappDefaultMessage: 'Hi AuraSole! I would like to order slippers.',
  whatsappGreeting: 'Welcome to AuraSole Luxury Footwear Support.',
  whatsappSupportMessage: 'Need help finding your perfect slipper size? Chat with us.',
  address: 'Showroom 42, Slipper Heritage Lane, Luxury Avenue, Mumbai - 400001',
  city: 'Mumbai',
  district: 'Mumbai City',
  state: 'Maharashtra',
  pincode: '400001',
  country: 'India',
  businessHours: 'Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 7:00 PM',
  currency: 'INR',
  currencySymbol: '₹',
  websiteUrl: 'https://aurasole.com',
  facebookUrl: 'https://facebook.com/aurasole',
  instagramUrl: 'https://instagram.com/aurasole',
  youtubeUrl: 'https://youtube.com/aurasole',
  twitterUrl: 'https://twitter.com/aurasole',
  footerText: 'Experience next-generation footwear ergonomics with our signature arch-cradling soles.',
  copyrightText: 'All Rights Reserved.',
  announcementActive: true,
  announcementMessage: '🔥 Festival Sale Live — Up to 50% OFF Signature Slippers | Express Free Shipping Across India',
  announcementLink: '/shop',
  estimatedDeliveryDays: '3-5 Business Days',
  cancellationDeadlineHours: 24,
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  maintenanceMode: false,
  maintenanceMessage: 'Our Luxury Slipper Showroom is currently undergoing scheduled upgrades. We will be back online shortly.',
  maintenanceEstimatedEndTime: null,

  // Login Page Controls
  loginTitle: 'Welcome Back',
  loginSubtitle: 'Step into your personalized comfort showroom and orders.',
  loginWelcomeMessage: 'Doctor-Engineered Cloud Slippers • Handcrafted Daily Luxury',
  loginBgImage: '',
  loginShowAddress: true,
  loginShowPhone: true,
  loginShowWhatsApp: true,
  loginShowEmail: true,
  loginGoogleEnabled: true,
  loginFacebookEnabled: true,

  // Register Page Controls
  registerTitle: 'Create Your Account',
  registerSubtitle: 'Join for exclusive slipper drops & priority shipping.',
  registerWelcomeMessage: 'Handcrafted luxury comfort engineered for everyday elegance.',
  registerPhoneRequired: true,
  registerWhatsAppRequired: false,

  // Checkout Controls
  checkoutTitle: 'Secure Slipper Checkout',
  checkoutInstructions: 'All orders include 7-Day Doorstep Replacement Guarantee & Real-time Courier Tracking.',
  checkoutTrustBadge: '🔒 256-Bit SSL Encrypted • 100% Genuine Orthopedic Footwear',
  razorpayEnabled: true,
  whatsappOrderEnabled: true,

  // SEO & Meta
  metaTitle: 'AuraSole — Premium Slipper Showroom & Ergonomic Footwear',
  metaDescription: 'Discover doctor-engineered recovery slides, orthopedic slippers, and daily luxury flip-flops.',
  metaKeywords: 'slippers, slides, orthopedic slippers, luxury footwear, recovery slides, comfort footwear',
  ogImage: '',

  // Promotional Popups
  popupActive: false,
  popupTitle: 'Limited Slipper Drop 🔥',
  popupMessage: 'Use code COMFORT15 on checkout for an exclusive 15% discount on all cloud recovery slides.',
  popupImage: '',
  popupLink: '/shop',
  popupCtaText: 'Shop Slipper Deals',

  // About & Brand Story
  aboutStory: 'AuraSole was founded with a singular mission: to eliminate daily foot fatigue by engineering the perfect balance of orthotic arch support and cloud-like cushioning.',
  aboutMission: "To handcraft India's most comfortable, doctor-approved daily recovery slippers.",
  aboutVision: 'To elevate everyday indoor and outdoor footwear into a premium wellness experience.',
  aboutImages: [],
  aboutHighlights: [],
  contactMapEmbed: '',
  mapCoordinates: '18.9220,72.8347',
  mapDisplayActive: true,

  // Navigation & Footer Config
  navigationConfig: [],
  footerLinks: [],

  // Dynamic Policies
  privacyPolicyHtml: '',
  termsHtml: '',
  returnPolicyHtml: '',
  shippingPolicyHtml: '',
};

const StoreSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  refreshSettings: () => {},
  updateSettings: async () => {},
});

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Public Settings from Backend API
  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings/public');
      if (res?.data) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.data,
        });
      }
    } catch (err) {
      console.warn('Failed to load store settings from server, using defaults:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Dynamically Update Document Title and Favicon
  useEffect(() => {
    if (settings.metaTitle || settings.storeName) {
      document.title = settings.metaTitle || `${settings.storeName} — ${settings.tagline || 'Premium Slippers'}`;
    }

    if (settings.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings.metaTitle, settings.storeName, settings.tagline, settings.favicon]);

  // Admin Update Action
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const res = await api.put('/settings/admin', newSettings);
      if (res?.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
      return res;
    } catch (err) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    settings,
    isLoading,
    refreshSettings: fetchSettings,
    updateSettings,
  }), [settings, isLoading, fetchSettings, updateSettings]);

  return (
    <StoreSettingsContext.Provider value={contextValue}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};

export default StoreSettingsContext;
