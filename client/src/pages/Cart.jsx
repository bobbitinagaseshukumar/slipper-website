import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Heart,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import couponService from '../services/couponService';

import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Cart = () => {
  const { cart, itemCount, subtotal, originalSubtotal, savings, updateQuantity, removeItem } = useCart();
  const { toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);

  // Delivery calculation: Free for ₹999+, else ₹49
  const deliveryFee = subtotal >= 999 || subtotal === 0 ? 0 : 49;
  const freeShippingThreshold = 999;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);

  // Apply Coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await couponService.validateCoupon(couponCode, subtotal);
      if (res?.data) {
        setAppliedCoupon(res.data);
        setCouponSuccess(`Coupon "${res.data.code}" applied! You saved ₹${res.data.discountAmount}`);
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Move to Wishlist
  const handleMoveToWishlist = async (item) => {
    toggleWishlist({ id: item.productId, name: item.productName, price: item.unitPrice, image: item.image, slug: item.slug });
    await removeItem(item.id);
  };

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout', { state: { appliedCoupon } });
    }
  };

  const breadcrumbs = [{ label: 'Shopping Bag' }];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Title & Items Counter */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-gray-100 mb-8">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-luxury-dark tracking-tight">
              Shopping Bag
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
              Review your selected slippers before stepping into checkout.
            </p>
          </div>
          <span className="text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs w-fit">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'} in Bag
          </span>
        </div>

        {cart.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Goal Bar */}
              <div className="p-4 rounded-3xl bg-white border border-gray-100/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-luxury-dark flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-luxury-accent" />
                    {amountNeededForFreeShipping === 0 ? (
                      <span className="text-emerald-700 font-bold">
                        🎉 Congratulations! You have unlocked Free Express Delivery!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-luxury-dark">₹{amountNeededForFreeShipping}</strong> more to unlock <strong className="text-emerald-700">Free Express Delivery</strong>
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${freeShippingProgress}%` }}
                    className="h-full bg-luxury-accent rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100/90 shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between transition-all hover:shadow-md"
                  >
                    {/* Thumbnail & Title */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Link
                        to={`/products/${item.slug}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 border border-gray-100 shrink-0 block"
                      >
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=200'}
                          alt={item.productName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/products/${item.slug}`}
                          className="font-display font-bold text-sm sm:text-base text-gray-900 hover:text-luxury-accent transition-colors block truncate"
                        >
                          {item.productName}
                        </Link>

                        {/* Variant Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-600 font-medium">
                          {item.color && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                              Color: {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                              Size UK {item.size}
                            </span>
                          )}
                        </div>

                        {/* Price Unit */}
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="font-black text-sm text-luxury-dark">
                            ₹{item.unitPrice}
                          </span>
                          {item.originalPrice && item.originalPrice > item.unitPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{item.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector & Item Total Row */}
                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-xl bg-white hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 transition-colors shadow-2xs"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= (item.stockAvailable || 20)}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-xl bg-white hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 transition-colors shadow-2xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="text-right">
                        <span className="font-display font-black text-base text-luxury-dark block">
                          ₹{item.totalPrice}
                        </span>
                      </div>

                      {/* Remove & Wishlist Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveToWishlist(item)}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Move to Saved Wishlist"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove from Bag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="text-xs font-bold text-luxury-accent hover:underline inline-flex items-center gap-1"
                >
                  ← Continue Shopping for Slippers
                </Link>
              </div>
            </div>

            {/* Right Column: Sticky Order Summary & Coupon */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              {/* Coupon Code Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-luxury-accent" />
                  <span>Apply Coupon Code</span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-800">
                        Code: {appliedCoupon.code}
                      </p>
                      <p className="text-[11px] text-emerald-600">
                        ₹{appliedCoupon.discountAmount} savings applied
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. COMFORT15"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs uppercase font-bold text-gray-800 focus:outline-none focus:border-luxury-accent"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-luxury-dark text-white rounded-2xl text-xs font-bold hover:bg-luxury-accent hover:text-luxury-dark transition-colors disabled:opacity-50 shrink-0"
                    >
                      {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </form>
                )}

                {couponSuccess && (
                  <p className="text-[11px] font-semibold text-emerald-600">{couponSuccess}</p>
                )}
                {couponError && (
                  <p className="text-[11px] font-semibold text-rose-600">{couponError}</p>
                )}
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-base text-luxury-dark uppercase tracking-wider pb-3 border-b border-gray-100">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Bag Subtotal</span>
                    <span className="font-bold text-gray-900">₹{subtotal}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Store Promotion Savings</span>
                      <span className="font-bold">-₹{savings}</span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span className="font-bold">-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Doorstep Delivery</span>
                    <span className="font-bold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700 uppercase font-black text-[11px]">
                          Free
                        </span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>
                </div>

                {/* Final Total */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <div>
                    <span className="font-display font-black text-base text-luxury-dark block">
                      Total Payable
                    </span>
                    <span className="text-[10px] text-gray-400">Inclusive of all taxes</span>
                  </div>
                  <span className="font-display font-black text-2xl text-luxury-dark">
                    ₹{finalTotal}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 rounded-2xl bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group mt-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-luxury-accent" />
                    <span>100% Safe Payments</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-luxury-accent" />
                    <span>7-Day Doorstep Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="py-20 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-luxury-warmWhite text-gray-400 flex items-center justify-center mb-4 shadow-inner">
              <ShoppingBag className="w-10 h-10 text-luxury-accent" />
            </div>
            <h2 className="font-display font-black text-2xl text-luxury-dark mb-1">
              Your Shopping Bag Is Empty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              Explore our doctor-approved orthopedic slides, high-density memory foam, and luxury slippers designed for everyday cloud comfort.
            </p>
            <Link
              to="/shop"
              className="px-8 py-3.5 rounded-full bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center gap-2"
            >
              <span>Explore Slipper Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Cart;
