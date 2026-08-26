import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Star,
  ShoppingBag,
  Zap,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  ChevronRight,
  Package,
  MessageSquare,
} from 'lucide-react';

import productService from '../services/productService';
import wishlistService from '../services/wishlistService';
import orderService from '../services/orderService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';

import ProductGallery from '../components/product/ProductGallery';
import ColorSelector from '../components/product/ColorSelector';
import SizeSelector from '../components/product/SizeSelector';
import DeliveryChecker from '../components/product/DeliveryChecker';
import ProductSpecifications from '../components/product/ProductSpecifications';
import ProductReviewsSection from '../components/product/ProductReviewsSection';
import MobilePurchaseBar from '../components/product/MobilePurchaseBar';
import ProductDetailsSkeleton from '../components/product/ProductDetailsSkeleton';
import ProductCard from '../components/product/ProductCard';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Variant selection states
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // UI action states
  const [isAdding, setIsAdding] = useState(false);
  const [addFeedback, setAddFeedback] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Recently viewed list from localStorage
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Fetch Product by Slug
  const loadProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await productService.getProductBySlug(slug);
      if (res?.data) {
        const prod = res.data;
        setProduct(prod);

        // Update Document Title for SEO
        document.title = `${prod.name} — AuraSole Premium Footwear`;

        // Extract initial color & size defaults
        const defaultColor = prod.variants?.[0]?.colorName || 'Default';
        setSelectedColor(defaultColor);

        // Find available sizes for default color
        const availableSizes = prod.variants
          ?.filter((v) => v.colorName?.toLowerCase() === defaultColor.toLowerCase() && v.stock > 0)
          ?.map((v) => v.size);

        if (availableSizes && availableSizes.length > 0) {
          setSelectedSize(availableSizes[0]);
        } else if (prod.variants?.[0]?.size) {
          setSelectedSize(prod.variants[0].size);
        }

        // Track in Recently Viewed (LIFO, max 4)
        const storedViews = JSON.parse(localStorage.getItem('aurasole_recent_views') || '[]');
        const filtered = storedViews.filter((item) => item.id !== prod.id);
        const updatedRecent = [
          {
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            price: prod.price,
            originalPrice: prod.originalPrice,
            image: prod.images?.[0]?.url || '',
            rating: prod.rating,
            category: prod.category,
          },
          ...filtered,
        ].slice(0, 4);

        localStorage.setItem('aurasole_recent_views', JSON.stringify(updatedRecent));
        setRecentlyViewed(filtered.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load slipper details:', err);
      setError(err.message || 'Product not found.');
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    loadProduct();
  }, [slug]);

  // Extract unique colors and sizes from variants
  const { allColors, allSizes } = useMemo(() => {
    if (!product?.variants) return { allColors: [], allSizes: [] };

    const colorMap = new Map();
    const sizeSet = new Set();

    product.variants.forEach((v) => {
      if (v.colorName && !colorMap.has(v.colorName)) {
        colorMap.set(v.colorName, v.colorCode || '#1A1A1A');
      }
      if (v.size) sizeSet.add(v.size);
    });

    const colors = Array.from(colorMap.entries()).map(([name, code]) => ({ name, code }));
    const sizes = Array.from(sizeSet).sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));

    return { allColors: colors, allSizes: sizes };
  }, [product]);

  // Sizes available for currently selected color
  const availableSizesForSelectedColor = useMemo(() => {
    if (!product?.variants || !selectedColor) return allSizes;
    return product.variants
      .filter((v) => v.colorName?.toLowerCase() === selectedColor?.toLowerCase() && v.stock > 0)
      .map((v) => v.size);
  }, [product, selectedColor, allSizes]);

  // Current active variant based on selected size & color
  const activeVariant = useMemo(() => {
    if (!product?.variants) return null;
    return (
      product.variants.find(
        (v) =>
          v.size === selectedSize &&
          v.colorName?.toLowerCase() === selectedColor?.toLowerCase()
      ) || null
    );
  }, [product, selectedSize, selectedColor]);

  // Available stock for currently selected variant or general product
  const availableStock = activeVariant ? activeVariant.stock : product?.stock || 0;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 5;

  // Authoritative display price
  const displayPrice = activeVariant?.priceOverride || product?.price || 0;
  const displayOriginalPrice = product?.originalPrice;

  // Handle color change: auto-select first available size for that color
  const handleColorChange = (newColor) => {
    setSelectedColor(newColor);
    const availableSizes = product.variants
      ?.filter((v) => v.colorName?.toLowerCase() === newColor.toLowerCase() && v.stock > 0)
      ?.map((v) => v.size);

    if (availableSizes && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0] || '');
    }
  };

  // Add to Bag Handler
  const handleAddToCart = async () => {
    if (!selectedSize) {
      setAddFeedback({ type: 'error', text: 'Please select your slipper size first.' });
      return;
    }

    if (isOutOfStock) {
      setAddFeedback({ type: 'error', text: 'Selected size is currently out of stock.' });
      return;
    }

    setIsAdding(true);
    setAddFeedback(null);

    try {
      await addToCart({
        productId: product.id,
        variantId: activeVariant?.id || null,
        size: selectedSize,
        color: selectedColor,
        quantity,
        product,
        variant: activeVariant,
      });

      setAddFeedback({ type: 'success', text: '✓ Added to your Shopping Bag!' });
      setTimeout(() => setAddFeedback(null), 3000);
    } catch (err) {
      setAddFeedback({ type: 'error', text: err.message || 'Failed to add item to bag.' });
    } finally {
      setIsAdding(false);
    }
  };

  // Buy Now Handler
  const handleBuyNow = async () => {
    if (!selectedSize) {
      setAddFeedback({ type: 'error', text: 'Please select your slipper size first.' });
      return;
    }

    await handleAddToCart();
    navigate('/checkout');
  };

  // Direct Order on WhatsApp Handler
  const handleOrderOnWhatsApp = async () => {
    if (!selectedSize) {
      setAddFeedback({ type: 'error', text: 'Please select your slipper size before ordering on WhatsApp.' });
      return;
    }

    try {
      const res = await orderService.createQuickProductWhatsAppOrder({
        productId: product.id,
        variantId: activeVariant?.id || null,
        size: selectedSize,
        color: selectedColor,
        quantity,
        productUrl: window.location.href,
      });

      if (res?.data?.whatsappUrl) {
        window.open(res.data.whatsappUrl, '_blank');
      }
    } catch (err) {
      setAddFeedback({ type: 'error', text: 'Failed to initiate WhatsApp chat. Please try again.' });
    }
  };

  // Wishlist Toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${slug}` } } });
      return;
    }

    try {
      const res = await wishlistService.toggleWishlist(product.id);
      setIsWishlisted(res.data?.isWishlisted ?? !isWishlisted);
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  // Share Slipper Link
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out the ${product?.name} on AuraSole Footwear!`,
          url,
        });
      } catch (err) {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">
          <ProductDetailsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="font-display font-black text-2xl text-luxury-dark">Slipper Not Found</h2>
          <p className="text-xs text-gray-500 mt-2 mb-6">
            The slipper style you are looking for is no longer active or may have moved to a new collection.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-dark text-white rounded-2xl text-xs font-bold hover:bg-luxury-accent hover:text-luxury-dark transition-colors shadow-md"
          >
            Explore All Slippers <ChevronRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Shop', link: '/shop' },
    { label: product.category?.name || 'Category', link: `/shop?category=${product.category?.slug}` },
    { label: product.name },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Product Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery with Zoom & Fullscreen */}
          <div className="lg:col-span-7 sticky top-24">
            <ProductGallery
              images={product.images || []}
              productName={product.name}
            />
          </div>

          {/* Right Column: Slipper Details & Purchase Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header & Badges */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-luxury-accent">
                  {product.brand || 'AuraSole Signature'}
                </span>

                <div className="flex items-center gap-2">
                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-white text-gray-500 hover:text-luxury-dark transition-colors"
                    title="Share this slipper"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {copiedLink && (
                    <span className="text-[10px] font-bold text-emerald-600 animate-in fade-in">
                      Link copied!
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className={`p-2 rounded-full transition-colors ${
                      isWishlisted ? 'text-rose-500 bg-rose-50' : 'text-gray-500 hover:bg-white hover:text-rose-500'
                    }`}
                    title="Save to wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Review Jump Link */}
              <div className="flex items-center gap-3 mt-2 text-xs">
                <a
                  href="#reviews-section"
                  className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-bold text-amber-900 hover:opacity-90"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating?.toFixed(1)}</span>
                </a>
                <a
                  href="#reviews-section"
                  className="text-gray-500 hover:text-luxury-accent underline underline-offset-2 font-medium"
                >
                  {product.reviews?.length || product.reviewCount || 0} Customer Reviews
                </a>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-600 font-bold">✓ Verified Quality</span>
              </div>
            </div>

            {/* Price & Discounts Block */}
            <div className="p-4 rounded-3xl bg-white border border-gray-100/90 shadow-2xs space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-black text-3xl text-luxury-dark">
                  ₹{displayPrice}
                </span>
                {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                  <span className="text-sm font-medium text-gray-400 line-through">
                    ₹{displayOriginalPrice}
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-black">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Inclusive of all taxes. Free doorstep express shipping.
              </p>
            </div>

            {/* Color Swatch Selection */}
            {allColors.length > 0 && (
              <ColorSelector
                colors={allColors}
                selectedColor={selectedColor}
                onSelectColor={handleColorChange}
              />
            )}

            {/* Size Selector with Guide Modal */}
            <SizeSelector
              allSizes={allSizes}
              availableSizesForColor={availableSizesForSelectedColor}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              gender={product.gender}
            />

            {/* Stock Status Indicator */}
            <div>
              {isOutOfStock ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                  <span>This size/color combination is currently out of stock.</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>Only {availableStock} pairs remaining in this size!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
                  <Check className="w-4 h-4" />
                  <span>In Stock — Ready for immediate dispatch</span>
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Quantity row */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Quantity:
                </span>
                <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 shadow-2xs">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center disabled:opacity-30 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= availableStock}
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center disabled:opacity-30 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Feedback toast banner */}
              {addFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                    addFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span>{addFeedback.text}</span>
                </div>
              )}

              {/* Primary Dual CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={isOutOfStock || isAdding}
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white hover:bg-luxury-warmWhite text-luxury-dark border-2 border-luxury-dark font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transform-gpu"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="flex-1 py-4 px-6 rounded-2xl bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 disabled:opacity-50 transform-gpu"
                >
                  <Zap className="w-4 h-4 text-luxury-accent group-hover:text-luxury-dark" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Order on WhatsApp Quick Button */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleOrderOnWhatsApp}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transform-gpu"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </button>
            </div>

            {/* PIN Code Delivery Checker */}
            <DeliveryChecker />

            {/* Slipper Feature Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-700">
              <div className="p-3 bg-white rounded-2xl border border-gray-100 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-luxury-accent shrink-0" />
                <span className="font-semibold">Arch Alignment Sole</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-gray-100 flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-luxury-accent shrink-0" />
                <span className="font-semibold">Free Express Shipping</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-gray-100 flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-luxury-accent shrink-0" />
                <span className="font-semibold">7-Day Easy Exchange</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-gray-100 flex items-center gap-2.5">
                <Award className="w-4 h-4 text-luxury-accent shrink-0" />
                <span className="font-semibold">100% Skin-Friendly EVA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections: Description, Specs, Reviews */}
        <div className="pt-12 border-t border-gray-200/80 space-y-12">
          {/* About This Slipper Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100/90 shadow-sm space-y-4">
            <h3 className="font-display font-black text-xl text-luxury-dark">
              About The {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              {product.description}
            </p>
            {product.shortDescription && (
              <p className="text-xs text-gray-500 font-medium italic">
                "{product.shortDescription}"
              </p>
            )}
          </div>

          {/* Structured Specifications Table */}
          <ProductSpecifications product={product} />

          {/* Customer Reviews Section */}
          <ProductReviewsSection
            productId={product.id}
            reviews={product.reviews || []}
            rating={product.rating || 5.0}
            reviewCount={product.reviewCount || 0}
            onReviewAdded={loadProduct}
          />

          {/* Related Slippers ("You May Also Like") */}
          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-luxury-accent">
                    Complete The Look
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-luxury-dark mt-1">
                    You May Also Like
                  </h3>
                </div>
                <Link
                  to={`/shop?category=${product.category?.slug}`}
                  className="text-xs font-bold text-luxury-dark hover:text-luxury-accent flex items-center gap-1"
                >
                  View More <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {product.relatedProducts.map((rel) => (
                  <ProductCard key={rel.id} product={rel} />
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed Slippers (LIFO from localStorage) */}
          {recentlyViewed && recentlyViewed.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Browsing History
              </span>
              <h3 className="font-display font-black text-xl text-luxury-dark">
                Recently Viewed Slippers
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentlyViewed.map((item) => (
                  <Link
                    key={item.id}
                    to={`/products/${item.slug}`}
                    className="p-3 bg-white rounded-3xl border border-gray-100 shadow-2xs hover:shadow-md transition-all group"
                  >
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 mb-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="font-display font-bold text-xs text-gray-900 truncate group-hover:text-luxury-accent">
                      {item.name}
                    </p>
                    <p className="font-black text-xs text-luxury-dark mt-1">₹{item.price}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Purchase Bar */}
      <MobilePurchaseBar
        price={displayPrice}
        originalPrice={displayOriginalPrice}
        isAvailable={!isOutOfStock}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isAdding={isAdding}
      />

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default ProductDetails;
