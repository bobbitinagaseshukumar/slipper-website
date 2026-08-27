import React, { useState, useEffect } from 'react';
import {
  Globe,
  Settings,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Crop,
  Check,
  Loader2,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Share2,
  FileText,
  Search,
  Eye,
  Sliders,
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import ImageCropModal from './ImageCropModal';

const SUB_TABS = [
  { id: 'identity', label: 'Identity & Logos', icon: Globe },
  { id: 'whatsapp', label: 'WhatsApp & Ordering', icon: MessageSquare },
  { id: 'store_info', label: 'Store Location & Map', icon: MapPin },
  { id: 'announcement', label: 'Announcement Bar', icon: Sparkles },
  { id: 'footer', label: 'Footer & Social Links', icon: Share2 },
  { id: 'about', label: 'About & Brand Story', icon: FileText },
  { id: 'seo', label: 'SEO & Metadata', icon: Search },
  { id: 'maintenance', label: 'Maintenance Mode', icon: AlertTriangle },
];

const AdminWebsiteSettingsManager = ({ showToast }) => {
  const { settings: globalSettings, updateSettings } = useStoreSettings();
  const [activeSubTab, setActiveSubTab] = useState('identity');
  const [formData, setFormData] = useState({ ...globalSettings });
  const [isSaving, setIsSaving] = useState(false);

  // Image Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTargetField, setCropTargetField] = useState('logo'); // 'logo', 'favicon', 'logoDark', 'footerLogo', 'ogImage'

  useEffect(() => {
    if (globalSettings) {
      setFormData((prev) => ({
        ...prev,
        ...globalSettings,
      }));
    }
  }, [globalSettings]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      showToast('success', 'Website settings published successfully across entire store!');
    } catch (err) {
      showToast('error', err.message || 'Failed to update website settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCropper = (field) => {
    setCropTargetField(field);
    setCropModalOpen(true);
  };

  const handleCropComplete = (uploadedUrl) => {
    setFormData((prev) => ({ ...prev, [cropTargetField]: uploadedUrl }));
    showToast('success', `${cropTargetField} image cropped and uploaded successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-stone-900 border border-stone-800 rounded-3xl">
        <div>
          <h2 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-luxury-accent" />
            Website Management & Omnichannel Settings
          </h2>
          <p className="text-xs text-stone-400">
            Single central source of truth for website identity, logos with interactive crop, WhatsApp ordering, contact channels, footer, and brand story.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save & Publish All Changes'}</span>
        </button>
      </div>

      {/* Sub-Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-800">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shrink-0 transition-all ${
                isActive
                  ? 'bg-luxury-accent text-stone-950 shadow-glow'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* ======================================================== */}
        {/* 1. IDENTITY & LOGOS TAB */}
        {/* ======================================================== */}
        {activeSubTab === 'identity' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
                Store Identity & Customer-Facing Headings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Store / Website Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.storeName || ''}
                    onChange={(e) => handleChange('storeName', e.target.value)}
                    placeholder="AuraSole"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-bold"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Updates header, mobile drawer, checkout, footer & email notices.</p>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brandName || ''}
                    onChange={(e) => handleChange('brandName', e.target.value)}
                    placeholder="AuraSole Footwear"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Store Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="Walk With Pure Luxury"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Customer-Facing Store Title</label>
                  <input
                    type="text"
                    value={formData.storeTitle || ''}
                    onChange={(e) => handleChange('storeTitle', e.target.value)}
                    placeholder="AuraSole — Luxury Slipper Showroom"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Store Description (Footer / Meta Preview)</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Handcrafted orthotic and luxury comfort slippers engineered for effortless daily elegance."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white leading-relaxed"
                />
              </div>
            </div>

            {/* Logo & Favicon with Crop Controls */}
            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
                Storefront Logos & Favicon (1:1 / Proportional Crop)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Primary Logo */}
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Primary Store Logo</span>
                    <button
                      type="button"
                      onClick={() => handleOpenCropper('logo')}
                      className="text-[11px] text-luxury-accent font-bold hover:underline flex items-center gap-1"
                    >
                      <Crop className="w-3.5 h-3.5" /> Crop & Upload
                    </button>
                  </div>

                  <div className="h-20 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-center overflow-hidden p-2">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-stone-500 text-[11px]">No Logo Uploaded</span>
                    )}
                  </div>

                  <input
                    type="url"
                    value={formData.logo || ''}
                    onChange={(e) => handleChange('logo', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-[10px]"
                  />
                </div>

                {/* Favicon */}
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Browser Favicon</span>
                    <button
                      type="button"
                      onClick={() => handleOpenCropper('favicon')}
                      className="text-[11px] text-luxury-accent font-bold hover:underline flex items-center gap-1"
                    >
                      <Crop className="w-3.5 h-3.5" /> Crop & Upload
                    </button>
                  </div>

                  <div className="h-20 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-center overflow-hidden p-2">
                    {formData.favicon ? (
                      <img src={formData.favicon} alt="Favicon" className="w-10 h-10 object-contain rounded-lg shadow" />
                    ) : (
                      <span className="text-stone-500 text-[11px]">Default Icon</span>
                    )}
                  </div>

                  <input
                    type="url"
                    value={formData.favicon || ''}
                    onChange={(e) => handleChange('favicon', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-[10px]"
                  />
                </div>

                {/* Footer Logo */}
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Footer / Dark Logo</span>
                    <button
                      type="button"
                      onClick={() => handleOpenCropper('footerLogo')}
                      className="text-[11px] text-luxury-accent font-bold hover:underline flex items-center gap-1"
                    >
                      <Crop className="w-3.5 h-3.5" /> Crop & Upload
                    </button>
                  </div>

                  <div className="h-20 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-center overflow-hidden p-2">
                    {formData.footerLogo || formData.logo ? (
                      <img
                        src={formData.footerLogo || formData.logo}
                        alt="Footer Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-stone-500 text-[11px]">Using Primary Logo</span>
                    )}
                  </div>

                  <input
                    type="url"
                    value={formData.footerLogo || ''}
                    onChange={(e) => handleChange('footerLogo', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-[10px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. WHATSAPP & ORDERING TAB */}
        {/* ======================================================== */}
        {activeSubTab === 'whatsapp' && (
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                WhatsApp Ordering & Dynamic Message Templates
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.whatsappOrderEnabled !== false}
                  onChange={(e) => handleChange('whatsappOrderEnabled', e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="text-white font-bold">Enable WhatsApp Ordering System</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">
                  Official Store WhatsApp Number * (Global)
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Used dynamically on all Product Details, Cart, Floating buttons, and Order notifications.
                </p>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">
                  WhatsApp Community / VIP Group Link
                </label>
                <input
                  type="url"
                  value={formData.whatsappCommunityLink || ''}
                  onChange={(e) => handleChange('whatsappCommunityLink', e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
                />
                <p className="text-[10px] text-stone-500 mt-1">Displayed in footer and customer account notifications.</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">
                  Default Quick Inquiry Message Template
                </label>
                <textarea
                  rows={2}
                  value={formData.whatsappDefaultMessage || ''}
                  onChange={(e) => handleChange('whatsappDefaultMessage', e.target.value)}
                  placeholder="Hi AuraSole! I would like to order slippers."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">
                  Footwear Stylist Live Support Message
                </label>
                <input
                  type="text"
                  value={formData.whatsappSupportMessage || ''}
                  onChange={(e) => handleChange('whatsappSupportMessage', e.target.value)}
                  placeholder="Need help finding your perfect slipper size? Chat with us."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. STORE LOCATION & MAP TAB */}
        {/* ======================================================== */}
        {activeSubTab === 'store_info' && (
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
              Flagship Slipper Showroom Details & Google Map
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Helpline Phone Number</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Customer Support Email</label>
                <input
                  type="email"
                  value={formData.contactEmail || formData.supportEmail || ''}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="support@aurasole.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Physical Address Line</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Showroom 42, Slipper Heritage Lane, Luxury Avenue"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Mumbai"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">District / Region</label>
                <input
                  type="text"
                  value={formData.district || ''}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="Mumbai City"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">State</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="400001"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Operating Business Hours</label>
              <input
                type="text"
                value={formData.businessHours || ''}
                onChange={(e) => handleChange('businessHours', e.target.value)}
                placeholder="Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 7:00 PM"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            {/* Map Embed URL */}
            <div className="pt-2">
              <label className="block text-stone-400 font-bold uppercase mb-1">
                Google Maps Embed URL / Share Link
              </label>
              <input
                type="text"
                value={formData.contactMapEmbed || ''}
                onChange={(e) => handleChange('contactMapEmbed', e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. ANNOUNCEMENT BAR TAB */}
        {/* ======================================================== */}
        {activeSubTab === 'announcement' && (
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
                Storefront Top Announcement Bar
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcementActive !== false}
                  onChange={(e) => handleChange('announcementActive', e.target.checked)}
                  className="rounded accent-luxury-accent"
                />
                <span className="text-white font-bold">Show Announcement Bar</span>
              </label>
            </div>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Announcement Message Text</label>
              <input
                type="text"
                value={formData.announcementMessage || ''}
                onChange={(e) => handleChange('announcementMessage', e.target.value)}
                placeholder="🔥 Festival Sale Live — Up to 50% OFF Signature Slippers | Express Free Shipping Across India"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Target Click URL</label>
              <input
                type="text"
                value={formData.announcementLink || ''}
                onChange={(e) => handleChange('announcementLink', e.target.value)}
                placeholder="/shop"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. FOOTER & SOCIAL LINKS TAB */}
        {/* ======================================================== */}
        {activeSubTab === 'footer' && (
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
              Footer Branding, Social Channels & Copyright
            </h3>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Footer Brand Text Description</label>
              <textarea
                rows={2}
                value={formData.footerText || ''}
                onChange={(e) => handleChange('footerText', e.target.value)}
                placeholder="Experience next-generation footwear ergonomics with our signature arch-cradling soles."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Instagram Profile URL</label>
                <input
                  type="url"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/aurasole"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Facebook Page URL</label>
                <input
                  type="url"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/aurasole"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">YouTube Channel URL</label>
                <input
                  type="url"
                  value={formData.youtubeUrl || ''}
                  onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                  placeholder="https://youtube.com/aurasole"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Twitter / X URL</label>
                <input
                  type="url"
                  value={formData.twitterUrl || ''}
                  onChange={(e) => handleChange('twitterUrl', e.target.value)}
                  placeholder="https://twitter.com/aurasole"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Copyright Notice Text</label>
              <input
                type="text"
                value={formData.copyrightText || ''}
                onChange={(e) => handleChange('copyrightText', e.target.value)}
                placeholder="All Rights Reserved."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. ABOUT & BRAND STORY TAB */}
        {/* ======================================================== */}
        {activeSubTab === 'about' && (
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
              About Page, Footwear Philosophy & Mission
            </h3>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">The Slipper Story</label>
              <textarea
                rows={4}
                value={formData.aboutStory || ''}
                onChange={(e) => handleChange('aboutStory', e.target.value)}
                placeholder="AuraSole was founded with a singular mission..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Our Mission</label>
                <textarea
                  rows={3}
                  value={formData.aboutMission || ''}
                  onChange={(e) => handleChange('aboutMission', e.target.value)}
                  placeholder="To handcraft India's most comfortable, doctor-approved daily recovery slippers."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Our Vision</label>
                <textarea
                  rows={3}
                  value={formData.aboutVision || ''}
                  onChange={(e) => handleChange('aboutVision', e.target.value)}
                  placeholder="To elevate everyday indoor and outdoor footwear into a premium wellness experience."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. SEO & METADATA TAB */}
        {/* ======================================================== */}
        {activeSubTab === 'seo' && (
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider">
              Search Engine Optimization (SEO) & Social Graph
            </h3>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Meta Title Tag (Browser Tab)</label>
              <input
                type="text"
                value={formData.metaTitle || ''}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                placeholder="AuraSole — Premium Slipper Showroom & Ergonomic Footwear"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={formData.metaDescription || ''}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                placeholder="Discover doctor-engineered recovery slides, orthopedic slippers, and daily luxury flip-flops."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Meta Keywords (Comma separated)</label>
              <input
                type="text"
                value={formData.metaKeywords || ''}
                onChange={(e) => handleChange('metaKeywords', e.target.value)}
                placeholder="slippers, slides, orthopedic slippers, luxury footwear, recovery slides"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. MAINTENANCE MODE TAB */}
        {/* ======================================================== */}
        {activeSubTab === 'maintenance' && (
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-luxury-accent uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Website Visibility & Maintenance Mode
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  When active, non-admin visitors see a luxury upgrade notice, while logged-in administrators can still access the portal.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-2 bg-stone-950 rounded-xl border border-stone-800">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode === true}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span className={`font-bold ${formData.maintenanceMode ? 'text-amber-400' : 'text-stone-400'}`}>
                  {formData.maintenanceMode ? 'ACTIVE (Store Locked)' : 'Disabled (Store Live)'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-stone-400 font-bold uppercase mb-1">Custom Maintenance Message</label>
              <textarea
                rows={3}
                value={formData.maintenanceMessage || ''}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                placeholder="Our Luxury Slipper Showroom is currently undergoing scheduled upgrades. We will be back online shortly."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Global Save Button at bottom */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-display font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save & Publish All Settings</span>
          </button>
        </div>
      </form>

      {/* Image Crop Modal */}
      {cropModalOpen && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          folder="slipper-store/identity"
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default AdminWebsiteSettingsManager;
