import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Image, Sparkles, X, Loader2 } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminCategoryManager = ({ categories = [], onRefresh, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800',
    displayOrder: 0,
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800',
      displayOrder: cat.displayOrder ?? 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Category name is required.');
      return;
    }

    setIsLoading(true);
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
        showToast('success', `Category "${formData.name}" updated successfully.`);
      } else {
        await adminService.createCategory(formData);
        showToast('success', `Category "${formData.name}" created successfully.`);
      }
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to save category.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsLoading(true);
    try {
      await adminService.deleteCategory(categoryToDelete.id);
      showToast('success', `Category "${categoryToDelete.name}" deleted.`);
      setCategoryToDelete(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete category.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/80 border border-stone-800 p-6 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-luxury-accent/20 border border-luxury-accent/40 text-luxury-accent flex items-center justify-center shrink-0">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl text-white">Slipper Category Architecture</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Organize footwear collections (e.g. Ergonomic Orthotic, Leather Luxury, Everyday Slides, Beach Wear).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-2xl shadow-glow transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group relative bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden hover:border-luxury-accent/50 transition-all flex flex-col justify-between"
          >
            {/* Image Preview & Badge */}
            <div className="aspect-[16/9] w-full bg-stone-950 relative overflow-hidden">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />

              <span
                className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                  cat.isActive
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'bg-stone-950/80 text-stone-400 border-stone-800'
                }`}
              >
                {cat.isActive ? 'Active' : 'Disabled'}
              </span>

              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[10px] font-mono text-luxury-accent font-bold uppercase tracking-widest block">
                  Slug: /{cat.slug}
                </span>
                <h3 className="font-display font-black text-lg text-white drop-shadow-md">{cat.name}</h3>
              </div>
            </div>

            {/* Content & Actions */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-stone-400 line-clamp-2">
                {cat.description || 'Premium handcrafted footwear collection engineered for pure comfort.'}
              </p>

              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-mono text-[11px]">Order: #{cat.displayOrder || 0}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 text-rose-400 hover:text-rose-200 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-stone-900 border border-stone-800 text-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-luxury-accent" />
                <h3 className="font-display font-black text-lg text-white">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Memory Foam Comfort"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Custom Slug (Optional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="memory-foam-comfort"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-luxury-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Category Banner Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-luxury-accent outline-none"
                />
                {formData.image && (
                  <div className="mt-2 aspect-[16/6] rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this slipper line for your storefront..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-accent" />
                  </label>
                  <span className="text-xs font-bold text-stone-300">Active in Storefront</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-glow transition-all flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? 'Save Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCategoryToDelete(null)} />
          <div className="relative bg-stone-900 border border-rose-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-lg text-white">Delete Category?</h3>
            <p className="text-xs text-stone-400">
              Are you sure you want to delete <strong className="text-white">{categoryToDelete.name}</strong>? Any products linked to this category will remain, but category filtering will be removed.
            </p>
            <div className="pt-3 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryManager;
