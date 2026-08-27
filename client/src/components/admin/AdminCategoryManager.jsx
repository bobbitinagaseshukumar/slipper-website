import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Folder,
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
  RefreshCw,
} from 'lucide-react';
import adminService from '../../services/adminService';
import ImageCropModal from './ImageCropModal';

const STATUS_BADGES = {
  PUBLISHED: { label: 'Published', bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800' },
  DRAFT: { label: 'Draft', bg: 'bg-amber-950/80 text-amber-400 border-amber-800' },
  UNPUBLISHED: { label: 'Unpublished', bg: 'bg-stone-800 text-stone-400 border-stone-700' },
  ARCHIVED: { label: 'Archived', bg: 'bg-rose-950/80 text-rose-400 border-rose-800' },
};

const AdminCategoryManager = ({ showToast }) => {
  const [activeView, setActiveView] = useState('categories'); // 'categories' | 'subcategories'
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedParentFilter, setSelectedParentFilter] = useState('ALL');

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Subcategory Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState(null);
  const [previewType, setPreviewType] = useState('category'); // 'category' | 'subcategory'

  // Image Cropping Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState('category'); // 'category' | 'subcategory'

  // Delete Safety Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'category'|'subcategory', item: obj }

  // Category Form State
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    imageAlt: '',
    status: 'PUBLISHED',
    displayOrder: 1,
    showOnHomepage: true,
    seoTitle: '',
    seoDescription: '',
    isActive: true,
  });

  // Subcategory Form State
  const [subForm, setSubForm] = useState({
    categoryId: '',
    name: '',
    slug: '',
    description: '',
    image: '',
    imageAlt: '',
    status: 'PUBLISHED',
    displayOrder: 1,
    showOnHomepage: false,
    seoTitle: '',
    seoDescription: '',
    isActive: true,
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [catsRes, subsRes] = await Promise.all([
        adminService.getCategories(),
        adminService.getSubCategories(),
      ]);

      if (catsRes?.data) setCategories(catsRes.data);
      if (subsRes?.data) setSubcategories(subsRes.data);
    } catch (err) {
      console.error('Failed to load categories/subcategories:', err);
      showToast('error', 'Failed to load category data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category Actions
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatForm({
      name: '',
      slug: '',
      description: '',
      image: '',
      imageAlt: '',
      status: 'PUBLISHED',
      displayOrder: categories.length + 1,
      showOnHomepage: true,
      seoTitle: '',
      seoDescription: '',
      isActive: true,
    });
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      imageAlt: cat.imageAlt || cat.name || '',
      status: cat.status || (cat.isActive ? 'PUBLISHED' : 'DRAFT'),
      displayOrder: cat.displayOrder ?? 1,
      showOnHomepage: cat.showOnHomepage ?? true,
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      isActive: cat.isActive ?? true,
    });
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      showToast('error', 'Category name is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, catForm);
        showToast('success', `Category "${catForm.name}" updated successfully.`);
      } else {
        await adminService.createCategory(catForm);
        showToast('success', `Category "${catForm.name}" created successfully.`);
      }
      setIsCatModalOpen(false);
      loadData();
    } catch (err) {
      showToast('error', err.message || 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  // Subcategory Actions
  const handleOpenAddSubcategory = (preselectedCatId = '') => {
    setEditingSubcategory(null);
    setSubForm({
      categoryId: preselectedCatId || categories[0]?.id || '',
      name: '',
      slug: '',
      description: '',
      image: '',
      imageAlt: '',
      status: 'PUBLISHED',
      displayOrder: subcategories.length + 1,
      showOnHomepage: false,
      seoTitle: '',
      seoDescription: '',
      isActive: true,
    });
    setIsSubModalOpen(true);
  };

  const handleOpenEditSubcategory = (sub) => {
    setEditingSubcategory(sub);
    setSubForm({
      categoryId: sub.categoryId || '',
      name: sub.name || '',
      slug: sub.slug || '',
      description: sub.description || '',
      image: sub.image || '',
      imageAlt: sub.imageAlt || sub.name || '',
      status: sub.status || (sub.isActive ? 'PUBLISHED' : 'DRAFT'),
      displayOrder: sub.displayOrder ?? 1,
      showOnHomepage: sub.showOnHomepage ?? false,
      seoTitle: sub.seoTitle || '',
      seoDescription: sub.seoDescription || '',
      isActive: sub.isActive ?? true,
    });
    setIsSubModalOpen(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim() || !subForm.categoryId) {
      showToast('error', 'Parent Category and Subcategory Name are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSubcategory) {
        await adminService.updateSubCategory(editingSubcategory.id, subForm);
        showToast('success', `Subcategory "${subForm.name}" updated successfully.`);
      } else {
        await adminService.createSubCategory(subForm);
        showToast('success', `Subcategory "${subForm.name}" created successfully.`);
      }
      setIsSubModalOpen(false);
      loadData();
    } catch (err) {
      showToast('error', err.message || 'Failed to save subcategory.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder Categories
  const handleMoveCategory = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCats = [...categories];
    const [moved] = newCats.splice(index, 1);
    newCats.splice(targetIndex, 0, moved);

    const orders = newCats.map((c, idx) => ({ id: c.id, displayOrder: idx + 1 }));
    setCategories(newCats);

    try {
      await adminService.reorderCategories(orders);
      showToast('success', 'Category order updated.');
    } catch (err) {
      showToast('error', 'Failed to save category order.');
      loadData();
    }
  };

  // Delete Handlers with Safety Check
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);

    try {
      if (deleteTarget.type === 'category') {
        await adminService.deleteCategory(deleteTarget.item.id, true);
        showToast('success', `Category "${deleteTarget.item.name}" deleted.`);
      } else {
        await adminService.deleteSubCategory(deleteTarget.item.id, true);
        showToast('success', `Subcategory "${deleteTarget.item.name}" deleted.`);
      }
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete item.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Lists
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSubcategories = subcategories.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesParent = selectedParentFilter === 'ALL' || s.categoryId === selectedParentFilter;
    return matchesSearch && matchesStatus && matchesParent;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-stone-900 border border-stone-800 rounded-3xl">
        <div>
          <h2 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-luxury-accent" />
            Category & Subcategory Architecture
          </h2>
          <p className="text-xs text-stone-400">
            Control exact slipper categories, subcategories, device-uploaded images, 1:1 square crop, status, and customer navigation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeView === 'categories' ? (
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="px-4 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-glow"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenAddSubcategory()}
              className="px-4 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-glow"
            >
              <Plus className="w-4 h-4" /> Add Subcategory
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800/80 p-4 rounded-2xl">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-xl border border-stone-800 self-start">
          <button
            type="button"
            onClick={() => setActiveView('categories')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeView === 'categories'
                ? 'bg-luxury-accent text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('subcategories')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeView === 'subcategories'
                ? 'bg-luxury-accent text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Subcategories ({subcategories.length})
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or slug..."
              className="bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-600 focus:border-luxury-accent outline-none w-48 sm:w-64"
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

          {/* Parent Category Filter for Subcategories View */}
          {activeView === 'subcategories' && (
            <select
              value={selectedParentFilter}
              onChange={(e) => setSelectedParentFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-luxury-accent outline-none font-bold"
            >
              <option value="ALL">All Parent Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Content View */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-luxury-accent" />
          <span className="text-xs font-bold">Loading Taxonomy...</span>
        </div>
      ) : activeView === 'categories' ? (
        /* CATEGORIES TABLE / CARDS */
        <div className="space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="p-12 bg-stone-900 border border-stone-800 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
                <FolderTree className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">No Categories Found</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Create your first slipper category (e.g. Men's Slippers, Women's Slides, Orthopedic Comfort).
              </p>
              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="px-4 py-2 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl"
              >
                + Add Category
              </button>
            </div>
          ) : (
            filteredCategories.map((cat, idx) => {
              const statusCfg = STATUS_BADGES[cat.status] || STATUS_BADGES.PUBLISHED;

              return (
                <div
                  key={cat.id}
                  className="p-4 sm:p-5 bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  {/* Left Info */}
                  <div className="flex items-center gap-4">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col items-center justify-center gap-1 bg-stone-950 p-1.5 rounded-xl border border-stone-800">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveCategory(idx, -1)}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono font-black text-luxury-accent">{cat.displayOrder || idx + 1}</span>
                      <button
                        type="button"
                        disabled={idx === filteredCategories.length - 1}
                        onClick={() => handleMoveCategory(idx, 1)}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category Image (Admin Uploaded only) */}
                    <div className="w-16 h-16 rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <FolderTree className="w-6 h-6 text-stone-700" />
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-black text-base text-white">{cat.name}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.bg}`}>
                          {statusCfg.label}
                        </span>
                        {cat.showOnHomepage && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-400 border border-blue-800">
                            Homepage
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                        {cat.description || `Slug: /category/${cat.slug}`}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-stone-500 mt-1">
                        <span>{cat.subCategories?.length || 0} Subcategories</span>
                        <span>•</span>
                        <span>{cat._count?.products || 0} Slippers Assigned</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewItem(cat);
                        setPreviewType('category');
                      }}
                      className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                      title="Preview Category"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAddSubcategory(cat.id)}
                      className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-luxury-accent font-bold text-xs rounded-xl flex items-center gap-1 border border-stone-700 transition-colors"
                      title="Add Subcategory under this Category"
                    >
                      <Plus className="w-3.5 h-3.5" /> Subcategory
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditCategory(cat)}
                      className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'category', item: cat })}
                      className="p-2 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* SUBCATEGORIES TABLE / CARDS */
        <div className="space-y-3">
          {filteredSubcategories.length === 0 ? (
            <div className="p-12 bg-stone-900 border border-stone-800 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">No Subcategories Found</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Add subcategories (e.g. Ergonomic Slides, Classic Flip Flops, Luxury Leather) under parent categories.
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddSubcategory()}
                className="px-4 py-2 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl"
              >
                + Add Subcategory
              </button>
            </div>
          ) : (
            filteredSubcategories.map((sub) => {
              const statusCfg = STATUS_BADGES[sub.status] || STATUS_BADGES.PUBLISHED;

              return (
                <div
                  key={sub.id}
                  className="p-4 sm:p-5 bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Subcategory Image (Admin Uploaded) */}
                    <div className="w-14 h-14 rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                      ) : (
                        <Folder className="w-5 h-5 text-stone-700" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-black text-base text-white">{sub.name}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.bg}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        <span className="font-bold text-luxury-accent">Parent: {sub.category?.name || 'Category'}</span>
                        <span>•</span>
                        <span className="font-mono text-stone-500">/category/{sub.category?.slug}/{sub.slug}</span>
                      </div>

                      <div className="text-[11px] font-mono text-stone-500 mt-1">
                        {sub._count?.products || 0} Slippers Assigned
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewItem(sub);
                        setPreviewType('subcategory');
                      }}
                      className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                      title="Preview Subcategory"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditSubcategory(sub)}
                      className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                      title="Edit Subcategory"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'subcategory', item: sub })}
                      className="p-2 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Delete Subcategory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsCatModalOpen(false)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-2xl rounded-3xl p-6 shadow-2xl z-10 my-auto animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="font-display font-black text-base text-white">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Slipper Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    placeholder="e.g. Men's Slippers, Women's Slides"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Publishing Status *</label>
                  <select
                    value={catForm.status}
                    onChange={(e) => setCatForm({ ...catForm, status: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  >
                    <option value="PUBLISHED">Published (Visible to Customers)</option>
                    <option value="DRAFT">Draft (Admin Only)</option>
                    <option value="UNPUBLISHED">Unpublished (Hidden)</option>
                    <option value="ARCHIVED">Archived (Safe Storage)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Description / Tagline</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="e.g. Handcrafted ergonomic slippers engineered for cloud-like daily comfort."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-luxury-accent outline-none"
                />
              </div>

              {/* Category Image Upload with 1:1 Square Crop (MANDATORY) */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-stone-300 font-bold uppercase block">
                      Category Image (1:1 Square Crop) *
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Upload directly from phone or desktop gallery.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCropTarget('category');
                      setCropModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-glow"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>{catForm.image ? 'Replace & Crop Photo' : 'Upload from Gallery'}</span>
                  </button>
                </div>

                {catForm.image && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-20 h-20 rounded-2xl bg-stone-900 border border-stone-700 overflow-hidden shrink-0">
                      <img src={catForm.image} alt="Category" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] space-y-1">
                      <span className="text-emerald-400 font-bold block">✓ Square cropped image ready</span>
                      <button
                        type="button"
                        onClick={() => setCatForm({ ...catForm, image: '' })}
                        className="text-rose-400 hover:underline font-bold"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Order & Homepage Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={catForm.displayOrder}
                    onChange={(e) => setCatForm({ ...catForm, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catForm.showOnHomepage}
                      onChange={(e) => setCatForm({ ...catForm, showOnHomepage: e.target.checked })}
                      className="rounded bg-stone-950 border-stone-700 text-luxury-accent focus:ring-0"
                    />
                    <span className="font-bold text-white">Show Category on Customer Homepage</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
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
                  {editingCategory ? 'Update Category' : 'Save & Publish Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SUBCATEGORY MODAL */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsSubModalOpen(false)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-2xl rounded-3xl p-6 shadow-2xl z-10 my-auto animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="font-display font-black text-base text-white">
                {editingSubcategory ? `Edit Subcategory: ${editingSubcategory.name}` : 'Add New Slipper Subcategory'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSubModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Parent Category *</label>
                  <select
                    required
                    value={subForm.categoryId}
                    onChange={(e) => setSubForm({ ...subForm, categoryId: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  >
                    <option value="">Select Parent Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Subcategory Name *</label>
                  <input
                    type="text"
                    required
                    value={subForm.name}
                    onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                    placeholder="e.g. Ergonomic Slides, Flip Flops, Luxury Leather"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Publishing Status *</label>
                <select
                  value={subForm.status}
                  onChange={(e) => setSubForm({ ...subForm, status: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                >
                  <option value="PUBLISHED">Published (Visible when Parent Category is Published)</option>
                  <option value="DRAFT">Draft (Admin Only)</option>
                  <option value="UNPUBLISHED">Unpublished (Hidden)</option>
                  <option value="ARCHIVED">Archived (Safe Storage)</option>
                </select>
              </div>

              {/* Subcategory Image Upload with 1:1 Square Crop */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-stone-300 font-bold uppercase block">
                      Subcategory Image (1:1 Square Crop)
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Upload directly from phone or desktop gallery.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCropTarget('subcategory');
                      setCropModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-glow"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>{subForm.image ? 'Replace & Crop Photo' : 'Upload from Gallery'}</span>
                  </button>
                </div>

                {subForm.image && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-20 h-20 rounded-2xl bg-stone-900 border border-stone-700 overflow-hidden shrink-0">
                      <img src={subForm.image} alt="Subcategory" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] space-y-1">
                      <span className="text-emerald-400 font-bold block">✓ Square cropped image ready</span>
                      <button
                        type="button"
                        onClick={() => setSubForm({ ...subForm, image: '' })}
                        className="text-rose-400 hover:underline font-bold"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
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
                  {editingSubcategory ? 'Update Subcategory' : 'Save & Publish Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE CUSTOMER STOREFRONT PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setPreviewItem(null)} />

          <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 my-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <span className="text-xs font-bold text-luxury-accent uppercase">
                Customer Storefront Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 flex flex-col items-center">
              {/* Customer 3D Card Simulation */}
              <div className="w-64 rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl aspect-[4/5] flex flex-col justify-between p-5 relative group">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center">
                  {previewItem.image ? (
                    <img src={previewItem.image} alt={previewItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <FolderTree className="w-12 h-12 text-stone-700" />
                  )}
                </div>

                <div className="pt-3">
                  <h4 className="font-display font-black text-lg text-white">{previewItem.name}</h4>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {previewType === 'category' ? `${previewItem._count?.products || 0} Slippers` : 'Subcategory'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
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
              <h3 className="font-display font-black text-lg text-white">
                Delete {deleteTarget.type === 'category' ? 'Category' : 'Subcategory'}?
              </h3>
              <p className="text-xs text-stone-400">
                Are you sure you want to delete <strong className="text-white">"{deleteTarget.item.name}"</strong>?
              </p>
              <p className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl mt-2">
                Tip: If this {deleteTarget.type} contains slippers, you can archive or unpublish it to keep product relationships safe.
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
                type="button"
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
          if (cropTarget === 'category') {
            setCatForm((prev) => ({ ...prev, image: croppedObj.url }));
          } else {
            setSubForm((prev) => ({ ...prev, image: croppedObj.url }));
          }
          showToast('success', '1:1 Square cropped image applied!');
        }}
        folder={cropTarget === 'category' ? 'slipper-store/categories' : 'slipper-store/subcategories'}
      />
    </div>
  );
};

export default AdminCategoryManager;
