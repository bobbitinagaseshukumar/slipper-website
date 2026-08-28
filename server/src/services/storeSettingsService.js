const prisma = require('../config/db');

// In-Memory Cache with TTL
let cachedSettings = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache, invalidated immediately upon admin update

const DEFAULT_SETTINGS = {
  storeName: 'AuraSole',
  brandName: 'AuraSole',
  storeTitle: 'AuraSole — Luxury Slipper Showroom',
  tagline: 'Walk With Pure Luxury',
  description: 'Handcrafted orthotic and luxury comfort slippers engineered for effortless daily elegance.',
  logo: '',
  logoDark: '',
  favicon: '',
  footerLogo: '',
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
  timezone: 'Asia/Kolkata',
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
  googleLoginEnabled: true,
  facebookLoginEnabled: true,
  emailLoginEnabled: true,
  phoneLoginEnabled: true,
  otpLoginEnabled: true,
  registrationEnabled: true,
  forgotPasswordEnabled: true,
  passwordMinLength: 6,
  passwordRequireUppercase: false,
  passwordRequireNumber: false,
  passwordRequireSpecialChar: false,

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

/**
 * 1. Get or Initialize Store Settings from Database
 */
const getStoreSettings = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedSettings && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedSettings;
  }

  try {
    let settings = await prisma.storeSettings.findFirst();

    if (!settings) {
      // Seed initial default record if none exists
      settings = await prisma.storeSettings.create({
        data: DEFAULT_SETTINGS,
      });
    }

    cachedSettings = settings;
    lastFetchedAt = now;
    return settings;
  } catch (error) {
    console.error('Error loading StoreSettings from DB, using fallback defaults:', error.message);
    return cachedSettings || DEFAULT_SETTINGS;
  }
};

/**
 * 2. Get Public Sanitized Settings for Customers
 */
const getPublicSettings = async () => {
  const full = await getStoreSettings();
  return {
    storeName: full.storeName || DEFAULT_SETTINGS.storeName,
    brandName: full.brandName || full.storeName || DEFAULT_SETTINGS.brandName,
    storeTitle: full.storeTitle || DEFAULT_SETTINGS.storeTitle,
    tagline: full.tagline || DEFAULT_SETTINGS.tagline,
    description: full.description || DEFAULT_SETTINGS.description,
    logo: full.logo || null,
    logoDark: full.logoDark || null,
    favicon: full.favicon || null,
    footerLogo: full.footerLogo || null,
    contactEmail: full.contactEmail || DEFAULT_SETTINGS.contactEmail,
    supportEmail: full.supportEmail || DEFAULT_SETTINGS.supportEmail,
    phone: full.phone || DEFAULT_SETTINGS.phone,
    whatsappNumber: full.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
    whatsappCommunityLink: full.whatsappCommunityLink,
    whatsappDefaultMessage: full.whatsappDefaultMessage || DEFAULT_SETTINGS.whatsappDefaultMessage,
    whatsappGreeting: full.whatsappGreeting || DEFAULT_SETTINGS.whatsappGreeting,
    whatsappSupportMessage: full.whatsappSupportMessage || DEFAULT_SETTINGS.whatsappSupportMessage,
    address: full.address || DEFAULT_SETTINGS.address,
    city: full.city || DEFAULT_SETTINGS.city,
    district: full.district || DEFAULT_SETTINGS.district,
    state: full.state || DEFAULT_SETTINGS.state,
    pincode: full.pincode || DEFAULT_SETTINGS.pincode,
    country: full.country || DEFAULT_SETTINGS.country,
    businessHours: full.businessHours || DEFAULT_SETTINGS.businessHours,
    currency: full.currency || DEFAULT_SETTINGS.currency,
    currencySymbol: full.currencySymbol || DEFAULT_SETTINGS.currencySymbol,
    websiteUrl: full.websiteUrl || DEFAULT_SETTINGS.websiteUrl,
    facebookUrl: full.facebookUrl,
    instagramUrl: full.instagramUrl,
    youtubeUrl: full.youtubeUrl,
    twitterUrl: full.twitterUrl,
    footerText: full.footerText || DEFAULT_SETTINGS.footerText,
    copyrightText: full.copyrightText || DEFAULT_SETTINGS.copyrightText,
    announcementActive: full.announcementActive,
    announcementMessage: full.announcementMessage,
    announcementLink: full.announcementLink,
    estimatedDeliveryDays: full.estimatedDeliveryDays,
    cancellationDeadlineHours: full.cancellationDeadlineHours,
    freeShippingThreshold: full.freeShippingThreshold,
    standardShippingFee: full.standardShippingFee,
    maintenanceMode: full.maintenanceMode,
    maintenanceMessage: full.maintenanceMessage,
    maintenanceEstimatedEndTime: full.maintenanceEstimatedEndTime,

    // Login Page Controls
    loginTitle: full.loginTitle || DEFAULT_SETTINGS.loginTitle,
    loginSubtitle: full.loginSubtitle || DEFAULT_SETTINGS.loginSubtitle,
    loginWelcomeMessage: full.loginWelcomeMessage || DEFAULT_SETTINGS.loginWelcomeMessage,
    loginBgImage: full.loginBgImage,
    loginShowAddress: full.loginShowAddress !== false,
    loginShowPhone: full.loginShowPhone !== false,
    loginShowWhatsApp: full.loginShowWhatsApp !== false,
    loginShowEmail: full.loginShowEmail !== false,
    loginGoogleEnabled: full.googleLoginEnabled !== false,
    loginFacebookEnabled: full.facebookLoginEnabled !== false,

    // Register Page Controls
    registerTitle: full.registerTitle || DEFAULT_SETTINGS.registerTitle,
    registerSubtitle: full.registerSubtitle || DEFAULT_SETTINGS.registerSubtitle,
    registerWelcomeMessage: full.registerWelcomeMessage || DEFAULT_SETTINGS.registerWelcomeMessage,
    registerPhoneRequired: full.registerPhoneRequired !== false,
    registerWhatsAppRequired: full.registerWhatsAppRequired === true,

    // Checkout Controls
    checkoutTitle: full.checkoutTitle || DEFAULT_SETTINGS.checkoutTitle,
    checkoutInstructions: full.checkoutInstructions || DEFAULT_SETTINGS.checkoutInstructions,
    checkoutTrustBadge: full.checkoutTrustBadge || DEFAULT_SETTINGS.checkoutTrustBadge,
    razorpayEnabled: full.razorpayEnabled !== false,
    whatsappOrderEnabled: full.whatsappOrderEnabled !== false,

    // SEO & Meta
    metaTitle: full.metaTitle || DEFAULT_SETTINGS.metaTitle,
    metaDescription: full.metaDescription || DEFAULT_SETTINGS.metaDescription,
    metaKeywords: full.metaKeywords || DEFAULT_SETTINGS.metaKeywords,
    ogImage: full.ogImage,

    // Popups
    popupActive: full.popupActive === true,
    popupTitle: full.popupTitle || DEFAULT_SETTINGS.popupTitle,
    popupMessage: full.popupMessage || DEFAULT_SETTINGS.popupMessage,
    popupImage: full.popupImage,
    popupLink: full.popupLink || DEFAULT_SETTINGS.popupLink,
    popupCtaText: full.popupCtaText || DEFAULT_SETTINGS.popupCtaText,

    // About & Brand Story
    aboutStory: full.aboutStory || DEFAULT_SETTINGS.aboutStory,
    aboutMission: full.aboutMission || DEFAULT_SETTINGS.aboutMission,
    aboutVision: full.aboutVision || DEFAULT_SETTINGS.aboutVision,
    aboutImages: full.aboutImages || [],
    aboutHighlights: full.aboutHighlights || [],
    contactMapEmbed: full.contactMapEmbed,
    mapCoordinates: full.mapCoordinates || DEFAULT_SETTINGS.mapCoordinates,
    mapDisplayActive: full.mapDisplayActive !== false,

    // Navigation & Footer Config
    navigationConfig: full.navigationConfig || [],
    footerLinks: full.footerLinks || [],

    // Dynamic Policies
    privacyPolicyHtml: full.privacyPolicyHtml,
    termsHtml: full.termsHtml,
    returnPolicyHtml: full.returnPolicyHtml,
    shippingPolicyHtml: full.shippingPolicyHtml,
  };
};

/**
 * 3. Update Settings from Admin Portal
 */
const updateStoreSettings = async (data, adminId) => {
  const existing = await prisma.storeSettings.findFirst();

  let updated;
  if (existing) {
    updated = await prisma.storeSettings.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedBy: adminId || 'ADMIN',
      },
    });
  } else {
    updated = await prisma.storeSettings.create({
      data: {
        ...DEFAULT_SETTINGS,
        ...data,
        updatedBy: adminId || 'ADMIN',
      },
    });
  }

  // Record Audit Log
  try {
    if (adminId) {
      await prisma.adminActivity.create({
        data: {
          adminId,
          action: 'SETTINGS_UPDATED',
          details: `Admin updated store settings: Store Name = ${updated.storeName}, WhatsApp = ${updated.whatsappNumber}`,
        },
      });
    }
  } catch (logErr) {
    console.error('Failed to write settings audit log:', logErr.message);
  }

  // Invalidate In-Memory Cache immediately
  cachedSettings = updated;
  lastFetchedAt = Date.now();

  return updated;
};

module.exports = {
  getStoreSettings,
  getPublicSettings,
  updateStoreSettings,
};
