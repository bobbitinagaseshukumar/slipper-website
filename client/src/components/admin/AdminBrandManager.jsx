import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  X,
  Loader2,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Eye,
  Crop,
  Layers,
  Package,
  Check,
  Globe,
  Archive,
  Building2,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import adminService from '../../services/adminService';
import ImageCropModal from './ImageCropModal';

const STATUS_BADGES = {
  PUBLISHED: { label: 'Published', bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800' },
  DRAFT: { label: 'Draft', bg: 'bg-amber-950/80 text-amber-400 border-amber-800' },
  UNPUBLISHED: { label: 'Unpublished', bg: 'bg-stone-800 text-stone-400 border-stone-700' },
  ARCHIVED: { label: 'Archived', bg: 'bg-rose-950/80 text-rose-400 border-rose-800' },
};

const BRANDING_TYPE_BADGES = {
  NORMAL: { label: 'Normal Branding', bg: 'bg-stone-800 text-stone-300 border-stone-700' },
  COMPANY: { label: 'Company Branding', bg: 'bg-luxury-accent/20 text-luxury-accent border-luxury-accent/40' },
};

const AdminBrandManager = ({ showToast }) => {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [brandingTypeFilter, setBrandingTypeFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Product List Modal for selected brand
  const [selectedBrandForProducts, setSelectedBrandForProducts] = useState(null);
  const [brandProducts, setBrandProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Live Preview Modal
  const [previewBrand, setPreviewBrand] = useState(null);

  // Image Crop Modal
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // Delete Safety Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Brand Form Data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    imageAlt: '',
    brandingType: 'NORMAL', // 'NORMAL' | 'COMPANY'
    status: 'PUBLISHED',
    displayOrder: 1,
    showOnHomepage: true,
    showInSearch: true,
    showInFilter: true,
    seoTitle: '',
    seoDescription: '',
    isActive: true,
  });

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getBrands();
      if (res?.data) setBrands(res.data);
    } catch (err) {
      console.error('Failed to load brands:', err);
      showToast('error', 'Failed to load brand catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      imageAlt: '',
      brandingType: 'NORMAL',
      status: 'PUBLISHED',
      displayOrder: brands.length + 1,
      showOnHomepage: true,
      showInSearch: true,
      showInFilter: true,
      seoTitle: '',
      seoDescription: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      slug: brand.slug || '',
      description: brand.description || '',
      image: brand.image || '',
      imageAlt: brand.imageAlt || brand.name || '',
      brandingType: brand.brandingType || 'NORMAL',
      status: brand.status || (brand.isActive ? 'PUBLISHED' : 'DRAFT'),
      displayOrder: brand.displayOrder ?? 1,
      showOnHomepage: brand.showOnHomepage ?? true,
      showInSearch: brand.showInSearch ?? true,
      showInFilter: brand.showInFilter ?? true,
      seoTitle: brand.seoTitle || '',
      seoDescription: brand.seoDescription || '',
      isActive: brand.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Brand name is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingBrand) {
        await adminService.updateBrand(editingBrand.id, formData);
        showToast('success', `Brand "${formData.name}" updated successfully.`);
      } else {
        await adminService.createBrand(formData);
        showToast('success', `Brand "${formData.name}" created successfully.`);
      }
      setIsModalOpen(false);
      loadBrands();
    } catch (err) {
      showToast('error', err.message || 'Failed to save brand.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveBrand = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= brands.length) return;

    const newBrands = [...brands];
    const [moved] = newBrands.splice(index, 1);
    newBrands.splice(targetIndex, 0, moved);

    const orders = newBrands.map((b, idx) => ({ id: b.id, displayOrder: idx + 1 }));
    setBrands(newBrands);

    try {
      await adminService.reorderBrands(orders);
      showToast('success', 'Brand display order updated.');
    } catch (err) {
      showToast('error', 'Failed to save brand order.');
      loadBrands();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);

    try {
      await adminService.deleteBrand(deleteTarget.id, true);
      showToast('success', `Brand "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      loadBrands();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete brand.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewProducts = async (brand) => {
    setSelectedBrandForProducts(brand);
    setIsLoadingProducts(true);
    try {
      const res = await adminService.getBrandProducts(brand.id);
      if (res?.data) setBrandProducts(res.data);
    } catch (err) {
      showToast('error', 'Failed to fetch brand slippers.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Filtered List
  const filteredBrands = brands.filter((b) => {
    const matchesSearch =
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesBrandingType = brandingTypeFilter === 'ALL' || b.brandingType === brandingTypeFilter;
    return matchesSearch && matchesStatus && matchesBrandingType;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-stone-900 border border-stone-800 rounded-3xl">
        <div>
          <h2 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-luxury-accent" />
            Brand Management & Architecture
          </h2>
          <p className="text-xs text-stone-400">
            Organize slipper brands with distinct Normal vs Company Branding, device-uploaded logos, 1:1 square crop, and homepage discovery.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-glow self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-400">Total Brands:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-stone-950 border border-stone-800 text-white font-mono text-xs font-black">
            {brands.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands by name or slug..."
              className="bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-600 focus:border-luxury-accent outline-none w-48 sm:w-60"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-luxury-accent outline-none font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Draft</option>
            <option value="UNPUBLISHED">Unpublished</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Branding Type Filter */}
          <select
            value={brandingTypeFilter}
            onChange={(e) => setBrandingTypeFilter(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-luxury-accent outline-none font-bold"
          >
            <option value="ALL">All Branding Types</option>
            <option value="NORMAL">Normal Branding</option>
            <option value="COMPANY">Company Branding</option>
          </select>
        </div>
      </div>

      {/* Brands List */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-luxury-accent" />
          <span className="text-xs font-bold">Loading Brand Catalog...</span>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="p-12 bg-stone-900 border border-stone-800 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">No Brands Found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Create brands (e.g. AuraSole Signature, OrthoWalk, SoleFlex) to categorize your slippers.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl"
          >
            + Add Brand
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBrands.map((b, idx) => {
            const statusCfg = STATUS_BADGES[b.status] || STATUS_BADGES.PUBLISHED;
            const brandingTypeCfg = BRANDING_TYPE_BADGES[b.brandingType] || BRANDING_TYPE_BADGES.NORMAL;

            return (
              <div
                key={b.id}
                className="p-4 sm:p-5 bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                {/* Left Info */}
                <div className="flex items-center gap-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col items-center justify-center gap-1 bg-stone-950 p-1.5 rounded-xl border border-stone-800">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveBrand(idx, -1)}
                      className="p-1 text-stone-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-black text-luxury-accent">{b.displayOrder || idx + 1}</span>
                    <button
                      type="button"
                      disabled={idx === filteredBrands.length - 1}
                      onClick={() => handleMoveBrand(idx, 1)}
                      className="p-1 text-stone-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Brand Logo (Admin Uploaded) */}
                  <div className="w-16 h-16 rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    {b.image ? (
                      <img src={b.image} alt={b.name} className="w-full h-full object-contain" />
                    ) : (
                      <Tag className="w-6 h-6 text-stone-700" />
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-black text-base text-white">{b.name}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${brandingTypeCfg.bg}`}>
                        {brandingTypeCfg.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.bg}`}>
                        {statusCfg.label}
                      </span>
                      {b.showOnHomepage && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-400 border border-blue-800">
                          Homepage
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                      {b.description || `Slug: /brand/${b.slug}`}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-stone-500 mt-1">
                      <button
                        type="button"
                        onClick={() => handleViewProducts(b)}
                        className="text-luxury-accent hover:underline font-bold"
                      >
                        {b._count?.products || 0} Slippers Assigned →
                      </button>
                      <span>•</span>
                      <span>{b.showInFilter ? 'In Filter' : 'Hidden from Filter'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => setPreviewBrand(b)}
                    className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                    title="Live Customer Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                    title="Edit Brand"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(b)}
                    className="p-2 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT BRAND MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-2xl rounded-3xl p-6 shadow-2xl z-10 my-auto animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="font-display font-black text-base text-white">
                {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Footwear Brand'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. AuraSole Signature, OrthoWalk"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Branding Type *</label>
                  <select
                    value={formData.brandingType}
                    onChange={(e) => setFormData({ ...formData, brandingType: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  >
                    <option value="NORMAL">Normal Branding (Standard Footwear Line)</option>
                    <option value="COMPANY">Company Branding (Flagship Corporate Brand)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Publishing Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                >
                  <option value="PUBLISHED">Published (Visible to Customers)</option>
                  <option value="DRAFT">Draft (Admin Only)</option>
                  <option value="UNPUBLISHED">Unpublished (Hidden)</option>
                  <option value="ARCHIVED">Archived (Safe Storage)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Description / Tagline</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Premium handcrafted luxury comfort slides and medical-grade home slippers."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-luxury-accent outline-none"
                />
              </div>

              {/* Brand Logo Upload with 1:1 Square Crop */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-stone-300 font-bold uppercase block">
                      Brand Logo / Image (1:1 Square Crop)
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Upload directly from phone or desktop gallery.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCropModalOpen(true)}
                    className="px-3 py-1.5 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-glow"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>{formData.image ? 'Replace & Crop Logo' : 'Upload from Gallery'}</span>
                  </button>
                </div>

                {formData.image && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-20 h-20 rounded-2xl bg-stone-900 border border-stone-700 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                      <img src={formData.image} alt="Brand" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-[11px] space-y-1">
                      <span className="text-emerald-400 font-bold block">✓ Square cropped brand logo ready</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="text-rose-400 hover:underline font-bold"
                      >
                        Remove Logo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Discovery & Navigation Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-stone-950 border border-stone-800 rounded-2xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage}
                    onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-luxury-accent focus:ring-0"
                  />
                  <span className="font-bold text-white">Show on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showInSearch}
                    onChange={(e) => setFormData({ ...formData, showInSearch: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-luxury-accent focus:ring-0"
                  />
                  <span className="font-bold text-white">Show in Search Autocomplete</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showInFilter}
                    onChange={(e) => setFormData({ ...formData, showInFilter: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-luxury-accent focus:ring-0"
                  />
                  <span className="font-bold text-white">Show in Shop Sidebar Filters</span>
                </label>
              </div>

              {/* Display Order */}
              <div className="w-48">
                <label className="block text-stone-400 font-bold uppercase mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono"
                />
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
                  className="px-6 py-2 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-glow flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingBrand ? 'Update Brand' : 'Save & Publish Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRAND PRODUCTS MODAL */}
      {selectedBrandForProducts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSelectedBrandForProducts(null)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-3xl rounded-3xl p-6 shadow-2xl z-10 my-auto animate-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 p-1 flex items-center justify-center">
                  {selectedBrandForProducts.image ? (
                    <img src={selectedBrandForProducts.image} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Tag className="w-5 h-5 text-luxury-accent" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white">
                    Slippers under "{selectedBrandForProducts.name}"
                  </h3>
                  <span className="text-xs text-stone-400">
                    {brandProducts.length} Slippers Assigned
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBrandForProducts(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingProducts ? (
              <div className="p-8 text-center text-stone-400 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-luxury-accent" />
                <span className="text-xs">Loading Assigned Slippers...</span>
              </div>
            ) : brandProducts.length === 0 ? (
              <div className="p-8 bg-stone-950 border border-stone-800 rounded-2xl text-center text-stone-400 text-xs">
                No products are currently assigned to this brand. You can assign this brand when uploading or editing slippers.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {brandProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-stone-950 border border-stone-800 rounded-2xl flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-stone-900 overflow-hidden shrink-0 flex items-center justify-center border border-stone-800">
                      {prod.images?.[0]?.url ? (
                        <img src={prod.images[0].url} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-stone-700" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-white truncate">{prod.name}</h4>
                      <p className="text-[11px] text-luxury-accent font-mono font-bold">₹{prod.price}</p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {prod.category?.name || 'Category'} {prod.subcategory?.name ? `• ${prod.subcategory.name}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIVE STOREFRONT PREVIEW MODAL */}
      {previewBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setPreviewBrand(null)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 my-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <span className="text-xs font-bold text-luxury-accent uppercase">
                Live Brand Card Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewBrand(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 flex flex-col items-center">
              {/* Customer 3D Brand Badge */}
              <div className="w-60 rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl p-5 flex flex-col items-center text-center relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center p-2 mb-3">
                  {previewBrand.image ? (
                    <img src={previewBrand.image} alt={previewBrand.name} className="w-full h-full object-contain" />
                  ) : (
                    <Tag className="w-10 h-10 text-stone-700" />
                  )}
                </div>

                <h4 className="font-display font-black text-lg text-white">{previewBrand.name}</h4>
                <span className="text-[10px] uppercase font-bold text-luxury-accent mt-1">
                  {previewBrand.brandingType === 'COMPANY' ? 'Company Branding' : 'Normal Branding'}
                </span>
                <p className="text-[11px] text-stone-400 font-mono mt-1">
                  {previewBrand._count?.products || 0} Slippers
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setPreviewBrand(null)}
                className="px-6 py-2 bg-stone-800 text-white font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION SAFETY MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setDeleteTarget(null)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-display font-black text-lg text-white">Delete Brand?</h3>
              <p className="text-xs text-stone-400">
                Are you sure you want to delete brand <strong className="text-white">"{deleteTarget.name}"</strong>?
              </p>
              <p className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl mt-2">
                Tip: You can archive or unpublish this brand to preserve assigned products while hiding it from customers.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1:1 SQUARE IMAGE CROP MODAL */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={(croppedObj) => {
          setFormData((prev) => ({ ...prev, image: croppedObj.url }));
          showToast('success', '1:1 Square cropped brand logo applied!');
        }}
        folder="slipper-store/brands"
      />
    </div>
  );
};

export default AdminBrandManager;
