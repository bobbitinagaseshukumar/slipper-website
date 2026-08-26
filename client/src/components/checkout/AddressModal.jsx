import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Loader2, AlertCircle } from 'lucide-react';
import addressService from '../../services/addressService';

const AddressModal = ({ isOpen, onClose, addressToEdit = null, onAddressSaved }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    alternatePhone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        fullName: addressToEdit.fullName || '',
        phone: addressToEdit.phone || '',
        alternatePhone: addressToEdit.alternatePhone || '',
        addressLine1: addressToEdit.addressLine1 || '',
        addressLine2: addressToEdit.addressLine2 || '',
        landmark: addressToEdit.landmark || '',
        city: addressToEdit.city || '',
        state: addressToEdit.state || '',
        postalCode: addressToEdit.postalCode || '',
        country: addressToEdit.country || 'India',
        addressType: addressToEdit.addressType || 'HOME',
        isDefault: addressToEdit.isDefault || false,
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        alternatePhone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        addressType: 'HOME',
        isDefault: false,
      });
    }
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      setError('Please provide your full recipient name.');
      return;
    }

    if (!formData.phone || formData.phone.trim().length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (!formData.addressLine1 || formData.addressLine1.trim().length < 5) {
      setError('Please provide a complete street/house address.');
      return;
    }

    if (!formData.city || !formData.state) {
      setError('City and State are required.');
      return;
    }

    if (!formData.postalCode || !/^\d{6}$/.test(formData.postalCode.trim())) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsSubmitting(true);
    try {
      let saved = null;
      if (addressToEdit) {
        const res = await addressService.updateAddress(addressToEdit.id, formData);
        saved = res?.data;
      } else {
        const res = await addressService.createAddress(formData);
        saved = res?.data;
      }
      if (onAddressSaved) onAddressSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-luxury-accent mb-1">
          <MapPin className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {addressToEdit ? 'Edit Address' : 'New Delivery Address'}
          </span>
        </div>

        <h3 className="font-display font-black text-xl text-luxury-dark mb-4">
          Where Should We Deliver Your Slippers?
        </h3>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Recipient Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Recipient Name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
              />
            </div>
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Flat / House No. / Building / Street *
            </label>
            <input
              type="text"
              required
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="e.g. Flat 402, Royal Palms, MG Road"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
            />
          </div>

          {/* Address Line 2 & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Area / Colony / Sector
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="e.g. Indiranagar"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Near Metro Station"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
              />
            </div>
          </div>

          {/* PIN, City, State */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                maxLength={6}
                required
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="6 Digits"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
              />
            </div>
          </div>

          {/* Address Type & Default */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">Type:</span>
              {['HOME', 'WORK', 'OTHER'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, addressType: type }))}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                    formData.addressType === type
                      ? 'bg-luxury-dark text-white border-luxury-dark'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-4 h-4 text-luxury-accent rounded focus:ring-luxury-accent accent-luxury-accent"
              />
              <span className="text-xs text-gray-700 font-medium">Set as Default</span>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Address...</span>
                </>
              ) : (
                <span>Save Delivery Address</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
