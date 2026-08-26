import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, AlertCircle, Loader2, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import FloatingSlipper3D from '../components/3d/FloatingSlipper3D';

const Register = () => {
  const { settings } = useStoreSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, loginGoogle, loginFacebook } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
      default:
        return { score: 10, label: 'Too short', color: 'bg-gray-300', text: 'text-gray-400' };
    }
  };

  const strength = getPasswordStrength(formData.password);

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

    if (!formData.acceptTerms) {
      setError('Please accept the Terms & Conditions and Privacy Policy.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading || isSubmitting || isFacebookLoading) return;
    setError(null);
    setIsGoogleLoading(true);

    try {
      const data = await loginGoogle();
      if (data?.isNewCustomer || data?.isProfileComplete === false) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Google sign-in was cancelled.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    if (isFacebookLoading || isSubmitting || isGoogleLoading) return;
    setError(null);
    setIsFacebookLoading(true);

    try {
      const data = await loginFacebook();
      if (data?.isNewCustomer || data?.isProfileComplete === false) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Facebook sign-in was cancelled.');
    } finally {
      setIsFacebookLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-warmWhite flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.storeName} className="h-10 max-w-[140px] object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center font-display font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              {settings.storeName ? settings.storeName.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
          <span className="font-display font-black text-2xl tracking-tight text-luxury-dark">
            {settings.storeName || 'AuraSole'}
          </span>
        </Link>
        <h2 className="mt-3 font-display font-black text-2xl sm:text-3xl text-luxury-dark tracking-tight">
          {settings.registerTitle || 'Create Your Account'}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          {settings.registerSubtitle || `Join ${settings.storeName || 'AuraSole'} for exclusive slipper drops & priority shipping.`}
        </p>
      </div>

      {/* Split Screen Container */}
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transform-gpu">
        {/* Left Side: 3D Showcase */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-luxury-dark via-stone-900 to-luxury-surface p-8 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/10 text-luxury-accent text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
              Member Privileges
            </span>
            <h3 className="font-display font-bold text-xl text-white mt-3 leading-snug">
              {settings.registerWelcomeMessage || 'Unlock Free Shipping & 15% Welcome Savings'}
            </h3>
          </div>

          <div className="my-auto py-2">
            <FloatingSlipper3D
              isCompact={true}
              title="AuraChic Double-Strap Slide"
              badgeText="Signature Comfort"
              price="₹999"
            />
          </div>

          <div className="relative z-10 text-[11px] text-gray-400 space-y-1">
            <p className="flex items-center gap-1.5">✓ Track Orders in Real-Time</p>
            <p className="flex items-center gap-1.5">✓ Fast 1-Click Doorstep Checkout</p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Social One-Click Registration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              disabled={isGoogleLoading || isFacebookLoading || isSubmitting}
              onClick={handleGoogleSignIn}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Google</span>
            </button>

            <button
              type="button"
              disabled={isFacebookLoading || isGoogleLoading || isSubmitting}
              onClick={handleFacebookSignIn}
              className="py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
            >
              {isFacebookLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              <span>Facebook</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
              Or Register With Email
            </span>
            <div className="border-t border-gray-200 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field with Strength Meter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">Security Strength:</span>
                    <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Accept Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="w-4 h-4 text-luxury-accent rounded focus:ring-luxury-accent accent-luxury-accent mt-0.5"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-luxury-accent underline font-semibold">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-luxury-accent underline font-semibold">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading || isFacebookLoading}
              className="w-full py-4 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2 transform-gpu"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Setup Profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-luxury-accent hover:underline inline-flex items-center gap-1 ml-1"
              >
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
