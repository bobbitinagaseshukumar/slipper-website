import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  MessageSquare,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Camera,
  Loader2,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
const CATEGORIES = [
  { id: 'men', name: "Men's Slides & Slippers" },
  { id: 'women', name: "Women's Comfort Slippers" },
  { id: 'ortho', name: 'Orthopedic & Health' },
  { id: 'daily', name: 'All-Weather Daily Wear' },
];

const Onboarding = () => {
  const { user, submitOnboarding } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state pre-populated with available user/Firebase data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    profileImage: user?.profileImage || '',
    phone: user?.phone || '',
    whatsappNumber: user?.whatsappNumber || '',
    sameAsPhone: true,
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    preferredSize: 'UK 8',
    preferredCategory: 'men',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        profileImage: prev.profileImage || user.profileImage || '',
        phone: prev.phone || user.phone || '',
        whatsappNumber: prev.whatsappNumber || user.whatsappNumber || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'sameAsPhone') {
      setFormData((prev) => ({
        ...prev,
        sameAsPhone: checked,
        whatsappNumber: checked ? prev.phone : prev.whatsappNumber,
      }));
    } else if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        phone: value,
        whatsappNumber: prev.sameAsPhone ? value : prev.whatsappNumber,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError(null);

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.phone.trim() || formData.phone.trim().length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!formData.addressLine1.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
        setError('Please provide your street address, city, and postal pincode.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await submitOnboarding({
        name: formData.name,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber || formData.phone,
        profileImage: formData.profileImage,
        preferredSize: formData.preferredSize,
        preferredCategory: formData.preferredCategory,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state || 'Tamil Nadu',
        postalCode: formData.postalCode,
      });

      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to complete profile setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Personal Info' },
    { num: 2, title: 'Contact Details' },
    { num: 3, title: 'Delivery Address' },
    { num: 4, title: 'Preferences' },
  ];

  return (
    <div className="min-h-screen bg-luxury-warmWhite flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="max-w-xl w-full mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-luxury-dark text-white text-xs font-semibold uppercase tracking-wider mb-3 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-luxury-accent" />
          <span>Profile Onboarding</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark">
          Welcome, {formData.name ? formData.name.split(' ')[0] : 'Footwear Enthusiast'}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Let's tailor your bespoke slipper showroom & express delivery profile.
        </p>

        {/* 3D Progress Step Bar */}
        <div className="flex items-center justify-between mt-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-luxury-accent -translate-y-1/2 transition-all duration-500 z-0"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 transform-gpu ${
                  currentStep >= s.num
                    ? 'bg-luxury-dark text-luxury-accent shadow-md scale-110 ring-4 ring-luxury-accent/20'
                    : 'bg-white text-gray-400 border border-gray-200'
                }`}
              >
                {currentStep > s.num ? <Check className="w-4 h-4 text-emerald-400" /> : s.num}
              </div>
              <span
                className={`text-[10px] font-bold mt-1.5 hidden sm:block ${
                  currentStep >= s.num ? 'text-luxury-dark' : 'text-gray-400'
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Onboarding Card Container */}
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-10 relative overflow-hidden perspective-1000">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                {/* Profile Photo Upload / Avatar */}
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-luxury-accent/30 shadow-lg bg-stone-100 flex items-center justify-center">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-luxury-dark text-luxury-accent shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      id="photo-upload"
                      type="text"
                      placeholder="Photo URL"
                      value={formData.profileImage}
                      onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                      className="hidden"
                    />
                  </label>
                </div>
                <h3 className="font-display font-bold text-lg text-luxury-dark">Personal Details</h3>
                <p className="text-xs text-gray-500">How should we address your footwear orders?</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-4 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 transform-gpu"
              >
                <span>Continue to Contact Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Contact Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-display font-bold text-lg text-luxury-dark">Contact Information</h3>
                <p className="text-xs text-gray-500">Required for live courier tracking and delivery SMS.</p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number (e.g. 9876543210)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* WhatsApp Toggle */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-900">
                  <input
                    type="checkbox"
                    name="sameAsPhone"
                    checked={formData.sameAsPhone}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600"
                  />
                  <span>WhatsApp number is the same as my mobile number</span>
                </label>

                {!formData.sameAsPhone && (
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                      Alternate WhatsApp Number:
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleInputChange}
                        placeholder="WhatsApp Number"
                        className="w-full bg-white border border-emerald-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 py-4 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 transform-gpu"
                >
                  <span>Continue to Delivery Address</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Delivery Address */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-display font-bold text-lg text-luxury-dark">Default Delivery Address</h3>
                <p className="text-xs text-gray-500">Your footwear orders will be dispatched here.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  House / Flat / Building No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 402, Sunshine Apartments"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Street / Area / Colony
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  placeholder="e.g. Gandhi Nagar 2nd Street"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Chennai"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Postal Pincode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 600001"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 py-4 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 transform-gpu"
                >
                  <span>Continue to Sizing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Footwear Preferences */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-display font-bold text-lg text-luxury-dark">Footwear Sizing & Style</h3>
                <p className="text-xs text-gray-500">Optional preferences to pre-filter your favorite fits.</p>
              </div>

              {/* Preferred Size */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Preferred Slipper Size (UK / India):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredSize: size })}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                        formData.preferredSize === size
                          ? 'bg-luxury-dark text-white shadow-md border-2 border-luxury-dark ring-2 ring-luxury-accent/30'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Primary Shopping Category:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredCategory: cat.id })}
                      className={`p-3.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        formData.preferredCategory === cat.id
                          ? 'bg-luxury-warmWhite text-luxury-dark border-2 border-luxury-accent shadow-xs'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="flex-1 py-4 rounded-2xl bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 transform-gpu"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-luxury-accent" />
                      <span>Complete & Enter Store</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
