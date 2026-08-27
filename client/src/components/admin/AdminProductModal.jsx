import React, { useState, useEffect } from 'react';
import {
  Package,
  Sparkles,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Layers,
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Shield,
  Truck,
  Eye,
  ArrowRight,
  Crop,
  Check,
  Star,
  RefreshCw,
  Sliders,
  Tag,
} from 'lucide-react';
import adminService from '../../services/adminService';
import ImageCropModal from './ImageCropModal';
import { STANDARD_SIZES } from '../../constants';

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
  'Sports Slippers',
  'Party/Fashion Slippers',
];

const BRANDING_TYPES = [
  'Normal Branding',
  'Company Branding',
  'Private Label',
  'Custom Branding',
];

const DEFAULT_COLORS = [
  { id: '1', colorName: 'Obsidian Black', colorCode: '#1A1A1A' },
  { id: '2', colorName: 'Mocha Brown', colorCode: '#5C4033' },
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // State for Cropping Modal
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTargetColor, setCropTargetColor] = useState('');

  // Dynamic Brands and Subcategories from DB
  const [dbBrands, setDbBrands] = useState([]);
  const [dbSubcategories, setDbSubcategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'AuraSole',
    brandId: '',
    brandingType: 'Normal Branding',
    sku: '',
    categoryId: '',
    subcategoryId: '',
    gender: 'UNISEX',
    productType: 'Slides',
    price: '',
    originalPrice: '',
    shippingFee: 0,
    lowStockThreshold: 3,
    status: 'PUBLISHED', // PUBLISHED, DRAFT, UNPUBLISHED, ARCHIVED
    material: 'High-Density Ergonomic EVA',
    soleMaterial: 'Anti-Skid Textured Rubber',
    upperMaterial: 'Synthetic Luxury Leather',
    occasion: 'Casual Daily',
    comfortFeatures: 'Arch support, Memory foam cushion, Shock absorption',
    careInstructions: 'Wipe clean with a soft damp cloth. Avoid direct heat exposure.',
    countryOfOrigin: 'India',
    description: '',
    isFeatured: false,
    isTrending: false,
    isNewArrival: true,
    isBestSeller: false,
    isActive: true,
    // Colors & Color-specific photos
    colors: DEFAULT_COLORS,
    // Images array: [{ url, colorName, isPrimary, altText }]
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800',
        colorName: 'Obsidian Black',
        isPrimary: true,
        altText: 'Obsidian Black front view',
      },
    ],
    // Size-Color Matrix stock: { "Obsidian Black_8": 20, "Mocha Brown_8": 15 }
    variantStocks: {
      'Obsidian Black_6': 15,
      'Obsidian Black_7': 20,
      'Obsidian Black_8': 25,
      'Obsidian Black_9': 25,
      'Obsidian Black_10': 20,
      'Obsidian Black_11': 15,
      'Obsidian Black_12': 10,
      'Mocha Brown_6': 10,
      'Mocha Brown_7': 15,
      'Mocha Brown_8': 20,
      'Mocha Brown_9': 20,
      'Mocha Brown_10': 15,
      'Mocha Brown_11': 10,
      'Mocha Brown_12': 5,
    },
  });

  // Preview State
  const [previewColor, setPreviewColor] = useState('Obsidian Black');
  const [previewSelectedImage, setPreviewSelectedImage] = useState('');
  const [previewSelectedSize, setPreviewSelectedSize] = useState('8');

  // Load brands and subcategories
  useEffect(() => {
    if (!isOpen) return;

    const fetchMeta = async () => {
      try {
        const [brandsRes, subsRes] = await Promise.all([
          adminService.getBrands(),
          adminService.getSubCategories(),
        ]);
        if (brandsRes?.data) setDbBrands(brandsRes.data);
        if (subsRes?.data) setDbSubcategories(subsRes.data);
      } catch (err) {
        console.error('Failed to load modal metadata:', err);
      }
    };
    fetchMeta();
  }, [isOpen]);

  useEffect(() => {
    if (editingProduct) {
      // Extract unique colors from editingProduct variants
      const colorMap = new Map();
      const stocks = {};

      if (editingProduct.variants?.length) {
        editingProduct.variants.forEach((v, idx) => {
          if (v.colorName && !colorMap.has(v.colorName)) {
            colorMap.set(v.colorName, {
              id: String(idx + 1),
              colorName: v.colorName,
              colorCode: v.colorCode || '#1A1A1A',
            });
          }
          const key = `${v.colorName}_${v.size}`;
          stocks[key] = v.stock;
        });
      }

      const extractedColors = Array.from(colorMap.values());
      const productColors = extractedColors.length ? extractedColors : DEFAULT_COLORS;

      // Extract images
      const productImages = editingProduct.images?.length
        ? editingProduct.images.map((img) => ({
            url: img.url,
            colorName: img.colorName || (productColors[0]?.colorName || ''),
            isPrimary: img.isPrimary,
            altText: img.altText || '',
          }))
        : [
            {
              url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800',
              colorName: productColors[0]?.colorName || 'Obsidian Black',
              isPrimary: true,
              altText: 'Primary product image',
            },
          ];

      setFormData({
        name: editingProduct.name || '',
        brand: editingProduct.brand || 'AuraSole',
        brandId: editingProduct.brandId || '',
        brandingType: editingProduct.brandingType || 'Normal Branding',
        sku: editingProduct.sku || '',
        categoryId: editingProduct.categoryId || (categories[0]?.id || ''),
        subcategoryId: editingProduct.subcategoryId || '',
        gender: editingProduct.gender || 'UNISEX',
        productType: editingProduct.productType || 'Slides',
        price: editingProduct.price ?? '',
        originalPrice: editingProduct.originalPrice ?? '',
        shippingFee: editingProduct.shippingFee ?? 0,
        lowStockThreshold: editingProduct.lowStockThreshold ?? 3,
        status: editingProduct.status || (editingProduct.isActive ? 'PUBLISHED' : 'DRAFT'),
        material: editingProduct.material || 'High-Density Ergonomic EVA',
        soleMaterial: editingProduct.soleMaterial || 'Anti-Skid Textured Rubber',
        upperMaterial: editingProduct.upperMaterial || 'Synthetic Luxury Leather',
        occasion: editingProduct.occasion || 'Casual Daily',
        comfortFeatures: editingProduct.comfortFeatures || 'Arch support, Memory foam cushion',
        careInstructions: editingProduct.careInstructions || 'Wipe clean with damp cloth.',
        countryOfOrigin: editingProduct.countryOfOrigin || 'India',
        description: editingProduct.description || '',
        isFeatured: editingProduct.isFeatured ?? false,
        isTrending: editingProduct.isTrending ?? false,
        isNewArrival: editingProduct.isNewArrival ?? true,
        isBestSeller: editingProduct.isBestSeller ?? false,
        isActive: editingProduct.isActive ?? true,
        colors: productColors,
        images: productImages,
        variantStocks: stocks,
      });

      setPreviewColor(productColors[0]?.colorName || 'Obsidian Black');
    } else {
      // New Product Initialization
      setFormData({
        name: '',
        brand: 'AuraSole',
        brandId: '',
        brandingType: 'Normal Branding',
        sku: `AURA-${Math.floor(1000 + Math.random() * 9000)}`,
        categoryId: categories[0]?.id || '',
        subcategoryId: '',
        gender: 'UNISEX',
        productType: 'Slides',
        price: '1499',
        originalPrice: '2999',
        shippingFee: 0,
        lowStockThreshold: 3,
        status: 'PUBLISHED',
        material: 'High-Density Ergonomic EVA',
        soleMaterial: 'Anti-Skid Textured Rubber',
        upperMaterial: 'Synthetic Luxury Leather',
        occasion: 'Casual Daily',
        comfortFeatures: 'Arch support, Memory foam cushion, Shock absorption',
        careInstructions: 'Wipe clean with a soft damp cloth. Keep away from direct sunlight.',
        countryOfOrigin: 'India',
        description: 'Handcrafted luxury comfort slipper engineered with anatomical arch support and durable non-slip tread for effortless everyday elegance.',
        isFeatured: true,
        isTrending: false,
        isNewArrival: true,
        isBestSeller: false,
        isActive: true,
        colors: DEFAULT_COLORS,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800',
            colorName: 'Obsidian Black',
            isPrimary: true,
            altText: 'Obsidian Black angle',
          },
          {
            url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
            colorName: 'Mocha Brown',
            isPrimary: false,
            altText: 'Mocha Brown angle',
          },
        ],
        variantStocks: {
          'Obsidian Black_6': 15,
          'Obsidian Black_7': 20,
          'Obsidian Black_8': 25,
          'Obsidian Black_9': 25,
          'Obsidian Black_10': 20,
          'Obsidian Black_11': 15,
          'Obsidian Black_12': 10,
          'Mocha Brown_6': 10,
          'Mocha Brown_7': 15,
          'Mocha Brown_8': 20,
          'Mocha Brown_9': 20,
          'Mocha Brown_10': 15,
          'Mocha Brown_11': 10,
          'Mocha Brown_12': 5,
        },
      });
      setPreviewColor('Obsidian Black');
    }
  }, [editingProduct, categories]);

  if (!isOpen) return null;

  // Calculation helpers
  const priceNum = parseFloat(formData.price) || 0;
  const origNum = parseFloat(formData.originalPrice) || 0;
  const computedDiscount = origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;
  const totalStockCount = Object.values(formData.variantStocks).reduce(
    (acc, curr) => acc + (parseInt(curr, 10) || 0),
    0
  );

  // Color Variant Handlers
  const handleAddColor = () => {
    const newColorName = `Color ${formData.colors.length + 1}`;
    const newColor = {
      id: String(Date.now()),
      colorName: newColorName,
      colorCode: '#4A5568',
    };
    const nextColors = [...formData.colors, newColor];

    // Initialize size stocks for new color
    const nextStocks = { ...formData.variantStocks };
    STANDARD_SIZES.forEach((sz) => {
      nextStocks[`${newColorName}_${sz}`] = 10;
    });

    setFormData((prev) => ({
      ...prev,
      colors: nextColors,
      variantStocks: nextStocks,
    }));
  };

  const handleUpdateColor = (id, field, value) => {
    const target = formData.colors.find((c) => c.id === id);
    if (!target) return;
    const oldName = target.colorName;

    const nextColors = formData.colors.map((c) => (c.id === id ? { ...c, [field]: value } : c));

    // If colorName changed, update associated images & variant stocks
    if (field === 'colorName' && value !== oldName) {
      const nextImages = formData.images.map((img) =>
        img.colorName === oldName ? { ...img, colorName: value } : img
      );
      const nextStocks = {};
      Object.entries(formData.variantStocks).forEach(([k, st]) => {
        if (k.startsWith(`${oldName}_`)) {
          const sz = k.split('_')[1];
          nextStocks[`${value}_${sz}`] = st;
        } else {
          nextStocks[k] = st;
        }
      });

      setFormData((prev) => ({
        ...prev,
        colors: nextColors,
        images: nextImages,
        variantStocks: nextStocks,
      }));
    } else {
      setFormData((prev) => ({ ...prev, colors: nextColors }));
    }
  };

  const handleRemoveColor = (id) => {
    if (formData.colors.length <= 1) {
      showToast('warning', 'Product must have at least one color variant.');
      return;
    }
    const target = formData.colors.find((c) => c.id === id);
    const nextColors = formData.colors.filter((c) => c.id !== id);

    setFormData((prev) => ({
      ...prev,
      colors: nextColors,
      images: prev.images.filter((img) => img.colorName !== target?.colorName),
    }));
  };

  // Image Management Handlers
  const handleOpenCropForColor = (colorName) => {
    setCropTargetColor(colorName);
    setCropModalOpen(true);
  };

  const handleCropComplete = (croppedImageObj) => {
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url: croppedImageObj.url,
          colorName: croppedImageObj.colorName || prev.colors[0]?.colorName || 'General',
          isPrimary: prev.images.length === 0,
          altText: croppedImageObj.altText || `${formData.name} photo`,
        },
      ],
    }));
    showToast('success', 'Photo cropped & added to color gallery!');
  };

  const handleSetPrimaryImage = (index) => {
    const next = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setFormData((prev) => ({ ...prev, images: next }));
  };

  const handleRemoveImage = (index) => {
    if (formData.images.length <= 1) {
      showToast('warning', 'Product must keep at least 1 image.');
      return;
    }
    const next = formData.images.filter((_, i) => i !== index);
    if (formData.images[index].isPrimary && next.length > 0) {
      next[0].isPrimary = true;
    }
    setFormData((prev) => ({ ...prev, images: next }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      showToast('error', 'Please enter slipper model name.');
      setActiveTab('basic');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showToast('error', 'Please enter a valid selling price.');
      setActiveTab('pricing');
      return;
    }
    if (!formData.images || formData.images.length === 0) {
      showToast('error', 'Please add at least one product photo.');
      setActiveTab('gallery');
      return;
    }

    setIsLoading(true);

    try {
      // Build variants matrix
      const variants = [];
      formData.colors.forEach((col) => {
        STANDARD_SIZES.forEach((sz) => {
          const key = `${col.colorName}_${sz}`;
          const stock = parseInt(formData.variantStocks[key], 10) || 0;
          variants.push({
            size: sz,
            colorName: col.colorName,
            colorCode: col.colorCode,
            stock,
            sku: `${formData.sku || 'AURA'}-${col.colorName.slice(0, 3).toUpperCase()}-${sz}`,
          });
        });
      });

      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || 'AuraSole',
        brandId: formData.brandId || null,
        brandingType: formData.brandingType,
        sku: formData.sku.trim() || undefined,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        discountPercentage: computedDiscount,
        shippingFee: parseFloat(formData.shippingFee) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 3,
        status: formData.status,
        categoryId: formData.categoryId || (categories[0]?.id || ''),
        subcategoryId: formData.subcategoryId || undefined,
        gender: formData.gender,
        productType: formData.productType,
        material: formData.material,
        soleMaterial: formData.soleMaterial,
        upperMaterial: formData.upperMaterial,
        occasion: formData.occasion,
        comfortFeatures: formData.comfortFeatures,
        careInstructions: formData.careInstructions,
        countryOfOrigin: formData.countryOfOrigin,
        description: formData.description,
        isFeatured: Boolean(formData.isFeatured),
        isTrending: Boolean(formData.isTrending),
        isNewArrival: Boolean(formData.isNewArrival),
        isBestSeller: Boolean(formData.isBestSeller),
        isActive: formData.status === 'PUBLISHED',
        images: formData.images.map((img, idx) => ({
          url: img.url,
          colorName: img.colorName,
          altText: img.altText || `${formData.name} angle`,
          isPrimary: img.isPrimary || idx === 0,
        })),
        variants,
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
        showToast('success', `Slipper model "${formData.name}" updated successfully.`);
      } else {
        await adminService.createProduct(payload);
        showToast('success', `Slipper model "${formData.name}" published live to catalog!`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast('error', err.message || 'Failed to save product.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter photos for preview
  const previewImages =
    formData.images.filter((img) => img.colorName === previewColor).length > 0
      ? formData.images.filter((img) => img.colorName === previewColor)
      : formData.images;

  const currentPreviewDisplayImage =
    previewSelectedImage || previewImages[0]?.url || formData.images[0]?.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-5xl rounded-3xl p-5 sm:p-8 shadow-2xl z-10 max-h-[94vh] flex flex-col justify-between animate-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-luxury-accent/20 border border-luxury-accent/40 text-luxury-accent flex items-center justify-center font-black">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2">
                {editingProduct ? `Edit Slipper: ${editingProduct.name}` : 'Create Slipper Model & Color Galleries'}
                <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-800 text-luxury-accent rounded-md border border-stone-700">
                  {formData.status}
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                1:1 Square cropped galleries, color-wise photos, shipping rules, inventory & pricing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-luxury-accent font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-stone-700"
            >
              <Eye className="w-4 h-4" /> Live Preview
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 py-3 border-b border-stone-800/80 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
          {[
            { id: 'basic', label: '1. Basic Info & Branding' },
            { id: 'pricing', label: '2. Pricing & Shipping' },
            { id: 'specs', label: '3. Ergonomics & Specs' },
            { id: 'gallery', label: '4. Color Galleries & Photos' },
            { id: 'variants', label: '5. Color-Size Inventory' },
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-6 no-scrollbar text-xs">
          {/* TAB 1: BASIC INFO & BRANDING */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
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
                  <label className="block text-stone-400 font-bold uppercase mb-1">SKU Prefix</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="AURA-4029"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:border-luxury-accent outline-none"
                  />
                </div>
              </div>

              {/* Branding Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Footwear Brand *</label>
                  <select
                    value={formData.brandId || (formData.brand ? '__custom__' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__custom__') {
                        setFormData({ ...formData, brandId: '', brand: '' });
                      } else {
                        const selected = dbBrands.find((b) => b.id === val);
                        if (selected) {
                          setFormData({
                            ...formData,
                            brandId: selected.id,
                            brand: selected.name,
                            brandingType: selected.brandingType === 'COMPANY' ? 'Company Branding' : 'Normal Branding',
                          });
                        } else {
                          setFormData({ ...formData, brandId: '', brand: 'AuraSole' });
                        }
                      }
                    }}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  >
                    <option value="">Select Managed Brand</option>
                    {dbBrands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.brandingType === 'COMPANY' ? 'Company' : 'Normal'})
                      </option>
                    ))}
                    <option value="__custom__">+ Enter Custom Brand Name</option>
                  </select>

                  {(!formData.brandId || formData.brandId === '') && (
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Enter Brand Name (e.g. AuraSole)"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-1.5 text-white text-xs mt-2 focus:border-luxury-accent outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Branding Type *</label>
                  <select
                    value={formData.brandingType}
                    onChange={(e) => setFormData({ ...formData, brandingType: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2 text-white font-bold focus:border-luxury-accent outline-none"
                  >
                    <option value="Normal Branding">Normal Branding (Standard Line)</option>
                    <option value="Company Branding">Company Branding (Flagship Brand)</option>
                    <option value="Private Label">Private Label</option>
                    <option value="Custom Branding">Custom Branding</option>
                  </select>
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Distinguish between Company Branding and Normal Branding models.
                  </span>
                </div>
              </div>

              {/* Category, Subcategory, Gender, Product Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      setFormData({
                        ...formData,
                        categoryId: newCatId,
                        subcategoryId: '', // Reset subcategory when category changes
                      });
                    }}
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
                  <label className="block text-stone-400 font-bold uppercase mb-1">Subcategory</label>
                  <select
                    value={formData.subcategoryId || ''}
                    onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none font-bold"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {dbSubcategories
                      .filter((s) => s.categoryId === formData.categoryId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Gender / Audience</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none font-bold"
                  >
                    <option value="UNISEX">Unisex (Men & Women)</option>
                    <option value="MEN">Men's Slippers</option>
                    <option value="WOMEN">Women's Slippers</option>
                    <option value="KIDS">Kids Comfort</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Product Slipper Type</label>
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

              {/* Description */}
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">
                  Product Description & Footwear Story
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the ergonomic footbed, luxury materials, and comfort sensation..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none leading-relaxed"
                />
              </div>

              {/* Display Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-950/60 border border-stone-800/80 rounded-2xl">
                {[
                  { key: 'isNewArrival', label: 'New Arrival Drop' },
                  { key: 'isFeatured', label: 'Featured Showroom' },
                  { key: 'isTrending', label: 'Trending Slipper' },
                  { key: 'isBestSeller', label: 'Best Seller' },
                ].map((b) => (
                  <label key={b.key} className="flex items-center gap-2 cursor-pointer select-none">
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

          {/* TAB 2: PRICING & SHIPPING */}
          {activeTab === 'pricing' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Selling Price (₹) *</label>
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
                  <label className="block text-stone-400 font-bold uppercase mb-1">Calculated Savings</label>
                  <div className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-center flex items-center justify-center h-[42px]">
                    {computedDiscount > 0 ? (
                      <span className="text-emerald-400 font-black text-sm">{computedDiscount}% OFF DISCOUNT</span>
                    ) : (
                      <span className="text-stone-500 font-bold">No Discount</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Fee Configuration */}
              <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Truck className="w-4 h-4 text-luxury-accent" />
                  <span>Product Shipping Fee Management</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 font-bold uppercase mb-1">
                      Shipping Charge for this Slipper (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-stone-500 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.shippingFee}
                        onChange={(e) => setFormData({ ...formData, shippingFee: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-7 pr-3.5 py-2 text-white font-bold"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Enter 0 for "Free Shipping" across India, or set specific fee (e.g. ₹50).
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => setFormData({ ...formData, shippingFee: 0 })}
                      className={`flex-1 p-3 rounded-xl border text-center cursor-pointer transition-all ${
                        formData.shippingFee === 0
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-black'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      <span className="block text-xs">Free Delivery</span>
                      <span className="text-[10px] font-mono">₹0 Fee</span>
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, shippingFee: 49 })}
                      className={`flex-1 p-3 rounded-xl border text-center cursor-pointer transition-all ${
                        formData.shippingFee === 49
                          ? 'bg-amber-950/40 border-amber-500 text-amber-400 font-black'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      <span className="block text-xs">Standard Delivery</span>
                      <span className="text-[10px] font-mono">₹49 Fee</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Inventory Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Product Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-luxury-accent outline-none"
                  >
                    <option value="PUBLISHED">Published (Live in Storefront)</option>
                    <option value="DRAFT">Draft (Hidden from Customers)</option>
                    <option value="UNPUBLISHED">Unpublished (Inactive)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) || 3 })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-bold"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Show "Only X Left" badge when stock falls below this count.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ERGONOMICS & SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">
                    Footbed / Cushion Material
                  </label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Upper Strap Material</label>
                  <input
                    type="text"
                    value={formData.upperMaterial}
                    onChange={(e) => setFormData({ ...formData, upperMaterial: e.target.value })}
                    placeholder="Synthetic Luxury Leather / Soft EVA"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Occasion / Lifestyle</label>
                  <input
                    type="text"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    placeholder="Casual Daily, Bathroom, Outdoor, Spa"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">
                  Comfort Features & Ergonomic Highlights
                </label>
                <input
                  type="text"
                  value={formData.comfortFeatures}
                  onChange={(e) => setFormData({ ...formData, comfortFeatures: e.target.value })}
                  placeholder="e.g. Deep heel cup, Arch support cradle, Anti-microbial footbed"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">Country of Origin</label>
                  <input
                    type="text"
                    value={formData.countryOfOrigin}
                    onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                    placeholder="India"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:border-luxury-accent outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COLOR GALLERIES & PHOTOS */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Color-Specific Slipper Galleries</h4>
                  <p className="text-xs text-stone-400">
                    Upload & crop photos for EACH color. When customers select a color, its exact photos will show.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3.5 py-2 bg-luxury-accent/20 hover:bg-luxury-accent/30 text-luxury-accent font-bold text-xs rounded-xl flex items-center gap-1.5 border border-luxury-accent/40 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Slipper Color
                </button>
              </div>

              {/* Color Sections List */}
              <div className="space-y-5">
                {formData.colors.map((color) => {
                  const colorImages = formData.images.filter((img) => img.colorName === color.colorName);

                  return (
                    <div
                      key={color.id}
                      className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-4 shadow-sm"
                    >
                      {/* Color Header & Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={color.colorCode}
                            onChange={(e) => handleUpdateColor(color.id, 'colorCode', e.target.value)}
                            className="w-9 h-8 rounded-lg bg-stone-900 border border-stone-700 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={color.colorName}
                            onChange={(e) => handleUpdateColor(color.id, 'colorName', e.target.value)}
                            placeholder="Color Name (e.g. Mocha Brown)"
                            className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-white font-bold text-xs focus:border-luxury-accent outline-none"
                          />
                          <span className="text-[10px] font-mono text-stone-500">
                            ({colorImages.length} photos)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenCropForColor(color.colorName)}
                            className="px-3 py-1.5 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-sm"
                          >
                            <Crop className="w-3.5 h-3.5" /> + Crop & Add Photo
                          </button>

                          {formData.colors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(color.id)}
                              className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                              title="Delete Color Variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Photo Grid for this Color */}
                      {colorImages.length === 0 ? (
                        <div
                          onClick={() => handleOpenCropForColor(color.colorName)}
                          className="border border-dashed border-stone-800 hover:border-luxury-accent/60 rounded-xl p-6 text-center cursor-pointer bg-stone-900/40 hover:bg-stone-900 transition-colors flex flex-col items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-6 h-6 text-stone-600" />
                          <span className="text-xs text-stone-400">
                            No photos added for <strong className="text-white">{color.colorName}</strong>. Click to
                            select and 1:1 square crop photos.
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {formData.images.map((img, globalIdx) => {
                            if (img.colorName !== color.colorName) return null;

                            return (
                              <div
                                key={globalIdx}
                                className={`relative group rounded-xl overflow-hidden border bg-stone-900 aspect-square ${
                                  img.isPrimary ? 'border-luxury-accent ring-2 ring-luxury-accent/30' : 'border-stone-800'
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt={img.altText}
                                  className="w-full h-full object-cover"
                                />

                                {/* Primary Badge */}
                                {img.isPrimary && (
                                  <span className="absolute top-1.5 left-1.5 bg-luxury-accent text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                    Primary
                                  </span>
                                )}

                                {/* Hover Actions Overlay */}
                                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                                  {!img.isPrimary && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimaryImage(globalIdx)}
                                      className="px-2 py-1 bg-luxury-accent text-stone-950 rounded text-[10px] font-bold"
                                    >
                                      Set Primary
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(globalIdx)}
                                    className="p-1.5 bg-rose-900/80 hover:bg-rose-700 text-rose-200 rounded text-[10px] flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SIZE & COLOR INVENTORY MATRIX */}
          {activeTab === 'variants' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Color x Size Inventory Matrix</h4>
                  <p className="text-xs text-stone-400">
                    Set specific stock inventory for each color & size variant. Total stock updates automatically.
                  </p>
                </div>

                <span className="px-3.5 py-1 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl shadow-glow">
                  Total Inventory: {totalStockCount} Pairs
                </span>
              </div>

              {/* Table / Grid for Matrix */}
              <div className="space-y-4">
                {formData.colors.map((color) => (
                  <div key={color.id} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-600"
                        style={{ backgroundColor: color.colorCode }}
                      />
                      <span className="font-bold text-white text-xs">{color.colorName}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
                      {STANDARD_SIZES.map((sz) => {
                        const key = `${color.colorName}_${sz}`;
                        const stockVal = formData.variantStocks[key] ?? 0;

                        return (
                          <div key={sz} className="p-2.5 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono font-bold text-luxury-accent">Size {sz}</span>
                              <span className="text-[9px] text-stone-500">Pairs</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              value={stockVal}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  variantStocks: {
                                    ...formData.variantStocks,
                                    [key]: parseInt(e.target.value, 10) || 0,
                                  },
                                })
                              }
                              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-white font-bold text-center text-xs"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-luxury-accent" /> Preview
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

      {/* 1:1 Square Image Cropper Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        colorName={cropTargetColor}
        onCropComplete={handleCropComplete}
      />

      {/* Live Customer Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-3xl w-full space-y-5 text-stone-100 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-luxury-accent" />
                <h3 className="font-bold text-sm text-white">Live Customer Storefront Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Gallery Preview */}
              <div className="space-y-3">
                <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-stone-700 shadow-2xl">
                  {currentPreviewDisplayImage ? (
                    <img
                      src={currentPreviewDisplayImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {previewImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPreviewSelectedImage(img.url)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 ${
                        currentPreviewDisplayImage === img.url ? 'border-luxury-accent' : 'border-stone-800'
                      }`}
                    >
                      <img src={img.url} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info Preview */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-luxury-accent">
                    {formData.brand} • {formData.brandingType}
                  </span>
                  <h2 className="font-display font-black text-xl text-white mt-1">
                    {formData.name || 'Untitled Slipper Model'}
                  </h2>
                </div>

                {/* Pricing & Shipping */}
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-white">₹{formData.price || '0'}</span>
                  {formData.originalPrice && (
                    <span className="text-sm text-stone-500 line-through">₹{formData.originalPrice}</span>
                  )}
                  {computedDiscount > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-black rounded-md border border-emerald-800">
                      {computedDiscount}% OFF
                    </span>
                  )}
                </div>

                <div className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl flex items-center gap-2 text-stone-300">
                  <Truck className="w-4 h-4 text-luxury-accent" />
                  <span>
                    {formData.shippingFee === 0 ? (
                      <strong className="text-emerald-400">Free Express Delivery</strong>
                    ) : (
                      `Shipping Fee: ₹${formData.shippingFee}`
                    )}
                  </span>
                </div>

                {/* Color Swatches */}
                <div>
                  <span className="text-stone-400 font-bold block mb-1.5">Color: {previewColor}</span>
                  <div className="flex gap-2">
                    {formData.colors.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setPreviewColor(c.colorName);
                          const firstColorImg = formData.images.find((img) => img.colorName === c.colorName);
                          if (firstColorImg) setPreviewSelectedImage(firstColorImg.url);
                        }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          previewColor === c.colorName ? 'border-luxury-accent scale-110' : 'border-stone-700'
                        }`}
                        style={{ backgroundColor: c.colorCode }}
                        title={c.colorName}
                      />
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <span className="text-stone-400 font-bold block mb-1.5">Select Size</span>
                  <div className="flex flex-wrap gap-1.5">
                    {STANDARD_SIZES.map((sz) => {
                      const stock = formData.variantStocks[`${previewColor}_${sz}`] ?? 0;
                      const isOutOfStock = stock <= 0;

                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setPreviewSelectedSize(sz)}
                          className={`w-9 h-9 rounded-xl font-black text-xs border transition-all ${
                            isOutOfStock
                              ? 'opacity-30 border-stone-800 text-stone-600 line-through cursor-not-allowed'
                              : previewSelectedSize === sz
                              ? 'bg-luxury-accent text-stone-950 border-luxury-accent font-black'
                              : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full py-3 bg-luxury-accent text-stone-950 font-black rounded-xl text-xs uppercase tracking-wider"
                  >
                    Add To Bag (Customer Preview)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductModal;
