import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  MapPin,
  ShoppingBag,
  Bell,
  FileText,
  Shield,
  ShieldAlert,
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Lock,
  Calendar,
  CreditCard,
} from 'lucide-react';
import adminService from '../../services/adminService';

const AdminCustomerDetailsModal = ({
  customerId,
  isOpen,
  onClose,
  onCustomerUpdated,
  onViewOrder,
  showToast,
}) => {
  const [customerData, setCustomerData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, addresses, orders, notifications, notes, security

  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadCustomer = async () => {
    if (!customerId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminService.getCustomerDetails(customerId);
      if (res?.data) {
        setCustomerData(res.data.customer);
        setStats(res.data.stats);
        setAdminNotes(res.data.customer?.adminNotes || '');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load customer details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomer();
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  // Save Admin Notes
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await adminService.updateCustomerAdminNotes(customerId, adminNotes);
      if (showToast) showToast('success', 'Admin internal notes saved successfully.');
    } catch (err) {
      if (showToast) showToast('error', err.message || 'Failed to save admin notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Block / Unblock Customer
  const handleToggleBlock = async () => {
    const isCurrentlyBlocked = customerData?.isBlocked;
    setIsActionLoading(true);
    try {
      await adminService.updateCustomerStatus(customerId, {
        status: isCurrentlyBlocked ? 'ACTIVE' : 'BLOCKED',
        blockedReason: isCurrentlyBlocked ? null : (blockReason || 'Blocked by administrator.'),
      });
      if (showToast) {
        showToast('success', `Customer ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully.`);
      }
      setIsBlocking(false);
      await loadCustomer();
      if (onCustomerUpdated) onCustomerUpdated();
    } catch (err) {
      if (showToast) showToast('error', err.message || 'Failed to update customer status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Force Logout All Devices
  const handleForceLogout = async () => {
    if (!window.confirm(`Force logout ${customerData?.name || customerData?.email} from all active devices?`)) {
      return;
    }
    setIsActionLoading(true);
    try {
      await adminService.forceLogoutCustomer(customerId);
      if (showToast) showToast('success', 'All customer device sessions terminated.');
      await loadCustomer();
    } catch (err) {
      if (showToast) showToast('error', err.message || 'Failed to force logout customer.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Force Password Reset
  const handleForcePasswordReset = async () => {
    if (!window.confirm(`Send password reset email to ${customerData?.email}?`)) {
      return;
    }
    setIsActionLoading(true);
    try {
      await adminService.forcePasswordResetCustomer(customerId);
      if (showToast) showToast('success', `Password reset email sent to ${customerData?.email}.`);
    } catch (err) {
      if (showToast) showToast('error', err.message || 'Failed to send reset email.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Soft Deactivate Account
  const handleDeactivate = async () => {
    if (!window.confirm(`Deactivate account for ${customerData?.name || customerData?.email}? Historical orders and receipts will be preserved.`)) {
      return;
    }
    setIsActionLoading(true);
    try {
      await adminService.deactivateCustomer(customerId);
      if (showToast) showToast('success', 'Customer deactivated. Historical orders preserved.');
      await loadCustomer();
      if (onCustomerUpdated) onCustomerUpdated();
    } catch (err) {
      if (showToast) showToast('error', err.message || 'Failed to deactivate customer.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Custom Fields Parsing
  let parsedCustomFields = {};
  if (customerData?.customFields) {
    try {
      parsedCustomFields = typeof customerData.customFields === 'string' ? JSON.parse(customerData.customFields) : customerData.customFields;
    } catch {
      parsedCustomFields = {};
    }
  }

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
          <div className="flex items-center gap-3">
            {customerData?.profileImage ? (
              <img
                src={customerData.profileImage}
                alt={customerData.name}
                className="w-12 h-12 rounded-2xl object-cover border border-luxury-accent/40"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-luxury-dark border border-luxury-accent/40 text-luxury-accent font-black text-lg flex items-center justify-center">
                {customerData?.name?.[0]?.toUpperCase() || 'C'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white">
                  {customerData?.name || 'Customer Profile'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    customerData?.status === 'ACTIVE' && !customerData?.isBlocked
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {customerData?.isBlocked ? 'BLOCKED' : customerData?.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {customerData?.email} • {customerData?.phone || customerData?.whatsappNumber || 'No phone'}
              </p>
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
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-luxury-accent mx-auto" />
            <p className="text-xs text-stone-400 font-bold">Loading Customer Record...</p>
          </div>
        ) : (
          <>
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-center">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Total Spent</span>
                <span className="font-display font-black text-base text-luxury-accent">₹{stats?.totalSpent || 0}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-center">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Total Orders</span>
                <span className="font-display font-black text-base text-white">{stats?.total || 0}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-center">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Delivered</span>
                <span className="font-display font-black text-base text-emerald-400">{stats?.delivered || 0}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-center">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Addresses</span>
                <span className="font-display font-black text-base text-stone-300">{customerData?.addresses?.length || 0}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar border-b border-stone-800 pb-2">
              {[
                { id: 'profile', label: 'Profile & Details', icon: User },
                { id: 'addresses', label: `Addresses (${customerData?.addresses?.length || 0})`, icon: MapPin },
                { id: 'orders', label: `Orders (${customerData?.orders?.length || 0})`, icon: ShoppingBag },
                { id: 'notifications', label: `Alerts (${customerData?.notifications?.length || 0})`, icon: Bell },
                { id: 'notes', label: 'Private Notes', icon: FileText },
                { id: 'security', label: 'Security & Access', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-luxury-accent text-stone-950 font-black'
                        : 'bg-stone-950 text-stone-400 hover:text-white hover:bg-stone-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="space-y-4 text-xs">
              {/* 1. PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400">Customer ID</span>
                      <p className="font-mono text-white select-all">{customerData?.id}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400">Registration Date</span>
                      <p className="text-white">
                        {new Date(customerData?.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400">WhatsApp Contact</span>
                      <p className="text-white font-bold">{customerData?.whatsappNumber || customerData?.phone || 'Not provided'}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                      <span className="text-stone-400">Active Sessions</span>
                      <p className="text-emerald-400 font-bold">{customerData?.sessions?.length || 0} active device(s)</p>
                    </div>
                  </div>

                  {/* Dynamic Custom Registration Fields Display */}
                  {Object.keys(parsedCustomFields).length > 0 && (
                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                      <h4 className="font-bold text-stone-300 uppercase tracking-wider">
                        Dynamic Registration Data
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(parsedCustomFields).map(([key, val]) => (
                          <div key={key} className="p-2.5 rounded-xl bg-stone-900 border border-stone-800/80">
                            <span className="block text-[10px] text-stone-400 uppercase font-bold">{key.replace(/_/g, ' ')}</span>
                            <span className="font-bold text-white text-xs">{String(val) || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <div className="space-y-3 animate-in fade-in">
                  {customerData?.addresses?.length > 0 ? (
                    customerData.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1 relative"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{addr.fullName}</span>
                          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-[10px] font-bold text-stone-300">
                            {addr.addressType || 'HOME'}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-md bg-luxury-accent/20 text-luxury-accent text-[10px] font-black">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-stone-300">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-stone-400">{addr.addressLine2}</p>}
                        <p className="text-stone-400">
                          {addr.city}, {addr.state} — {addr.postalCode}
                        </p>
                        <p className="text-stone-500 text-[11px] pt-1">Phone: {addr.phone}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-stone-500">No addresses saved by customer.</div>
                  )}
                </div>
              )}

              {/* 3. ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-3 animate-in fade-in">
                  {customerData?.orders?.length > 0 ? (
                    customerData.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3 hover:border-stone-700 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-white text-sm">#{ord.orderNumber}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : ord.status === 'CANCELLED'
                                  ? 'bg-rose-950 text-rose-400'
                                  : 'bg-amber-950 text-amber-400'
                              }`}
                            >
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-stone-400 text-[11px] mt-0.5">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })} • {ord.items?.length || 0} item(s)
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-luxury-accent text-sm">₹{ord.finalAmount}</span>
                          {onViewOrder && (
                            <button
                              type="button"
                              onClick={() => {
                                onViewOrder(ord);
                                onClose();
                              }}
                              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold text-[11px]"
                            >
                              View Order
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-stone-500">No orders placed by customer yet.</div>
                  )}
                </div>
              )}

              {/* 4. NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="space-y-2 animate-in fade-in">
                  {customerData?.notifications?.length > 0 ? (
                    customerData.notifications.map((n) => (
                      <div key={n.id} className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-white">{n.title}</p>
                          <span className="text-[10px] text-stone-500">
                            {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-stone-400 text-[11px]">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-stone-500">No notifications dispatched to this user.</div>
                  )}
                </div>
              )}

              {/* 5. PRIVATE ADMIN NOTES TAB */}
              {activeTab === 'notes' && (
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 animate-in fade-in">
                  <h4 className="font-bold text-stone-300 uppercase tracking-wider">
                    Internal Admin Notes (Private)
                  </h4>
                  <p className="text-stone-400 text-[11px]">
                    These notes are confidential and NEVER displayed to the customer.
                  </p>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter private notes regarding this customer..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-stone-200 outline-none focus:border-luxury-accent"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingNotes}
                      onClick={handleSaveNotes}
                      className="px-5 py-2 bg-luxury-accent text-stone-950 font-black rounded-xl hover:bg-amber-400 transition-all flex items-center gap-1.5"
                    >
                      {isSavingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>Save Notes</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 6. SECURITY & ACTIONS TAB */}
              {activeTab === 'security' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Block / Unblock Card */}
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-stone-200">Account Access Control</h4>
                        <p className="text-[11px] text-stone-400">
                          {customerData?.isBlocked ? 'Customer is currently BLOCKED from purchasing.' : 'Customer has normal active access.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (customerData?.isBlocked) {
                            handleToggleBlock();
                          } else {
                            setIsBlocking(true);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl font-bold ${
                          customerData?.isBlocked
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-amber-600 text-white hover:bg-amber-500'
                        }`}
                      >
                        {customerData?.isBlocked ? 'Unblock Customer' : 'Block Customer'}
                      </button>
                    </div>

                    {isBlocking && (
                      <div className="pt-2 space-y-2 border-t border-stone-800">
                        <input
                          type="text"
                          placeholder="Reason for blocking (e.g. fraudulent activity)..."
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white outline-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsBlocking(false)}
                            className="px-3 py-1 bg-stone-800 text-stone-300 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleToggleBlock}
                            className="px-3 py-1 bg-rose-600 text-white font-bold rounded-xl"
                          >
                            Confirm Block
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Force Logout & Password Reset */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                      <h4 className="font-bold text-stone-200 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-400" /> Force Logout All Devices
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Immediately terminates all active sessions across all mobile and desktop devices.
                      </p>
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={handleForceLogout}
                        className="w-full py-2 bg-stone-800 hover:bg-rose-950 text-rose-300 border border-rose-800/60 rounded-xl font-bold transition-colors"
                      >
                        Terminate All Sessions
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                      <h4 className="font-bold text-stone-200 flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-luxury-accent" /> Force Password Reset
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Generates a secure crypto reset token and dispatches reset instructions via Brevo.
                      </p>
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={handleForcePasswordReset}
                        className="w-full py-2 bg-stone-800 hover:bg-amber-950 text-amber-300 border border-amber-800/60 rounded-xl font-bold transition-colors"
                      >
                        Dispatch Reset Email
                      </button>
                    </div>
                  </div>

                  {/* Soft Deactivate */}
                  <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-2">
                    <h4 className="font-bold text-rose-300 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-rose-500" /> Soft Deactivate Customer Record
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Deactivates user access while securely preserving order history, tax invoices, and accounting totals.
                    </p>
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={handleDeactivate}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors"
                    >
                      Deactivate Customer Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCustomerDetailsModal;
