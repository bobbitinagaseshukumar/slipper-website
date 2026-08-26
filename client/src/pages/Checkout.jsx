import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  CheckCircle,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowRight,
  Loader2,
  AlertCircle,
  Tag,
  ShoppingBag,
  RotateCcw,
  Edit2,
  MessageSquare,
  Copy,
  ExternalLink,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import addressService from '../services/addressService';
import couponService from '../services/couponService';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';
import AddressModal from '../components/checkout/AddressModal';

const Checkout = () => {
  const { settings } = useStoreSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, subtotal, itemCount, clearCart } = useCart();
  const { user } = useAuth();

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Coupon state
  const initialCoupon = location.state?.appliedCoupon || null;
  const [appliedCoupon, setAppliedCoupon] = useState(initialCoupon);
  const [couponCode, setCouponCode] = useState(initialCoupon?.code || '');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Checkout ordering option: 'ONLINE' (Razorpay) | 'WHATSAPP' | 'COD'
  const [checkoutOption, setCheckoutOption] = useState('ONLINE');
  const [notes, setNotes] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [checkoutError, setCheckoutError] = useState(null);

  // WhatsApp popup fallback modal
  const [whatsappFallback, setWhatsappFallback] = useState(null);
  const [copiedFallback, setCopiedFallback] = useState(false);

  // Fetch Saved Addresses
  const loadAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await addressService.getAddresses();
      if (res?.data) {
        setAddresses(res.data);
        const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
        if (defaultAddr && !selectedAddressId) {
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Redirect if bag is empty
  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items, navigate]);

  // Delivery & Price Calculation
  const freeThreshold = settings.freeShippingThreshold || 999;
  const standardFee = settings.standardShippingFee || 99;
  const deliveryFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : standardFee;
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);

  // Apply Coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await couponService.validateCoupon(couponCode, subtotal);
      if (res?.data) {
        setAppliedCoupon(res.data);
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // 1. Razorpay Online Payment Flow
  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setStatusMessage('Connecting to secure payment gateway...');
    setCheckoutError(null);

    try {
      // Step A: Load Razorpay script
      const isScriptLoaded = await paymentService.loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Step B: Get public key
      const configRes = await paymentService.getPaymentConfig();
      const razorpayKey = configRes?.data?.keyId || 'rzp_test_mock_key';

      // Step C: Create authoritative Razorpay order on backend
      setStatusMessage('Validating bag prices and preparing order...');
      const orderRes = await paymentService.createRazorpayOrder({
        addressId: selectedAddressId,
        couponCode: appliedCoupon?.code || undefined,
        notes: notes.trim() || undefined,
      });

      const { razorpayOrderId, amountInPaise, orderNumber, items } = orderRes.data;

      // Step D: Open Razorpay Checkout Modal
      const options = {
        key: razorpayKey,
        amount: amountInPaise,
        currency: 'INR',
        name: 'AuraSole Footwear',
        description: `Order #${orderNumber} — Slipper Luxury Collection`,
        image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=200',
        order_id: razorpayOrderId,
        handler: async (response) => {
          setStatusMessage('Verifying payment signature with bank...');
          try {
            // Step E: Verify signature cryptographically on backend
            const verifyRes = await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderNumber,
              addressId: selectedAddressId,
              couponCode: appliedCoupon?.code || undefined,
              notes: notes.trim() || undefined,
            });

            if (clearCart) clearCart();

            navigate(`/order-success/${orderNumber}`, {
              state: {
                orderData: {
                  orderNumber,
                  finalAmount: finalTotal,
                  paymentMethod: 'RAZORPAY',
                  paymentStatus: 'PAID',
                  status: 'CONFIRMED',
                  itemsCount: itemCount,
                  items,
                },
              },
              replace: true,
            });
          } catch (verifyErr) {
            setCheckoutError(verifyErr.message || 'Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#121417',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setStatusMessage('');
            setCheckoutError('Payment was cancelled. You can try again or select another payment option.');
          },
        },
      };

      // Mock Mode Fallback (if using mock key without real Razorpay popup)
      if (razorpayOrderId.startsWith('order_mock_')) {
        setTimeout(async () => {
          try {
            await paymentService.verifyPayment({
              razorpayOrderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
              razorpaySignature: 'mock_signature',
              orderNumber,
              addressId: selectedAddressId,
              couponCode: appliedCoupon?.code || undefined,
              notes: notes.trim() || undefined,
            });

            if (clearCart) clearCart();

            navigate(`/order-success/${orderNumber}`, {
              state: {
                orderData: {
                  orderNumber,
                  finalAmount: finalTotal,
                  paymentMethod: 'RAZORPAY',
                  paymentStatus: 'PAID',
                  status: 'CONFIRMED',
                  itemsCount: itemCount,
                },
              },
              replace: true,
            });
          } catch (e) {
            setCheckoutError(e.message);
            setIsProcessing(false);
          }
        }, 1200);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setIsProcessing(false);
        setCheckoutError(`Payment failed: ${response.error?.description || 'Transaction declined by bank'}`);
      });
      rzp.open();
    } catch (err) {
      setCheckoutError(err.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // 2. WhatsApp Order Flow
  const handleWhatsAppOrder = async () => {
    setIsProcessing(true);
    setStatusMessage('Creating WhatsApp order request and preparing message...');
    setCheckoutError(null);

    try {
      const res = await orderService.createWhatsAppOrder({
        addressId: selectedAddressId,
        couponCode: appliedCoupon?.code || undefined,
        notes: notes.trim() || undefined,
        customerName: user?.name,
        customerEmail: user?.email,
        whatsappNumber: user?.phone || user?.whatsappNumber,
      });

      const { orderNumber, whatsappUrl, whatsappMessage, finalAmount } = res.data;

      // Attempt to open WhatsApp in a new tab
      const win = window.open(whatsappUrl, '_blank');

      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Pop-up was blocked by browser -> show fallback modal
        setWhatsappFallback({ orderNumber, whatsappUrl, whatsappMessage });
      }

      // Navigate to order confirmation page with WhatsApp state
      navigate(`/order-success/${orderNumber}`, {
        state: {
          orderData: {
            orderNumber,
            finalAmount,
            paymentMethod: 'WHATSAPP',
            paymentStatus: 'PENDING',
            status: 'WHATSAPP_PENDING',
            isWhatsAppOrder: true,
            whatsappUrl,
            whatsappMessage,
            itemsCount: itemCount,
          },
        },
        replace: true,
      });
    } catch (err) {
      setCheckoutError(err.message || 'Failed to create WhatsApp order. Please try again.');
      setIsProcessing(false);
    }
  };

  // 3. Cash on Delivery (COD) Flow
  const handleCodOrder = async () => {
    setIsProcessing(true);
    setStatusMessage('Confirming Cash on Delivery order...');
    setCheckoutError(null);

    try {
      const res = await orderService.createOrder({
        addressId: selectedAddressId,
        paymentMethod: 'COD',
        couponCode: appliedCoupon?.code || undefined,
        notes: notes.trim() || undefined,
      });

      if (res?.data?.orderNumber) {
        if (clearCart) clearCart();
        navigate(`/order-success/${res.data.orderNumber}`, {
          state: { orderData: res.data },
          replace: true,
        });
      }
    } catch (err) {
      setCheckoutError(err.message || 'Unable to place order. Please check your connection.');
      setIsProcessing(false);
    }
  };

  // Primary Dispatcher based on chosen option
  const handleProceedCheckout = () => {
    if (!selectedAddressId) {
      setCheckoutError('Please select or add a delivery address first.');
      return;
    }

    if (checkoutOption === 'ONLINE') {
      handleRazorpayPayment();
    } else if (checkoutOption === 'WHATSAPP') {
      handleWhatsAppOrder();
    } else {
      handleCodOrder();
    }
  };

  const breadcrumbs = [
    { label: 'Shopping Bag', link: '/cart' },
    { label: 'Secure Checkout' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Title */}
        <div className="pb-6 border-b border-gray-100 mb-8">
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-luxury-dark tracking-tight">
            {settings.checkoutTitle || 'Select Your Ordering Method'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {settings.checkoutInstructions || 'Choose between instant online payment or ordering directly with our store owner via WhatsApp.'}
          </p>
        </div>

        {checkoutError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{checkoutError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Address, Items & Checkout Options */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-luxury-dark text-luxury-accent font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h2 className="font-display font-bold text-base text-luxury-dark uppercase tracking-wider">
                    Select Delivery Address
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAddressToEdit(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="text-xs font-bold text-luxury-accent hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              {isLoadingAddresses ? (
                <div className="py-6 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-luxury-accent" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-luxury-dark bg-luxury-warmWhite/60 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-display font-bold text-xs text-gray-900">
                            {addr.fullName}
                          </span>
                          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {addr.addressType || 'Home'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        </p>
                        <p className="text-xs text-gray-600">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Phone: {addr.phone}</p>

                        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-luxury-accent flex items-center gap-1">
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 fill-current" />}
                            {isSelected ? 'Delivering Here' : 'Select'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddressToEdit(addr);
                              setIsAddressModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded-md"
                            title="Edit Address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-600 mb-3">You don't have any saved address yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressToEdit(null);
                      setIsAddressModalOpen(true);
                    }}
                    className="px-5 py-2 bg-luxury-dark text-white rounded-xl text-xs font-bold hover:bg-luxury-accent"
                  >
                    + Add New Delivery Address
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: How would you like to order? (Checkout Options) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="w-7 h-7 rounded-xl bg-luxury-dark text-luxury-accent font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h2 className="font-display font-bold text-base text-luxury-dark uppercase tracking-wider">
                  How would you like to order?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* OPTION 1: PAY ONLINE (RAZORPAY) */}
                <div
                  onClick={() => setCheckoutOption('ONLINE')}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    checkoutOption === 'ONLINE'
                      ? 'border-luxury-dark bg-stone-900 text-white shadow-xl scale-[1.01]'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          checkoutOption === 'ONLINE'
                            ? 'bg-luxury-accent text-luxury-dark'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          checkoutOption === 'ONLINE'
                            ? 'bg-white/10 text-luxury-accent'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        Instant & Secure
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-black text-sm sm:text-base">
                        💳 Pay Online
                      </h3>
                      <p
                        className={`text-xs mt-1 ${
                          checkoutOption === 'ONLINE' ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        Secure payment with Razorpay (UPI, GPay, PhonePe, Cards, NetBanking).
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        checkoutOption === 'ONLINE' ? 'text-luxury-accent' : 'text-gray-400'
                      }`}
                    >
                      {checkoutOption === 'ONLINE' ? '● Selected Option' : 'Click to Select'}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        checkoutOption === 'ONLINE'
                          ? 'border-luxury-accent bg-luxury-accent'
                          : 'border-gray-300'
                      }`}
                    >
                      {checkoutOption === 'ONLINE' && (
                        <div className="w-2 h-2 rounded-full bg-luxury-dark" />
                      )}
                    </div>
                  </div>
                </div>

                {/* OPTION 2: ORDER ON WHATSAPP */}
                <div
                  onClick={() => setCheckoutOption('WHATSAPP')}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    checkoutOption === 'WHATSAPP'
                      ? 'border-emerald-600 bg-emerald-950 text-white shadow-xl scale-[1.01]'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          checkoutOption === 'WHATSAPP'
                            ? 'bg-emerald-400 text-emerald-950'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          checkoutOption === 'WHATSAPP'
                            ? 'bg-white/10 text-emerald-300'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        Direct Chat
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-black text-sm sm:text-base">
                        💬 Order on WhatsApp
                      </h3>
                      <p
                        className={`text-xs mt-1 ${
                          checkoutOption === 'WHATSAPP' ? 'text-emerald-100' : 'text-gray-500'
                        }`}
                      >
                        Send your prepared order directly to our store WhatsApp and chat with us.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        checkoutOption === 'WHATSAPP' ? 'text-emerald-300' : 'text-gray-400'
                      }`}
                    >
                      {checkoutOption === 'WHATSAPP' ? '● Selected Option' : 'Click to Select'}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        checkoutOption === 'WHATSAPP'
                          ? 'border-emerald-400 bg-emerald-400'
                          : 'border-gray-300'
                      }`}
                    >
                      {checkoutOption === 'WHATSAPP' && (
                        <div className="w-2 h-2 rounded-full bg-emerald-950" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional COD toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutOption(checkoutOption === 'COD' ? 'ONLINE' : 'COD')}
                  className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    checkoutOption === 'COD' ? 'text-luxury-accent font-bold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>
                    {checkoutOption === 'COD'
                      ? '✓ Cash on Delivery Selected'
                      : 'Or pay cash on delivery (COD)?'}
                  </span>
                </button>
              </div>

              {/* Delivery Notes / Gate Instructions */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Delivery Notes / Gate Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave with security or ring doorbell"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                />
              </div>
            </div>

            {/* Step 3: Review Slipper Items */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-luxury-dark text-luxury-accent font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h2 className="font-display font-bold text-base text-luxury-dark uppercase tracking-wider">
                    Review Slipper Items ({itemCount})
                  </h2>
                </div>

                <Link
                  to="/cart"
                  className="text-xs font-bold text-luxury-accent hover:underline flex items-center gap-1"
                >
                  Edit Bag <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=150'}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-display font-bold text-xs text-gray-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {item.color && `${item.color} • `}Size UK {item.size} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <span className="font-black text-xs text-luxury-dark shrink-0">
                      ₹{item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Action Buttons */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            {/* Coupon Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-luxury-accent" />
                <span>Coupon Code</span>
              </div>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-800">
                      Code: {appliedCoupon.code}
                    </p>
                    <p className="text-[11px] text-emerald-600">
                      ₹{appliedCoupon.discountAmount} discount applied
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode('');
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="COMFORT15"
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
              {couponError && (
                <p className="text-[11px] font-semibold text-rose-600">{couponError}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-luxury-dark uppercase tracking-wider pb-3 border-b border-gray-100">
                Payment Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Doorstep Delivery</span>
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

              {/* Total Row */}
              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <div>
                  <span className="font-display font-black text-base text-luxury-dark block">
                    Total Amount
                  </span>
                  <span className="text-[10px] text-gray-400">All taxes included</span>
                </div>
                <span className="font-display font-black text-2xl text-luxury-dark">
                  ₹{finalTotal}
                </span>
              </div>

              {/* Primary Action Button */}
              {checkoutOption === 'ONLINE' ? (
                <button
                  type="button"
                  disabled={isProcessing || !selectedAddressId}
                  onClick={handleProceedCheckout}
                  className="w-full py-4 rounded-2xl bg-luxury-dark hover:bg-black text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 disabled:opacity-50 mt-2 transform-gpu shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{statusMessage || 'Preparing Secure Payment...'}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-luxury-accent" />
                      <span>Pay Securely (₹{finalTotal})</span>
                    </>
                  )}
                </button>
              ) : checkoutOption === 'WHATSAPP' ? (
                <button
                  type="button"
                  disabled={isProcessing || !selectedAddressId}
                  onClick={handleProceedCheckout}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{statusMessage || 'Creating WhatsApp Order...'}</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Order on WhatsApp (₹{finalTotal})</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isProcessing || !selectedAddressId}
                  onClick={handleProceedCheckout}
                  className="w-full py-4 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirm COD Order (₹{finalTotal})</span>
                  )}
                </button>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-500 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protected by 256-bit SSL encryption. 100% genuine slippers.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Address Form Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setAddressToEdit(null);
        }}
        addressToEdit={addressToEdit}
        onAddressSaved={async (saved) => {
          await loadAddresses();
          if (saved?.id) {
            setSelectedAddressId(saved.id);
          }
        }}
      />

      <Footer />
    </div>
  );
};

export default Checkout;
