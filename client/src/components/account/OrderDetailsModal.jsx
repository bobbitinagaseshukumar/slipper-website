import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  ShoppingBag,
  Loader2,
  Star,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Phone,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import orderService from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import WriteReviewModal from '../reviews/WriteReviewModal';

const OrderDetailsModal = ({ order, isOpen, onClose, onOrderUpdated }) => {
  const { fetchCart } = useCart();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('Size did not fit');
  const [returnComments, setReturnComments] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState(null);

  // Server-Authoritative Cancellation Countdown Timer
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isCancellationExpired, setIsCancellationExpired] = useState(false);

  useEffect(() => {
    if (!order?.cancellationDeadline) {
      setIsCancellationExpired(false);
      return;
    }

    const deadline = new Date(order.cancellationDeadline).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeftStr('00:00:00');
        setIsCancellationExpired(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
        setIsCancellationExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [order?.cancellationDeadline]);

  if (!isOpen || !order) return null;

  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const isShippedOrLater = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status);
  const isEligibleForCancel = !isShippedOrLater && !isCancellationExpired;

  // Handle Customer Cancellation
  const handleCancelOrder = async () => {
    setActionError(null);
    setIsSubmittingCancel(true);
    try {
      await orderService.cancelOrder(order.orderNumber, cancelReason);
      setActionSuccess('Order cancelled successfully. Restocked inventory is now available.');
      if (onOrderUpdated) onOrderUpdated();
      setTimeout(() => {
        setIsCancelling(false);
        setActionSuccess(null);
      }, 2000);
    } catch (err) {
      setActionError(err.message || 'Cancellation period has ended or order cannot be cancelled.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Handle Return
  const handleRequestReturn = async () => {
    setActionError(null);
    setIsSubmittingReturn(true);
    try {
      await orderService.requestReturn(order.orderNumber, {
        reason: returnReason,
        comments: returnComments,
      });
      setActionSuccess('Return request submitted. Our team will verify and coordinate pickup.');
      if (onOrderUpdated) onOrderUpdated();
      setTimeout(() => {
        setIsReturning(false);
        setActionSuccess(null);
      }, 2000);
    } catch (err) {
      setActionError(err.message || 'Failed to request return.');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Handle Reorder
  const handleReorder = async () => {
    setActionError(null);
    setIsReordering(true);
    try {
      await orderService.reorder(order.orderNumber);
      await fetchCart();
      setActionSuccess('Items added to your shopping bag!');
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err) {
      setActionError(err.message || 'Unable to reorder items.');
    } finally {
      setIsReordering(false);
    }
  };

  // Safe Address Snapshot Parsing
  let shippingAddr = null;
  if (order.deliveryAddressSnapshot) {
    try {
      shippingAddr = typeof order.deliveryAddressSnapshot === 'string'
        ? (order.deliveryAddressSnapshot.trim().startsWith('{') ? JSON.parse(order.deliveryAddressSnapshot) : { fullName: order.user?.name || 'Customer', addressLine1: order.deliveryAddressSnapshot })
        : order.deliveryAddressSnapshot;
    } catch {
      shippingAddr = { fullName: order.user?.name || 'Customer', addressLine1: String(order.deliveryAddressSnapshot) };
    }
  }
  if (!shippingAddr) {
    shippingAddr = order.address;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-black text-xl text-luxury-dark">
                Order #{order.orderNumber}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : order.status === 'APPROVED'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : order.status === 'SHIPPED'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : order.status === 'CANCELLED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {actionSuccess && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-bold animate-in fade-in flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Server-Authoritative Cancellation Countdown Banner */}
        {!isShippedOrLater && order.cancellationDeadline && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              isCancellationExpired
                ? 'bg-stone-50 border-stone-200 text-stone-600'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Timer className={`w-5 h-5 shrink-0 ${isCancellationExpired ? 'text-stone-400' : 'text-amber-600 animate-pulse'}`} />
              <div>
                <p className="font-bold">
                  {isCancellationExpired
                    ? 'Cancellation Window Closed'
                    : `Order Cancellation Available Until: ${new Date(order.cancellationDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </p>
                <p className="text-[11px] text-gray-500">
                  {isCancellationExpired
                    ? 'Your footwear order has been approved and is scheduled for shipment.'
                    : 'You can cancel with full refund before the countdown expires.'}
                </p>
              </div>
            </div>

            {!isCancellationExpired && (
              <div className="px-3 py-1 bg-amber-100 text-amber-950 font-mono font-black text-xs rounded-xl border border-amber-300 shrink-0">
                {timeLeftStr}
              </div>
            )}
          </div>
        )}

        {/* Live Tracking Timeline */}
        {!isCancelled ? (
          <div className="p-4 sm:p-5 rounded-3xl bg-luxury-warmWhite/80 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-luxury-accent" />
                <span>Live Order Timeline</span>
              </h4>
              {order.trackingNumber && (
                <div className="flex items-center gap-1.5 text-xs text-luxury-accent font-bold">
                  <span>Tracking: {order.trackingNumber}</span>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline inline-flex items-center gap-0.5 text-[11px]"
                    >
                      Track Package <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Stepper Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              {[
                { label: 'Order Placed', step: 1, active: true },
                { label: 'Approved', step: 2, active: ['APPROVED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
                { label: 'Shipped', step: 3, active: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
                { label: 'Delivered', step: 4, active: order.status === 'DELIVERED' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      s.active
                        ? 'bg-luxury-dark text-luxury-accent shadow-xs'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {s.active ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      s.active ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Expected Delivery & Shipping Dates */}
            {(order.expectedDeliveryDate || order.shippingDate) && (
              <div className="pt-2 border-t border-gray-200/60 flex flex-wrap gap-4 text-xs text-gray-600">
                {order.shippingDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-luxury-accent" />
                    <span>Dispatched: <strong>{new Date(order.shippingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></span>
                  </div>
                )}
                {order.expectedDeliveryDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Expected Delivery: <strong className="text-emerald-700">{new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>This order was cancelled.</span>
            </div>
            {order.cancellationReason && (
              <p className="text-[11px] text-rose-700 pl-6">Reason: {order.cancellationReason}</p>
            )}
          </div>
        )}

        {/* Slippers Purchased List */}
        <div className="space-y-3">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-700">
            Slippers in Order ({order.items?.length || 0})
          </h4>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl p-2 bg-white shadow-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      item.productImage ||
                      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=120'
                    }
                    alt={item.productName}
                    className="w-14 h-14 rounded-2xl object-cover bg-stone-100 border border-gray-200 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Color: <strong>{item.color || 'Standard'}</strong> • Size: <strong>UK {item.size || 'Standard'}</strong> • Qty: <strong>{item.quantity}</strong>
                    </p>
                    <p className="text-[11px] font-mono text-gray-400">Unit Price: ₹{item.unitPrice}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="font-black text-sm text-luxury-dark">₹{item.totalPrice}</span>
                  {/* Review Button strictly allowed only on DELIVERED */}
                  {order.status === 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => setReviewingProduct(item.product || { id: item.productId, name: item.productName, images: item.product?.images })}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-colors border border-amber-200/60 shadow-xs"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>Write Review</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address & Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Address Snapshot */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-gray-800">
              <MapPin className="w-3.5 h-3.5 text-luxury-accent" />
              <span>Historical Delivery Address</span>
            </div>
            {shippingAddr && (
              <div className="text-gray-600 space-y-0.5 pt-1">
                <p className="font-semibold text-gray-900">{shippingAddr.fullName}</p>
                <p>{shippingAddr.addressLine1}</p>
                {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
                <p>
                  {shippingAddr.city}, {shippingAddr.state} — {shippingAddr.postalCode}
                </p>
                <p className="text-[11px] text-gray-500">Mobile: {shippingAddr.phone}</p>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied:</span>
                <span className="font-bold">-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee:</span>
              <span className="font-bold">
                {order.shippingAmount === 0 ? 'FREE' : `₹${order.shippingAmount}`}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-black text-base text-luxury-dark">
              <span>Total:</span>
              <span className="text-luxury-accent">₹{order.finalAmount}</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 pt-1">
              <span>Payment Method:</span>
              <span className="font-bold text-gray-700">{order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap gap-2 justify-end border-t border-gray-100">
          {/* Reorder Button */}
          <button
            type="button"
            disabled={isReordering}
            onClick={handleReorder}
            className="px-4 py-2 bg-luxury-warmWhite hover:bg-gray-100 text-luxury-dark border border-gray-300 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {isReordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            <span>Buy Again</span>
          </button>

          {/* Cancel Button */}
          {isEligibleForCancel && !isCancelling && (
            <button
              type="button"
              onClick={() => setIsCancelling(true)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-2xl transition-colors"
            >
              Cancel Order
            </button>
          )}

          {/* Return Button */}
          {isDelivered && !isReturning && (
            <button
              type="button"
              onClick={() => setIsReturning(true)}
              className="px-4 py-2 bg-luxury-dark text-white hover:bg-luxury-accent hover:text-luxury-dark font-bold text-xs rounded-2xl transition-colors flex items-center gap-1 shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>7-Day Return</span>
            </button>
          )}
        </div>

        {/* Cancellation Confirmation Box */}
        {isCancelling && (
          <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in">
            <h5 className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Are you sure you want to cancel this order?</span>
            </h5>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none"
            >
              <option value="Changed my mind">Changed my mind</option>
              <option value="Ordered wrong size/color">Ordered wrong size/color</option>
              <option value="Found alternative footwear">Found alternative footwear</option>
              <option value="Delivery duration too long">Delivery duration too long</option>
              <option value="Other reason">Other reason</option>
            </select>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsCancelling(false)}
                className="px-4 py-2 bg-white text-gray-700 rounded-xl text-xs font-bold border border-gray-200"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow"
              >
                {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}

        {/* Return Request Box */}
        {isReturning && (
          <div className="p-4 sm:p-5 rounded-3xl bg-luxury-warmWhite border border-gray-200 space-y-3 animate-in fade-in">
            <h5 className="font-bold text-xs text-luxury-dark">7-Day Doorstep Return Request</h5>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800"
            >
              <option value="Size did not fit">Size did not fit</option>
              <option value="Defective or damaged sole">Defective or damaged sole</option>
              <option value="Received wrong model/color">Received wrong model/color</option>
              <option value="Not satisfied with comfort">Not satisfied with comfort</option>
            </select>
            <textarea
              rows={2}
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              placeholder="Additional feedback for our footwear team..."
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsReturning(false)}
                className="px-4 py-2 bg-white text-gray-700 rounded-xl text-xs font-bold border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReturn}
                onClick={handleRequestReturn}
                className="px-4 py-2 bg-luxury-dark text-white rounded-xl text-xs font-bold hover:bg-luxury-accent hover:text-luxury-dark transition-colors"
              >
                {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rate & Review Modal strictly for Delivered Orders */}
      {reviewingProduct && (
        <WriteReviewModal
          isOpen={!!reviewingProduct}
          onClose={() => setReviewingProduct(null)}
          product={reviewingProduct}
          orderId={order.id}
          onReviewSubmitted={() => {
            setReviewingProduct(null);
            if (onOrderUpdated) onOrderUpdated();
          }}
        />
      )}
    </div>
  );
};

export default OrderDetailsModal;
