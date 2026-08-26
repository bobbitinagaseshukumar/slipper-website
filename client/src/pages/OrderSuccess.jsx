import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
  Loader2,
  MessageSquare,
  Copy,
  Check,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import orderService from '../services/orderService';
import { useStoreSettings } from '../context/StoreSettingsContext';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const OrderSuccess = () => {
  const { settings } = useStoreSettings();
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.orderData || null);
  const [isLoading, setIsLoading] = useState(!location.state?.orderData);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!order && orderNumber) {
        try {
          setIsLoading(true);
          const res = await orderService.getOrderByNumber(orderNumber);
          if (res?.data) {
            setOrder(res.data);
          }
        } catch (err) {
          console.error('Failed to load confirmed order:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();
  }, [orderNumber, order]);

  const handleCopyMessage = () => {
    const textToCopy = order?.whatsappMessage || `Hello ${settings.storeName || 'AuraSole'}, I would like to place order #${order?.orderNumber || orderNumber}. Total: ₹${order?.finalAmount || order?.totalAmount}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-luxury-accent" />
        </div>
        <Footer />
      </div>
    );
  }

  const isWhatsApp = order?.paymentMethod === 'WHATSAPP' || order?.isWhatsAppOrder;
  const shippingAddr = order?.shippingAddress || order?.address;

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100/90 shadow-xl space-y-8 animate-in zoom-in-95 duration-300 text-center">
          {/* Status Icon */}
          {isWhatsApp ? (
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <MessageSquare className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          )}

          <div>
            <span
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                isWhatsApp
                  ? 'text-emerald-800 bg-emerald-100 font-mono'
                  : 'text-emerald-700 bg-emerald-50 font-mono'
              }`}
            >
              {isWhatsApp ? 'WhatsApp Order Request Created' : 'Payment Verified & Order Confirmed 🎉'}
            </span>

            <h1 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark mt-3">
              {isWhatsApp
                ? 'Your WhatsApp Order Request Has Been Created'
                : 'Thank You For Your Slipper Order!'}
            </h1>

            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
              {isWhatsApp
                ? 'Please ensure you have sent the prepared message on WhatsApp. Our showroom team will confirm stock and dispatch your slippers.'
                : 'Your payment has been verified and our warehouse team is preparing your slippers for express delivery.'}
            </p>
          </div>

          {/* Key Order Info Box */}
          <div className="p-4 sm:p-6 rounded-2xl bg-luxury-warmWhite border border-gray-200/80 text-left grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-bold text-gray-500 block uppercase tracking-wider text-[10px]">
                Order Number
              </span>
              <span className="font-display font-black text-luxury-dark text-sm mt-0.5 block">
                #{order?.orderNumber || orderNumber}
              </span>
            </div>

            <div>
              <span className="font-bold text-gray-500 block uppercase tracking-wider text-[10px]">
                Payment Status
              </span>
              <span className="font-bold text-gray-900 mt-0.5 block flex items-center gap-1">
                {isWhatsApp ? (
                  <span className="text-amber-700">Awaiting Confirmation</span>
                ) : order?.paymentStatus === 'PAID' ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> Paid (Razorpay)
                  </span>
                ) : (
                  <span>Cash on Delivery (Pending)</span>
                )}
              </span>
            </div>

            <div>
              <span className="font-bold text-gray-500 block uppercase tracking-wider text-[10px]">
                Total Amount
              </span>
              <span className="font-display font-black text-luxury-accent text-sm mt-0.5 block">
                ₹{order?.finalAmount || order?.totalAmount}
              </span>
            </div>
          </div>

          {/* WhatsApp Specific Actions & Fallbacks */}
          {isWhatsApp && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>WhatsApp Message Ready</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Order Message</span>
                    </>
                  )}
                </button>
              </div>

              {order?.whatsappUrl && (
                <a
                  href={order.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open WhatsApp to Send Message</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Tip: If WhatsApp did not open automatically, click the button above or copy the message and send it to our store number.
              </p>
            </div>
          )}

          {/* Delivery Address */}
          {shippingAddr && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-gray-100 text-left flex items-start gap-3 text-xs">
              <MapPin className="w-4 h-4 text-luxury-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900">
                  Delivering to: {typeof shippingAddr === 'string' ? shippingAddr : `${shippingAddr.fullName} (${shippingAddr.phone})`}
                </p>
                {typeof shippingAddr !== 'string' && (
                  <p className="text-gray-600 mt-0.5">
                    {shippingAddr.addressLine1}
                    {shippingAddr.addressLine2 && `, ${shippingAddr.addressLine2}`}
                    {shippingAddr.city && `, ${shippingAddr.city}, ${shippingAddr.state} - ${shippingAddr.pincode || shippingAddr.postalCode}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Purchased Items List */}
          {order?.items && order.items.length > 0 && (
            <div className="text-left space-y-3 pt-2">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-700">
                Items in This Order
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl p-2 bg-white">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 px-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{item.productName}</p>
                      <p className="text-[11px] text-gray-500">
                        {item.color} • Size UK {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-luxury-dark">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Link
              to="/shop"
              className="px-6 py-3.5 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <Link
              to="/account"
              className="px-6 py-3.5 bg-luxury-warmWhite hover:bg-gray-100 text-luxury-dark border border-gray-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <span>View in My Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
