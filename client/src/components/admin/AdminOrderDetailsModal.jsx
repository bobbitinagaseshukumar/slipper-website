import React, { useState } from 'react';
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
  ExternalLink,
  ShieldCheck,
  Calendar,
  Phone,
  MessageSquare,
  AlertTriangle,
  User,
  CreditCard,
  Trash2,
} from 'lucide-react';
import adminService from '../../services/adminService';

const AdminOrderDetailsModal = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
  onOpenApprovalModal,
  showToast,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cancelReason, setCancelReason] = useState('Cancelled by admin request.');
  const [shippingCourier, setShippingCourier] = useState('Delhivery');
  const [shippingTracking, setShippingTracking] = useState('');
  const [isShippingPrompt, setIsShippingPrompt] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen || !order) return null;

  const handleDeleteOrder = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await adminService.deleteOrder(order.id);
      if (showToast) {
        showToast('success', `Order #${order.orderNumber} permanently deleted.`);
      }
      if (onOrderUpdated) onOrderUpdated();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete order.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async (newStatus, extraData = {}) => {
    setErrorMsg(null);
    setIsUpdatingStatus(true);
    try {
      await adminService.updateOrderStatus(order.id, {
        status: newStatus,
        ...extraData,
      });

      if (showToast) {
        showToast('success', `Order #${order.orderNumber} transitioned to ${newStatus}.`);
      }
      if (onOrderUpdated) onOrderUpdated();
      setIsShippingPrompt(false);
      setIsCancelling(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
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

  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const isPending = order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'WHATSAPP_PENDING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-stone-900 border border-stone-800 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 space-y-6 text-stone-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-display font-black text-xl text-white">
                Order #{order.orderNumber}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : order.status === 'APPROVED'
                    ? 'bg-blue-950 text-blue-400 border border-blue-800'
                    : order.status === 'SHIPPED'
                    ? 'bg-purple-950 text-purple-400 border border-purple-800'
                    : order.status === 'CANCELLED'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Received on {new Date(order.createdAt).toLocaleDateString('en-IN', {
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
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Customer & Address Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Customer Details */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-luxury-accent" /> Customer Profile
              </span>
              {order.user?.phone && (
                <a
                  href={`https://wa.me/${order.user.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900 font-bold text-[10px] flex items-center gap-1 border border-emerald-800"
                >
                  <MessageSquare className="w-3 h-3" /> WhatsApp
                </a>
              )}
            </div>
            <div className="space-y-1 pt-1 text-stone-300">
              <p className="font-bold text-sm text-white">{order.user?.name || 'Customer'}</p>
              <p className="text-stone-400">Email: {order.user?.email || 'N/A'}</p>
              <p className="text-stone-400">Mobile: {order.user?.phone || order.user?.whatsappNumber || 'N/A'}</p>
              {order.cancellationDeadline && (
                <p className="text-[11px] text-amber-400 font-bold pt-1">
                  Cancellation window until: {new Date(order.cancellationDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>

          {/* Historical Address Snapshot */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <span className="font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-luxury-accent" /> Frozen Delivery Address
            </span>
            {shippingAddr ? (
              <div className="space-y-0.5 pt-1 text-stone-400">
                <p className="font-bold text-white">{shippingAddr.fullName}</p>
                <p>{shippingAddr.addressLine1}</p>
                {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
                <p>
                  {shippingAddr.city}, {shippingAddr.state} — {shippingAddr.postalCode}
                </p>
                <p className="text-[11px] text-stone-500">Phone: {shippingAddr.phone}</p>
              </div>
            ) : (
              <p className="text-stone-500">No address recorded</p>
            )}
          </div>
        </div>

        {/* Slippers Purchased Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-300">
            Order Items ({order.items?.length || 0})
          </h4>
          <div className="divide-y divide-stone-800 border border-stone-800 rounded-2xl p-2 bg-stone-950 text-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 px-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      item.productImage ||
                      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=120'
                    }
                    alt={item.productName}
                    className="w-12 h-12 rounded-xl object-cover bg-stone-900 border border-stone-800 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{item.productName}</p>
                    <p className="text-[11px] text-stone-400">
                      Color: <strong className="text-stone-300">{item.color}</strong> • Size: <strong className="text-stone-300">UK {item.size}</strong> • Qty: <strong className="text-stone-300">{item.quantity}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-black text-sm text-luxury-accent">₹{item.totalPrice}</p>
                  <p className="text-[10px] text-stone-500">₹{item.unitPrice} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logistics & Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Logistics Tracking */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <span className="font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-luxury-accent" /> Logistics & Dispatch
            </span>
            <div className="space-y-1 pt-1 text-stone-400">
              <p>Courier: <strong className="text-white">{order.courierName || 'Pending Assignment'}</strong></p>
              <p>Tracking Number: <strong className="font-mono text-white">{order.trackingNumber || 'Pending'}</strong></p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-luxury-accent hover:underline inline-flex items-center gap-1 font-bold pt-1"
                >
                  Track on Courier Site <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {order.shippingDate && (
                <p className="text-[11px] text-stone-500 pt-1">
                  Dispatched on: {new Date(order.shippingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
              {order.expectedDeliveryDate && (
                <p className="text-[11px] text-emerald-400 font-bold">
                  Expected Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Pricing Calculation */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="flex justify-between text-stone-400">
              <span>Subtotal:</span>
              <span className="font-bold text-white">₹{order.totalAmount}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span className="font-bold">-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-400">
              <span>Shipping Fee:</span>
              <span className="font-bold text-white">
                {order.shippingAmount === 0 ? 'FREE' : `₹${order.shippingAmount}`}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline font-black text-base text-white">
              <span>Final Total:</span>
              <span className="text-luxury-accent">₹{order.finalAmount}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-400 pt-1">
              <span>Payment:</span>
              <span className="font-bold text-stone-300">
                {order.paymentMethod} • {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Status History Timeline */}
        {order.statusHistory?.length > 0 && (
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
            <h5 className="font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-luxury-accent" /> Status History Log
            </h5>
            <div className="space-y-2 pt-2 divide-y divide-stone-900">
              {order.statusHistory.map((sh, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 font-bold text-[10px] text-stone-300">
                      {sh.status}
                    </span>
                    <span className="text-stone-400 text-xs ml-2">{sh.comment || 'Status updated'}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono shrink-0">
                    {new Date(sh.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-3 border-t border-stone-800 flex flex-wrap gap-2 justify-end">
          {/* 1. APPROVE ORDER BUTTON */}
          {isPending && onOpenApprovalModal && (
            <button
              type="button"
              onClick={() => {
                onOpenApprovalModal(order);
                onClose();
              }}
              className="px-5 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black rounded-2xl text-xs transition-all shadow-glow flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Order</span>
            </button>
          )}

          {/* 2. MARK AS PROCESSING */}
          {order.status === 'APPROVED' && (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus('PROCESSING')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition-colors flex items-center gap-1.5"
            >
              {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
              <span>Mark Processing</span>
            </button>
          )}

          {/* 3. MARK AS SHIPPED */}
          {['APPROVED', 'PROCESSING', 'PACKED'].includes(order.status) && !isShippingPrompt && (
            <button
              type="button"
              onClick={() => setIsShippingPrompt(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Mark Shipped</span>
            </button>
          )}

          {/* 4. MARK AS DELIVERED */}
          {order.status === 'SHIPPED' && (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus('DELIVERED')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs transition-all shadow-glow flex items-center gap-1.5"
            >
              {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Mark as Delivered ✓</span>
            </button>
          )}

          {/* 5. CANCEL ORDER */}
          {!isCancelled && !isDelivered && !isCancelling && (
            <button
              type="button"
              onClick={() => setIsCancelling(true)}
              className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold rounded-2xl text-xs transition-colors"
            >
              Cancel Order
            </button>
          )}

          {/* 6. PERMANENT DELETE ORDER (ADMIN PRIVILEGE) */}
          {!isConfirmingDelete && (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="p-2.5 bg-stone-950 hover:bg-rose-950 text-stone-500 hover:text-rose-400 border border-stone-800 rounded-2xl transition-colors ml-auto"
              title="Permanently Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Delete Order Confirmation Subform */}
        {isConfirmingDelete && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 space-y-3 animate-in fade-in text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Are you sure you want to permanently delete order #{order.orderNumber}? This action cannot be undone.</span>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteOrder}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Shipping Prompt Subform */}
        {isShippingPrompt && (
          <div className="p-4 rounded-2xl bg-stone-950 border border-purple-800/80 space-y-3 animate-in fade-in text-xs">
            <h5 className="font-bold text-purple-300">Dispatch Order & Add Tracking Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Courier Partner (e.g. Delhivery)"
                value={shippingCourier}
                onChange={(e) => setShippingCourier(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white outline-none"
              />
              <input
                type="text"
                placeholder="AWB / Tracking Number"
                value={shippingTracking}
                onChange={(e) => setShippingTracking(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsShippingPrompt(false)}
                className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() =>
                  handleUpdateStatus('SHIPPED', {
                    courierName: shippingCourier,
                    trackingNumber: shippingTracking,
                  })
                }
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
              >
                {isUpdatingStatus ? 'Updating...' : 'Confirm Shipment'}
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Subform */}
        {isCancelling && (
          <div className="p-4 rounded-2xl bg-stone-950 border border-rose-800/80 space-y-3 animate-in fade-in text-xs">
            <h5 className="font-bold text-rose-300">Cancel Order & Restore Inventory Stock</h5>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsCancelling(false)}
                className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded-xl font-bold"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() =>
                  handleUpdateStatus('CANCELLED', {
                    cancellationReason: cancelReason,
                  })
                }
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow"
              >
                {isUpdatingStatus ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderDetailsModal;
