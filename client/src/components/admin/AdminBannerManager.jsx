import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  Check,
  X,
  ExternalLink,
  Eye,
  Crop,
  Layers,
  Sparkles,
  Loader2,
  Tag,
  Globe,
} from 'lucide-react';
import adminService from '../../services/adminService';
import ImageCropModal from './ImageCropModal';

const STATUS_BADGES = {
  PUBLISHED: { label: 'Published', bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800' },
  DRAFT: { label: 'Draft', bg: 'bg-amber-950/80 text-amber-400 border-amber-800' },
  ARCHIVED: { label: 'Archived', bg: 'bg-stone-800 text-stone-400 border-stone-700' },
};

const DESTINATION_OPTIONS = [
  { label: 'Shop All Slippers', value: '/shop' },
  { label: "Men's Slipper Collection", value: '/shop?category=men' },
  { label: "Women's Comfort Slides", value: '/shop?category=women' },
  { label: "Kids' Lightweight Slippers", value: '/shop?category=kids' },
  { label: 'Orthopedic Recovery Soles', value: '/shop?comfort=orthopedic' },
  { label: 'Trending Drops', value: '/shop?sort=trending' },
  { label: 'New Season Arrivals', value: '/shop?sort=newest' },
  { label: 'Custom URL / Path', value: 'CUSTOM' },
];

const AdminBannerManager = ({ showToast }) => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Image Crop Modal
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTargetField, setCropTargetField] = useState('image'); // 'image' or 'mobileImage'

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    image: '',
    mobileImage: '',
    link: '/shop',
    customLink: '',
    ctaText: 'Shop Slipper Drop',
    badge: 'Exclusive Drop',
    startDate: '',
    endDate: '',
    status: 'PUBLISHED',
    targetType: 'CATEGORY',
    isActive: true,
  });

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getBanners();
      if (res?.data) setBanners(res.data);
    } catch (err) {
      console.error('Failed to load banners:', err);
      showToast('error', 'Failed to load banners.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      tagline: '',
      image: '',
      mobileImage: '',
      link: '/shop',
      customLink: '',
      ctaText: 'Shop Slipper Drop',
      badge: 'Exclusive Drop',
      startDate: '',
      endDate: '',
      status: 'PUBLISHED',
      targetType: 'CATEGORY',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    const isCustom = !DESTINATION_OPTIONS.some((o) => o.value === banner.link && o.value !== 'CUSTOM');
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      tagline: banner.tagline || '',
      image: banner.image || '',
      mobileImage: banner.mobileImage || '',
      link: isCustom ? 'CUSTOM' : banner.link || '/shop',
      customLink: isCustom ? banner.link || '' : '',
      ctaText: banner.ctaText || 'Shop Now',
      badge: banner.badge || '',
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
      status: banner.status || 'PUBLISHED',
      targetType: banner.targetType || 'CATEGORY',
      isActive: banner.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Banner title is required.');
      return;
    }
    if (!formData.image.trim()) {
      showToast('error', 'Banner image is required.');
      return;
    }

    const effectiveLink = formData.link === 'CUSTOM' ? formData.customLink || '/shop' : formData.link;

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        link: effectiveLink,
      };

      if (editingBanner) {
        await adminService.updateBanner(editingBanner.id, payload);
        showToast('success', `Banner "${formData.title}" updated successfully.`);
      } else {
        await adminService.createBanner(payload);
        showToast('success', `Banner "${formData.title}" published successfully.`);
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err) {
      showToast('error', err.message || 'Failed to save banner.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete banner "${title}"?`)) {
      return;
    }
    try {
      await adminService.deleteBanner(id);
      showToast('success', `Banner "${title}" deleted.`);
      loadBanners();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete banner.');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const [moved] = newBanners.splice(index, 1);
    newBanners.splice(targetIndex, 0, moved);

    const bannerOrders = newBanners.map((b, idx) => ({
      id: b.id,
      displayOrder: idx + 1,
    }));

    setBanners(newBanners);

    try {
      await adminService.reorderBanners(bannerOrders);
      showToast('success', 'Banner order updated on homepage.');
    } catch (err) {
      showToast('error', 'Failed to save banner order.');
      loadBanners();
    }
  };

  const handleCropComplete = (uploadedUrl) => {
    if (cropTargetField === 'mobileImage') {
      setFormData((prev) => ({ ...prev, mobileImage: uploadedUrl }));
    } else {
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
    }
    showToast('success', 'Cropped image uploaded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-stone-900 border border-stone-800 rounded-3xl">
        <div>
          <h2 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-luxury-accent" />
            Hero Banners & Promotional Graphics
          </h2>
          <p className="text-xs text-stone-400">
            Control full-width hero slideshows, call-to-actions, scheduling, and device image cropping for the customer homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-glow self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Hero Banner
        </button>
      </div>

      {/* Banners Grid / List */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-luxury-accent" />
          <span className="text-xs font-bold">Loading Banners...</span>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 bg-stone-900 border border-stone-800 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">No Banners Found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Upload your first hero slideshow banner to showcase new slipper collections and festival sales.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl"
          >
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`p-4 sm:p-5 bg-stone-900 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                banner.isActive ? 'border-stone-800' : 'border-stone-800/50 opacity-60'
              }`}
            >
              {/* Left Info & Thumbnail */}
              <div className="flex items-center gap-4">
                {/* Order Index & Buttons */}
                <div className="flex flex-col items-center justify-center gap-1 bg-stone-950 p-1.5 rounded-xl border border-stone-800">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    className="p-1 text-stone-400 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono font-black text-luxury-accent">{idx + 1}</span>
                  <button
                    type="button"
                    disabled={idx === banners.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1 text-stone-400 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Banner Thumbnail */}
                <div className="w-28 sm:w-36 aspect-[16/9] rounded-xl bg-stone-950 border border-stone-800 overflow-hidden shrink-0 relative group">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  {banner.badge && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/80 text-luxury-accent text-[9px] font-black rounded backdrop-blur-xs">
                      {banner.badge}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-black text-base text-white">{banner.title}</h3>
                    {banner.status && STATUS_BADGES[banner.status] && (
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${STATUS_BADGES[banner.status].bg}`}
                      >
                        {STATUS_BADGES[banner.status].label}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        banner.isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {banner.isActive ? 'Live' : 'Hidden'}
                    </span>
                  </div>

                  {banner.subtitle && <p className="text-xs text-stone-400 mt-0.5">{banner.subtitle}</p>}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 mt-2">
                    <span className="flex items-center gap-1 text-luxury-accent">
                      <ExternalLink className="w-3 h-3" />
                      <span>CTA: "{banner.ctaText || 'Shop Now'}" &rarr; {banner.link}</span>
                    </span>

                    {(banner.startDate || banner.endDate) && (
                      <span className="flex items-center gap-1 text-stone-500 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>
                          {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Immediate'} &rarr;{' '}
                          {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Always Active'}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(banner)}
                  className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                  title="Edit Banner"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteBanner(banner.id, banner.title)}
                  className="p-2 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-2xl rounded-3xl p-6 shadow-2xl z-10 my-auto animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="font-display font-black text-base text-white">
                {editingBanner ? `Edit Banner: ${editingBanner.title}` : 'Add New Hero Banner'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Banner Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Cloud Slides Collection"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Limited Slipper Drop 🔥"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-luxury-accent outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Subtitle / Marketing Description</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Handcrafted orthopedic comfort slippers engineered for effortless daily luxury."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-luxury-accent outline-none"
                />
              </div>

              {/* Banner Image with 1:1 / Wide Interactive Crop */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-400 font-bold uppercase">Desktop Banner Image URL *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCropTargetField('image');
                      setCropModalOpen(true);
                    }}
                    className="text-[11px] text-luxury-accent font-bold hover:underline flex items-center gap-1"
                  >
                    <Crop className="w-3.5 h-3.5" /> Crop Photo from Gallery
                  </button>
                </div>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-luxury-accent outline-none font-mono text-[11px]"
                />
                {formData.image && (
                  <div className="mt-2 w-full h-32 rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Call-to-Action Link & Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="Shop Comfort Slides"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Destination Target</label>
                  <select
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  >
                    {DESTINATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.link === 'CUSTOM' && (
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Custom Destination URL</label>
                  <input
                    type="text"
                    value={formData.customLink}
                    onChange={(e) => setFormData({ ...formData, customLink: e.target.value })}
                    placeholder="/shop?brand=aurasole or https://..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                  />
                </div>
              )}

              {/* Scheduling Start & End Timestamps */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Calendar className="w-4 h-4 text-luxury-accent" />
                  <span>Banner Live Schedule & Auto-Expiry</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 font-bold uppercase mb-1">
                      Start Date & Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 font-bold uppercase mb-1">
                      End Date & Time (Auto-Expiry)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Active Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Publishing Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="PUBLISHED">Published (Live)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded bg-stone-950 border-stone-700 text-luxury-accent focus:ring-0"
                    />
                    <span className="font-bold text-white">Active on Storefront</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-luxury-accent text-stone-950 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-amber-400 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingBanner ? 'Save Banner Changes' : 'Publish Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {cropModalOpen && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          folder="slipper-store/banners"
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default AdminBannerManager;
