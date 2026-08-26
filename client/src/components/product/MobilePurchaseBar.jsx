import React from 'react';
import { ShoppingBag, Zap } from 'lucide-react';

const MobilePurchaseBar = ({
  price,
  originalPrice,
  isAvailable = true,
  onAddToCart,
  onBuyNow,
  isAdding = false,
}) => {
  return (
    <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 p-3 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Price Snapshot */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-black text-lg text-luxury-dark">₹{price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-[11px] text-gray-400 line-through">₹{originalPrice}</span>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">✓ Free Delivery</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            type="button"
            disabled={!isAvailable || isAdding}
            onClick={onAddToCart}
            className="flex-1 py-2.5 px-3 bg-luxury-warmWhite hover:bg-gray-100 text-luxury-dark border border-gray-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-98 disabled:opacity-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Added!' : 'Add to Bag'}</span>
          </button>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={onBuyNow}
            className="flex-1 py-2.5 px-3 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-98 disabled:opacity-50 shadow-md"
          >
            <Zap className="w-3.5 h-3.5 text-luxury-accent" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePurchaseBar;
