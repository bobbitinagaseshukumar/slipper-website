import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  Calendar,
  Clock,
  FileText,
  Loader2,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react';
import adminService from '../../services/adminService';

const AdminOrderApprovalModal = ({ order, isOpen, onClose, onApproved, showToast }) => {
  // Default values
  const now = new Date();
  const defaultDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultShipping = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultDelivery = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [cancellationDeadline, setCancellationDeadline] = useState(defaultDeadline);
  const [shippingDate, setShippingDate] = useState(defaultShipping);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(defaultDelivery);
  const [courierName, setCourierName] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('Handle with care - Premium Footwear.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen || !order) return null;

  const handleCourierChange = (courier) => {
    setCourierName(courier);
    if (courier === 'Delhivery' && trackingNumber) {
      setTrackingUrl(`https://www.delhivery.com/track/package/${trackingNumber}`);
    } else if (courier === 'Blue Dart' && trackingNumber) {
      setTrackingUrl(`https://www.bluedart.com/trackdartresult.html?trackFor=0&trackNo=${trackingNumber}`);
    } else if (courier === 'DTDC' && trackingNumber) {
      setTrackingUrl(`https://www.dtdc.in/tracking/shipment-tracking.asp?trkType=AWB&strCnNo=${trackingNumber}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate expected delivery date >= shipping date
    if (shippingDate && expectedDeliveryDate && new Date(expectedDeliveryDate) < new Date(shippingDate)) {
      setErrorMsg('Expected delivery date cannot be earlier than shipping date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.approveOrder(order.id, {
        cancellationDeadline: new Date(cancellationDeadline),
        shippingDate: shippingDate ? new Date(shippingDate) : null,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        courierName,
        trackingNumber,
        trackingUrl,
        adminNotes,
        deliveryNotes,
      });

      if (showToast) {
        showToast('success', `Order #${order.orderNumber} approved successfully! Notification & email dispatched.`);
      }
      if (onApproved) onApproved();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to approve order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-stone-900 border border-stone-800 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 space-y-6 text-stone-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-luxury-accent/20 text-luxury-accent">
                <PackageCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display font-black text-lg text-white">Approve Order #{order.orderNumber}</h3>
                <p className="text-xs text-stone-400">
                  Customer: <strong>{order.user?.name || 'Customer'}</strong> • Total: <strong className="text-luxury-accent">₹{order.finalAmount}</strong>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Cancellation Deadline */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <label className="block font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-luxury-accent" />
              <span>1. Cancellation Deadline (Customer Window) *</span>
            </label>
            <p className="text-[11px] text-stone-400">
              The customer can cancel their order on their portal ONLY before this exact server time.
            </p>
            <input
              type="datetime-local"
              required
              value={cancellationDeadline}
              onChange={(e) => setCancellationDeadline(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-luxury-accent outline-none"
            />
          </div>

          {/* 2. Shipping & Expected Delivery Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <label className="block font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-luxury-accent" />
                <span>2. Shipping Date</span>
              </label>
              <input
                type="datetime-local"
                value={shippingDate}
                onChange={(e) => setShippingDate(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono focus:border-luxury-accent outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <label className="block font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>3. Expected Delivery</span>
              </label>
              <input
                type="datetime-local"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono focus:border-luxury-accent outline-none"
              />
            </div>
          </div>

          {/* 3. Courier & Tracking Details */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-200 uppercase tracking-wider">
                Courier & Logistics Tracking
              </label>
              {/* Courier Quick Selector */}
              <div className="flex gap-1">
                {['Delhivery', 'Blue Dart', 'DTDC', 'Express'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCourierChange(c)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      courierName === c ? 'bg-luxury-accent text-stone-950 font-black' : 'bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-stone-400 mb-1">Courier Partner Name</span>
                <input
                  type="text"
                  placeholder="e.g. Delhivery Express"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white outline-none focus:border-luxury-accent"
                />
              </div>

              <div>
                <span className="block text-[11px] text-stone-400 mb-1">Tracking / AWB Number</span>
                <input
                  type="text"
                  placeholder="e.g. 12903810293"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value);
                    if (courierName === 'Delhivery') {
                      setTrackingUrl(`https://www.delhivery.com/track/package/${e.target.value}`);
                    }
                  }}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-luxury-accent"
                />
              </div>
            </div>

            <div>
              <span className="block text-[11px] text-stone-400 mb-1">Tracking URL (Optional link for customer)</span>
              <input
                type="url"
                placeholder="https://track.example.com/..."
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] outline-none focus:border-luxury-accent"
              />
            </div>
          </div>

          {/* 4. Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                Admin Internal Notes (Private)
              </label>
              <textarea
                rows={2}
                placeholder="Internal notes for warehouse team..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-luxury-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                Delivery Instructions (Customer Visible)
              </label>
              <textarea
                rows={2}
                placeholder="Customer delivery notes..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-luxury-accent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-2xl font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black rounded-2xl shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Confirm & Approve Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminOrderApprovalModal;
