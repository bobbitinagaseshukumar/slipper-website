import React, { useState } from 'react';
import { X, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickAddModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const { name, price, originalPrice, discountPercentage, images = [], variants = [], slug } = product;

  // Collect unique sizes and colors
  const sizeList = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))).sort(
    (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0)
  );

  const colorMap = new Map();
  variants.forEach((v) => {
    if (v.colorName && !colorMap.has(v.colorName)) {
      colorMap.set(v.colorName, v.colorCode || '#1A1A1A');
    }
  });
  const colorList = Array.from(colorMap.entries());

  const [selectedSize, setSelectedSize] = useState(sizeList[0] || '8');
  const [selectedColor, setSelectedColor] = useState(colorList[0]?.[0] || 'Default');
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  const primaryImage = images[0]?.url || 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Snapshot */}
        <div className="flex gap-4 items-center pb-4 border-b border-gray-100">
          <img
            src={primaryImage}
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover bg-stone-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-sm text-gray-900 truncate">{name}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base font-black text-luxury-dark">₹{price}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
              )}
              {discountPercentage > 0 && (
                <span className="text-[10px] text-emerald-600 font-bold">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Size Selection */}
        <div className="py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Select Size (UK/India)
            </span>
            <Link
              to={`/products/${slug}`}
              onClick={onClose}
              className="text-[11px] font-semibold text-luxury-accent hover:underline"
            >
              Size Guide
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeList.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                  selectedSize === size
                    ? 'bg-luxury-dark text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        {colorList.length > 0 && (
          <div className="pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
              Select Color: <span className="text-luxury-accent font-semibold">{selectedColor}</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {colorList.map(([colorName, colorCode]) => (
                <button
                  key={colorName}
                  type="button"
                  onClick={() => setSelectedColor(colorName)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    selectedColor === colorName
                      ? 'border-luxury-dark bg-luxury-warmWhite shadow-xs font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span
                    style={{ backgroundColor: colorCode }}
                    className="w-3.5 h-3.5 rounded-full border border-gray-300"
                  />
                  <span>{colorName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isAdded ? (
            <div className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg animate-in zoom-in-95">
              <Check className="w-4 h-4" /> Added to Shopping Bag!
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark rounded-2xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Bag — ₹{price}
            </button>
          )}

          <div className="text-center mt-3">
            <Link
              to={`/products/${slug}`}
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-luxury-dark font-medium inline-flex items-center gap-1"
            >
              View complete product specs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
