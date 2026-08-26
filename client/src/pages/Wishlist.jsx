import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight, Star, Compass } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';
import QuickAddModal from '../components/product/QuickAddModal';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [selectedProductForAdd, setSelectedProductForAdd] = useState(null);

  const breadcrumbs = [{ label: 'Saved Wishlist' }];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-gray-100 mb-8">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-luxury-dark tracking-tight">
              My Saved Slippers
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
              Your favorite slippers and cloud comfort footwear saved for later.
            </p>
          </div>
          <span className="text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs w-fit">
            {wishlist.length} {wishlist.length === 1 ? 'Slipper' : 'Slippers'} Saved
          </span>
        </div>

        {wishlist && wishlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Container */}
                  <Link
                    to={`/products/${item.slug}`}
                    className="relative block w-full aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100"
                  >
                    <img
                      src={
                        item.images?.[0]?.url ||
                        item.image ||
                        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=400'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Remove Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-rose-500 hover:bg-rose-50 shadow-sm transition-all"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="pt-3 px-1">
                    <Link
                      to={`/products/${item.slug}`}
                      className="font-display font-bold text-xs sm:text-sm text-gray-900 line-clamp-1 hover:text-luxury-accent transition-colors block"
                      title={item.name}
                    >
                      {item.name}
                    </Link>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-black text-sm text-luxury-dark">₹{item.price}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Move to Bag Action */}
                <div className="pt-3 px-1">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForAdd(item)}
                    className="w-full py-2.5 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Select Size & Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Wishlist State */
          <div className="py-20 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mb-4 shadow-inner">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="font-display font-black text-2xl text-luxury-dark mb-1">
              Your Wishlist Is Empty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              Save your favorite slides, slippers, and orthopedic styles here by clicking the heart icon on any product!
            </p>
            <Link
              to="/shop"
              className="px-8 py-3.5 rounded-full bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Slipper Catalog</span>
            </Link>
          </div>
        )}
      </main>

      {/* Quick Add Modal for size/color selection */}
      {selectedProductForAdd && (
        <QuickAddModal
          product={selectedProductForAdd}
          isOpen={!!selectedProductForAdd}
          onClose={() => setSelectedProductForAdd(null)}
        />
      )}

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Wishlist;
