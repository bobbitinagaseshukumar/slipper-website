import React, { useState, useEffect } from 'react';
import {
  Package,
  Sparkles,
  X,
  Plus,
  Trash2,
  Image,
  DollarSign,
  Layers,
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Shield,
} from 'lucide-react';
import adminService from '../../services/adminService';

const FOOTBED_MATERIALS = [
  'High-Density Ergonomic EVA',
  'Orthotic Memory Foam Cushion',
  'Genuine Italian Leather',
  'Natural Anatomical Cork',
  'AirSole Shock Absorbing Foam',
  'Soft Plush Home Velvet',
];

const SOLE_MATERIALS = [
  'Anti-Skid Textured Rubber',
  'Non-Slip Waterproof EVA',
  'Ergonomic AirSole Tread',
  'Indoor Hardwood-Safe Rubber',
];

const PRODUCT_TYPES = [
  'Slides',
  'Flip Flops',
  'Comfort Slippers',
  'Daily Wear',
  'Bathroom Slippers',
  'Orthopedic / Medical',
  'Home Slippers',
  'Leather Luxury',
];

const AdminProductModal = ({
  isOpen,
  onClose,
  editingProduct = null,
  categories = [],
  onSuccess,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: 'AuraSole',
    sku: '',
    categoryId: '',
    gender: 'UNISEX',
    productType: 'Slides',
    price: '',
    originalPrice: '',
    material: 'High-Density Ergonomic EVA',
    soleMaterial: 'Anti-Skid Textured Rubber',
    upperMaterial: 'Synthetic Luxury Leather',
    occasion: 'Casual Daily',
    comfortFeatures: 'Arch support, Memory foam cushion, Shock absorption',
    careInstructions: 'Wipe clean with a soft damp cloth. Avoid direct heat exposure.',
    description: '',
    isFeatured: false,
    isTrending: false,
    isNewArrival: true,
    isBestSeller: false,
    isActive: true,
    colorName: 'Obsidian Black',
    colorCode: '#1A1A1A',
    imageUrls: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800'],
    sizeStocks: {
      '6': 15,
      '7': 20,
      '8': 25,
      '9': 25,
      '10': 20,
      '11': 15,
      '12': 10,
    },
  });

  useEffect(() => {
    if (editingProduct) {
      const sizeObj = { '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 };
      if (editingProduct.variants?.length) {
        editingProduct.variants.forEach((v) => {
          if (v.size && sizeObj[v.size] !== undefined) {
            sizeObj[v.size] = v.stock;
          }
        });
      }

      setFormData({
        name: editingProduct.name || '',
        brand: editingProduct.brand || 'AuraSole',
        sku: editingProduct.sku || '',
        categoryId: editingProduct.categoryId || (categories[0]?.id || ''),
        gender: editingProduct.gender || 'UNISEX',
        productType: editingProduct.productType || 'Slides',
        price: editingProduct.price ?? '',
        originalPrice: editingProduct.originalPrice ?? '',
        material: editingProduct.material || 'High-Density Ergonomic EVA',
        soleMaterial: editingProduct.soleMaterial || 'Anti-Skid Textured Rubber',
        upperMaterial: editingProduct.upperMaterial || 'Synthetic Luxury Leather',
        occasion: editingProduct.occasion || 'Casual Daily',
        comfortFeatures: editingProduct.comfortFeatures || 'Arch support, Memory foam cushion',
        careInstructions: editingProduct.careInstructions || 'Wipe clean with damp cloth.',
        description: editingProduct.description || '',
        isFeatured: editingProduct.isFeatured ?? false,
        isTrending: editingProduct.isTrending ?? false,
        isNewArrival: editingProduct.isNewArrival ?? true,
        isBestSeller: editingProduct.isBestSeller ?? false,
        isActive: editingProduct.isActive ?? true,
        colorName: editingProduct.variants?.[0]?.colorName || 'Obsidian Black',
        colorCode: editingProduct.variants?.[0]?.colorCode || '#1A1A1A',
        imageUrls: editingProduct.images?.length
          ? editingProduct.images.map((img) => img.url)
          : ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800'],
        sizeStocks: sizeObj,
      });
    } else {
      setFormData({
        name: '',
        brand: 'AuraSole',
        sku: `AURA-${Math.floor(1000 + Math.random() * 9000)}`,
        categoryId: categories[0]?.id || '',
        gender: 'UNISEX',
        productType: 'Slides',
        price: '1499',
        originalPrice: '2999',
        material: 'High-Density Ergonomic EVA',
        soleMaterial: 'Anti-Skid Textured Rubber',
        upperMaterial: 'Synthetic Luxury Leather',
        occasion: 'Casual Daily',
        comfortFeatures: 'Arch support, Memory foam cushion, Shock absorption',
        careInstructions: 'Wipe clean with a soft damp cloth. Keep away from direct sunlight.',
        description: 'Handcrafted luxury comfort slipper engineered with anatomical arch support and durable non-slip tread for effortless everyday elegance.',
        isFeatured: true,
        isTrending: false,
        isNewArrival: true,
        isBestSeller: false,
        isActive: true,
        colorName: 'Obsidian Black',
        colorCode: '#1A1A1A',
        imageUrls: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800'],
        sizeStocks: {
          '6': 15,
          '7': 20,
          '8': 25,
          '9': 25,
          '10': 20,
          '11': 15,
          '12': 10,
        },
      });
    }
  }, [editingProduct, categories]);

  if (!isOpen) return null;

  // Calculate discount percentage
  const priceNum = parseFloat(formData.price) || 0;
  const origNum = parseFloat(formData.originalPrice) || 0;
  const computedDiscount = origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;
  const totalStockCount = Object.values(formData.sizeStocks).reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);

  const handleAddImageUrl = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ''],
    }));
  };

  const handleUpdateImageUrl = (index, val) => {
    const next = [...formData.imageUrls];
    next[index] = val;
    setFormData((prev) => ({ ...prev, imageUrls: next }));
  };

  const handleRemoveImageUrl = (index) => {
    if (formData.imageUrls.length <= 1) return;
    const next = formData.imageUrls.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, imageUrls: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Please enter slipper model name.');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showToast('error', 'Please enter a valid price.');
      return;
    }

    setIsLoading(true);

    try {
      const variants = Object.entries(formData.sizeStocks).map(([sizeKey, st]) => ({
        size: sizeKey,
        colorName: formData.colorName,
        colorCode: formData.colorCode,
        stock: parseInt(st, 10) || 0,
        sku: `${formData.sku || 'AURA'}-${sizeKey}`,
      }));

      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        sku: formData.sku.trim() || undefined,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        discountPercentage: computedDiscount,
        categoryId: formData.categoryId || (categories[0]?.id || ''),
        gender: formData.gender,
        productType: formData.productType,
        material: formData.material,
        soleMaterial: formData.soleMaterial,
        upperMaterial: formData.upperMaterial,
        occasion: formData.occasion,
        comfortFeatures: formData.comfortFeatures,
        careInstructions: formData.careInstructions,
        description: formData.description,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
        isActive: formData.isActive,
        images: formData.imageUrls.filter((url) => url.trim().length > 5),
        variants,
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
        showToast('success', `Slipper model "${formData.name}" updated successfully.`);
      } else {
        await adminService.createProduct(payload);
        showToast('success', `Slipper model "${formData.name}" published live!`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast('error', err.message || 'Failed to save product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] flex flex-col justify-between animate-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-luxury-accent/20 border border-luxury-accent/40 text-luxury-accent flex items-center justify-center font-black">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-white">
                {editingProduct ? `Edit Slipper: ${editingProduct.name}` : 'Upload New Slipper Collection Model'}
              </h2>
              <p className="text-xs text-stone-400">
                Configure specs, pricing, sizes, comfort ergonomic features & gallery images.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 py-3 border-b border-stone-800/80 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
          {[
            { id: 'basic', label: '1. General & Taxonomy' },
            { id: 'pricing', label: '2. Pricing & Stock' },
            { id: 'specs', label: '3. Ergonomics & Specs' },
            { id: 'gallery', label: '4. Image Gallery' },
            { id: 'variants', label: '5. Size & Color Matrix' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-luxury-accent text-stone-950 shadow-sm font-black'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-6 no-scrollbar text-xs">
          {/* TAB 1: BASIC SPECS */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Slipper Model Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aeroflex Cloud Comfort Slide"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="AuraSole"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Gender / Audience</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                  >
                    <option value="UNISEX">Unisex (All Footwear Lovers)</option>
                    <option value="MEN">Men's Slippers</option>
                    <option value="WOMEN">Women's Slippers</option>
                    <option value="KIDS">Kids Comfort</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Product Type</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                  >
                    {PRODUCT_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Product Story & Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the ergonomic footbed, luxury materials, and comfort sensation..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none leading-relaxed"
                />
              </div>

              {/* Status & Display Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-950/60 border border-stone-800/80 rounded-2xl">
                {[
                  { key: 'isNewArrival', label: 'New Arrival' },
                  { key: 'isFeatured', label: 'Featured Model' },
                  { key: 'isTrending', label: 'Trending Drop' },
                  { key: 'isBestSeller', label: 'Best Seller' },
                ].map((b) => (
                  <label key={b.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[b.key]}
                      onChange={(e) => setFormData({ ...formData, [b.key]: e.target.checked })}
                      className="rounded bg-stone-900 border-stone-700 text-luxury-accent focus:ring-0"
                    />
                    <span className="text-xs font-bold text-stone-300">{b.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & STOCK */}
          {activeTab === 'pricing' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Sale Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="1499"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-7 pr-3.5 py-2.5 text-white font-black text-sm focus:border-luxury-accent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Original MRP Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="2999"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-7 pr-3.5 py-2.5 text-stone-300 font-bold text-sm focus:border-luxury-accent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Calculated Discount</label>
                  <div className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-center">
                    {computedDiscount > 0 ? (
                      <span className="text-emerald-400 font-black text-sm">{computedDiscount}% OFF SAVINGS</span>
                    ) : (
                      <span className="text-stone-500 font-bold">No Discount</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-stone-950 border border-stone-800/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 block font-bold">Total Stock Inventory</span>
                  <span className="text-xs text-stone-500">Calculated automatically from size variant matrix below</span>
                </div>
                <span className="px-3.5 py-1 bg-luxury-accent text-stone-950 font-black text-sm rounded-xl">
                  {totalStockCount} Pairs Available
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: ERGONOMICS & SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Footbed / Upper Cushion Material</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                  >
                    {FOOTBED_MATERIALS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Sole Tread Material</label>
                  <select
                    value={formData.soleMaterial}
                    onChange={(e) => setFormData({ ...formData, soleMaterial: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                  >
                    {SOLE_MATERIALS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Comfort Features & Ergonomic Highlights</label>
                <input
                  type="text"
                  value={formData.comfortFeatures}
                  onChange={(e) => setFormData({ ...formData, comfortFeatures: e.target.value })}
                  placeholder="e.g. Deep heel cup, Arch support cradle, Anti-microbial footbed"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">Footwear Care Instructions</label>
                <input
                  type="text"
                  value={formData.careInstructions}
                  onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                  placeholder="e.g. Wipe clean with damp cloth, avoid direct sunlight"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: IMAGE GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Slipper Image Gallery</h4>
                  <p className="text-xs text-stone-400">Add image URLs for main angle, side view, and sole tread.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-luxury-accent font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Image Slot
                </button>
              </div>

              <div className="space-y-3">
                {formData.imageUrls.map((url, idx) => (
                  <div key={idx} className="p-3 bg-stone-950 border border-stone-800 rounded-2xl flex items-center gap-3">
                    <div className="w-14 h-14 bg-stone-900 rounded-xl overflow-hidden shrink-0 border border-stone-800">
                      {url ? (
                        <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-600">
                          <Image className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="block text-[10px] font-mono text-stone-400 font-bold uppercase mb-1">
                        {idx === 0 ? 'Primary Main Cover Image' : `Gallery Image #${idx + 1}`}
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleUpdateImageUrl(idx, e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-white text-xs focus:border-luxury-accent outline-none"
                      />
                    </div>

                    {formData.imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(idx)}
                        className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors shrink-0"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SIZE & COLOR MATRIX */}
          {activeTab === 'variants' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Color Customization */}
              <div className="p-4 bg-stone-950 border border-stone-800/80 rounded-2xl space-y-3">
                <h4 className="font-bold text-sm text-white">Color Variant Customization</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">Color Name</label>
                    <input
                      type="text"
                      value={formData.colorName}
                      onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                      placeholder="Obsidian Black"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">Color Hex Code</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.colorCode}
                        onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                        className="w-10 h-9 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer p-1"
                      />
                      <input
                        type="text"
                        value={formData.colorCode}
                        onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                        className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Size Inventory Matrix */}
              <div>
                <h4 className="font-bold text-sm text-white mb-2">UK Size Stock Matrix</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['6', '7', '8', '9', '10', '11', '12'].map((sz) => (
                    <div key={sz} className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-luxury-accent">UK Size {sz}</span>
                        <span className="text-[10px] text-stone-500 font-bold">Pairs</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={formData.sizeStocks[sz] ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sizeStocks: {
                              ...formData.sizeStocks,
                              [sz]: parseInt(e.target.value, 10) || 0,
                            },
                          })
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-white font-black text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold transition-colors text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-7 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingProduct ? 'Update Slipper Model' : 'Publish Slipper Model Live'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductModal;
