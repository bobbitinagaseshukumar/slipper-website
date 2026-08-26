import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Compass,
  MapPin,
  Phone,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import FloatingSlipper3D from '../components/3d/FloatingSlipper3D';
import usePerformanceMode from '../hooks/usePerformanceMode';

const Login = () => {
  const { settings } = useStoreSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, loginGoogle, loginFacebook } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isFull3D } = usePerformanceMode();

  const from = location.state?.from?.pathname || '/account';

  // Check for session expiration message
  React.useEffect(() => {
    const expiredMsg = sessionStorage.getItem('aurasole_session_expired_msg') || location.state?.sessionExpiredMsg;
    if (expiredMsg) {
      setError(expiredMsg);
      sessionStorage.removeItem('aurasole_session_expired_msg');
    }
  }, [location]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      const role = res?.data?.user?.role;
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else if (res?.data?.isProfileComplete === false) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
      const role = data?.user?.role;
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else if (data?.isNewCustomer || data?.isProfileComplete === false) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
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
      const role = data?.user?.role;
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else if (data?.isNewCustomer || data?.isProfileComplete === false) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Facebook sign-in was cancelled.');
    } finally {
      setIsFacebookLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-luxury-warmWhite flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={settings.loginBgImage ? { backgroundImage: `url(${settings.loginBgImage})` } : {}}
    >
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
          {settings.loginTitle || `Welcome to ${settings.storeName || 'AuraSole'}`}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          {settings.loginSubtitle || 'Step into your personalized comfort showroom and orders.'}
        </p>
      </div>

      {/* 3D Split Screen Authentication Stage */}
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transform-gpu">
        {/* Left Side: 3D Showcase Slipper Column */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-luxury-dark via-stone-900 to-luxury-surface p-8 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-luxury-accent text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
              <Sparkles className="w-3 h-3" /> Step Into Cloud Luxury
            </div>
            <h3 className="font-display font-bold text-xl text-white mt-3 leading-snug">
              {settings.loginWelcomeMessage || 'Every Step Doctor Engineered'}
            </h3>
          </div>

          <div className="my-auto py-2">
            <FloatingSlipper3D
              isCompact={true}
              title="AuraCloud Recovery Slide"
              badgeText="Ergonomic Foam"
              price="₹899"
            />
          </div>

          <div className="relative z-10 text-[11px] text-gray-400 space-y-1">
            <p className="flex items-center gap-1.5">✓ 100% Shock Absorption Sole</p>
            <p className="flex items-center gap-1.5">✓ 7-Day Doorstep Replacement</p>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Social OAuth Buttons */}
          {(settings.loginGoogleEnabled !== false || settings.loginFacebookEnabled !== false) && (
            <div className="space-y-3 mb-6">
              {/* Google Login Button */}
              {settings.loginGoogleEnabled !== false && (
                <button
                  type="button"
                  disabled={isGoogleLoading || isFacebookLoading || isSubmitting}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold shadow-2xs transition-all duration-200 flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50 transform-gpu hover:shadow-md"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
                      <span>Connecting with Google...</span>
                    </>
                  ) : (
                    <>
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
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              )}

              {/* Facebook Login Button */}
              {settings.loginFacebookEnabled !== false && (
                <button
                  type="button"
                  disabled={isFacebookLoading || isGoogleLoading || isSubmitting}
                  onClick={handleFacebookSignIn}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50 transform-gpu"
                >
                  {isFacebookLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Connecting with Facebook...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Continue with Facebook</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
              Or Sign In with Email
            </span>
            <div className="border-t border-gray-200 w-full" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white focus:ring-2 focus:ring-luxury-accent/20 transition-all"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-luxury-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white focus:ring-2 focus:ring-luxury-accent/20 transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-luxury-accent rounded focus:ring-luxury-accent accent-luxury-accent"
                />
                <span className="text-xs text-gray-600">Remember my session</span>
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
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Optional Admin-Controlled Contact / Address Footnote */}
          {(settings.loginShowAddress || settings.loginShowPhone || settings.loginShowWhatsApp || settings.loginShowEmail) && (
            <div className="mt-6 pt-4 border-t border-gray-100/80 text-[11px] text-gray-500 space-y-1">
              {settings.loginShowAddress && settings.address && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-luxury-accent shrink-0" />
                  <span>{settings.address}</span>
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {settings.loginShowPhone && settings.phone && (
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-luxury-accent" />
                    <span>{settings.phone}</span>
                  </p>
                )}
                {settings.loginShowWhatsApp && settings.whatsappNumber && (
                  <p className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{settings.whatsappNumber}</span>
                  </p>
                )}
                {settings.loginShowEmail && settings.contactEmail && (
                  <p className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-luxury-accent" />
                    <span>{settings.contactEmail}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Links: Register & Guest Shopping */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>
              New customer?{' '}
              <Link
                to="/register"
                className="font-bold text-luxury-accent hover:underline inline-flex items-center gap-1 ml-1"
              >
                Create Account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>

            <Link
              to="/shop"
              className="text-gray-500 hover:text-luxury-dark font-medium flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" /> Continue as Guest
            </Link>
          </div>

          {/* Dedicated Administrator Portal Access Button */}
          <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-center">
            <Link
              to="/admin/login"
              className="w-full py-2.5 px-4 rounded-xl bg-luxury-dark hover:bg-luxury-accent text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm group"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Store Administrator Login Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
