import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Calendar,
  Clock,
  Search,
  Check,
  X,
  Package,
  Image as ImageIcon,
  Loader2,
  Tag,
  Flame,
  LayoutGrid,
  Eye,
  Crop,
} from 'lucide-react';
import adminService from '../../services/adminService';
import ImageCropModal from './ImageCropModal';

const SECTION_TYPES = [
  { value: 'FESTIVAL_SALE', label: 'Festival Slipper Sale' },
  { value: 'FLASH_SALE', label: 'Flash Sale (Limited Time)' },
  { value: 'NEW_ARRIVALS', label: 'New Slipper Arrivals' },
  { value: 'TRENDING', label: 'Trending Slipper Drops' },
  { value: 'MENS_COLLECTION', label: "Men's Curated Collection" },
  { value: 'WOMENS_COLLECTION', label: "Women's Comfort Collection" },
  { value: 'KIDS_COLLECTION', label: "Kids' Slipper Collection" },
  { value: 'SPECIAL_OFFER', label: 'Special Promotional Deals' },
  { value: 'CUSTOM', label: 'Custom Section' },
];

const AdminSectionManager = ({ showToast }) => {
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Product Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeSectionForAssign, setActiveSectionForAssign] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Banner Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // Section Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    type: 'FESTIVAL_SALE',
    bannerImage: '',
    badgeText: 'Festival Special',
    startDate: '',
    endDate: '',
    layout: 'GRID',
    productLimit: 12,
    sortMethod: 'MANUAL',
    isActive: true,
  });

  // Load sections and catalog products
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [secRes, prodRes] = await Promise.all([
        adminService.getSections(),
        adminService.getProducts({ limit: 100 }),
      ]);

      if (secRes?.data) setSections(secRes.data);
      if (prodRes?.data?.products) setProducts(prodRes.data.products);
    } catch (err) {
      console.error('Failed to load sections:', err);
      showToast('error', 'Failed to load homepage sections.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingSection(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      type: 'FESTIVAL_SALE',
      bannerImage: '',
      badgeText: 'Festival Special',
      startDate: '',
      endDate: '',
      layout: 'GRID',
      productLimit: 12,
      sortMethod: 'MANUAL',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sec) => {
    setEditingSection(sec);
    setFormData({
      title: sec.title || '',
      subtitle: sec.subtitle || '',
      description: sec.description || '',
      type: sec.type || 'FESTIVAL_SALE',
      bannerImage: sec.bannerImage || '',
      badgeText: sec.badgeText || '',
      startDate: sec.startDate ? new Date(sec.startDate).toISOString().slice(0, 16) : '',
      endDate: sec.endDate ? new Date(sec.endDate).toISOString().slice(0, 16) : '',
      layout: sec.layout || 'GRID',
      productLimit: sec.productLimit || 12,
      sortMethod: sec.sortMethod || 'MANUAL',
      isActive: sec.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Section title is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSection) {
        await adminService.updateSection(editingSection.id, formData);
        showToast('success', `Section "${formData.title}" updated.`);
      } else {
        await adminService.createSection(formData);
        showToast('success', `Section "${formData.title}" created successfully.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast('error', err.message || 'Failed to save section.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async (id, title) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title}"? Assigned products will remain safely in the catalog.`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteSection(id);
      showToast('success', `Section "${title}" deleted.`);
      loadData();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete section.');
    }
  };

  // Reorder Sections
  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const sectionOrders = newSections.map((sec, idx) => ({
      id: sec.id,
      displayOrder: idx + 1,
    }));

    setSections(newSections);

    try {
      await adminService.reorderSections(sectionOrders);
      showToast('success', 'Homepage layout order updated.');
    } catch (err) {
      showToast('error', 'Failed to save order.');
      loadData();
    }
  };

  // Product Assignment Handlers
  const handleOpenAssignModal = (sec) => {
    setActiveSectionForAssign(sec);
    const existingIds = sec.products?.map((p) => p.productId) || [];
    setSelectedProductIds(existingIds);
    setAssignModalOpen(true);
  };

  const handleToggleProductSelection = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSaveProductAssignment = async () => {
    if (!activeSectionForAssign) return;

    setIsSaving(true);
    try {
      await adminService.updateSection(activeSectionForAssign.id, {
        productIds: selectedProductIds,
      });
      showToast('success', `Assigned ${selectedProductIds.length} products to "${activeSectionForAssign.title}".`);
      setAssignModalOpen(false);
      loadData();
    } catch (err) {
      showToast('error', err.message || 'Failed to assign products.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProductsForAssign = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-stone-900 border border-stone-800 rounded-3xl">
        <div>
          <h2 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-luxury-accent" />
            Homepage Sections & Festival Campaigns
          </h2>
          <p className="text-xs text-stone-400">
            Control exact placement, festival countdowns, banners, and assigned slippers on the customer homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-glow self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Custom Section / Festival Sale
        </button>
      </div>

      {/* Sections List with Reordering */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-luxury-accent" />
          <span className="text-xs font-bold">Loading Homepage Layout...</span>
        </div>
      ) : sections.length === 0 ? (
        <div className="p-12 bg-stone-900 border border-stone-800 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">No Custom Sections Created Yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Create a Diwali sale, Sankranti drop, or featured showroom section to spotlight slippers dynamically on the customer homepage.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl"
          >
            Create First Section
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-4 sm:p-5 bg-stone-900 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                sec.isActive ? 'border-stone-800' : 'border-stone-800/50 opacity-60'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                {/* Order Index & Reorder Buttons */}
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
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1 text-stone-400 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Banner Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-stone-950 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {sec.bannerImage ? (
                    <img src={sec.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <Layers className="w-6 h-6 text-stone-700" />
                  )}
                </div>

                {/* Section Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-base text-white">{sec.title}</h3>
                    {sec.badgeText && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {sec.badgeText}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        sec.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {sec.isActive ? 'Live' : 'Hidden'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 mt-0.5">{sec.subtitle || sec.type}</p>

                  {/* Schedule Info */}
                  {(sec.startDate || sec.endDate) && (
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono mt-1">
                      <Clock className="w-3 h-3 text-luxury-accent" />
                      <span>
                        {sec.startDate ? new Date(sec.startDate).toLocaleDateString() : 'Now'} &rarr;{' '}
                        {sec.endDate ? new Date(sec.endDate).toLocaleDateString() : 'Permanent'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenAssignModal(sec)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-luxury-accent font-bold text-xs rounded-xl flex items-center gap-1.5 border border-stone-700 transition-colors"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Manage Slippers ({sec.products?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(sec)}
                  className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                  title="Edit Section"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteSection(sec.id, sec.title)}
                  className="p-2 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                  title="Delete Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Section Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-2xl rounded-3xl p-6 shadow-2xl z-10 my-auto animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="font-display font-black text-base text-white">
                {editingSection ? `Edit Section: ${editingSection.title}` : 'Create Homepage Section / Festival Sale'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Section Display Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Diwali Slipper Dhamaka"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Section Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  >
                    {SECTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Subtitle / Marketing Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Celebrate with 40% OFF handcrafted cloud slides & recovery footbeds."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-luxury-accent outline-none"
                />
              </div>

              {/* Banner Image & Cropping */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-400 font-bold uppercase">Section Banner Image</label>
                  <button
                    type="button"
                    onClick={() => setCropModalOpen(true)}
                    className="text-[11px] text-luxury-accent font-bold hover:underline flex items-center gap-1"
                  >
                    <Crop className="w-3.5 h-3.5" /> Crop Photo from Gallery
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-luxury-accent outline-none font-mono text-[11px]"
                />
              </div>

              {/* Schedule Timing (Start & End Date for Sale Countdowns) */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Calendar className="w-4 h-4 text-luxury-accent" />
                  <span>Campaign Schedule & Live Countdown Timer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 font-bold uppercase mb-1">
                      Sale Start Date & Time
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
                      Sale End Date & Time (Countdown)
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

              {/* Badge & Active State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Campaign Badge Text</label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="e.g. Diwali Special, 40% OFF"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded bg-stone-950 border-stone-700 text-luxury-accent focus:ring-0"
                    />
                    <span className="font-bold text-white">Display Section Live on Homepage</span>
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
                  className="px-6 py-2 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-glow flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSection ? 'Update Section' : 'Publish Section Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Assignment Modal */}
      {assignModalOpen && activeSectionForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setAssignModalOpen(false)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-3xl rounded-3xl p-6 shadow-2xl z-10 my-auto animate-in zoom-in-95 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 shrink-0">
              <div>
                <h3 className="font-display font-black text-base text-white">
                  Assign Slippers to "{activeSectionForAssign.title}"
                </h3>
                <p className="text-xs text-stone-400">
                  Select which slippers appear in this promotional section on the storefront.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="py-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search slippers by name, brand or category..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:border-luxury-accent outline-none"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 max-h-[50vh] no-scrollbar">
              {filteredProductsForAssign.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs">No matching slippers found.</div>
              ) : (
                filteredProductsForAssign.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleProductSelection(p.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-luxury-accent/15 border-luxury-accent/50 text-white'
                          : 'bg-stone-950 border-stone-800/80 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shrink-0">
                          {p.images?.[0]?.url ? (
                            <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 m-auto text-stone-600" />
                          )}
                        </div>

                        <div>
                          <span className="font-bold text-xs block text-white">{p.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            ₹{p.price} • {p.brand} • {p.category?.name || 'Slippers'}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-luxury-accent border-luxury-accent text-stone-950' : 'border-stone-700'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 font-black" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-stone-400 font-bold">
                {selectedProductIds.length} slippers selected
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProductAssignment}
                  disabled={isSaving}
                  className="px-6 py-2 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-glow"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Slippers to Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Cropping Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={(croppedObj) => {
          setFormData((prev) => ({ ...prev, bannerImage: croppedObj.url }));
          showToast('success', 'Banner photo cropped & set!');
        }}
        folder="slipper-store/banners"
      />
    </div>
  );
};

export default AdminSectionManager;
