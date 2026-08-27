import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  RotateCcw,
  Shield,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import authService from '../services/authService';
import FloatingSlipper3D from '../components/3d/FloatingSlipper3D';
import usePerformanceMode from '../hooks/usePerformanceMode';

const Login = () => {
  const { settings: globalStoreSettings } = useStoreSettings();
  const { login, register, loginGoogle, loginFacebook } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isFull3D } = usePerformanceMode();

  // Check if initial view should be register (e.g. from /register or ?mode=register)
  const isRegisterRoute = location.pathname === '/register' || location.search.includes('mode=register');
  const [isFlipped, setIsFlipped] = useState(isRegisterRoute);

  // Dynamic Auth Settings & Registration Fields from Neon DB
  const [authConfig, setAuthConfig] = useState({
    emailLoginEnabled: true,
    googleLoginEnabled: true,
    facebookLoginEnabled: true,
    phoneLoginEnabled: true,
    otpLoginEnabled: true,
    registrationEnabled: true,
    forgotPasswordEnabled: true,
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Step into your personalized comfort showroom and orders.',
    loginWelcomeMessage: 'Doctor-Engineered Cloud Slippers • Handcrafted Daily Luxury',
    registerTitle: 'Create Your Account',
    registerSubtitle: 'Join for exclusive slipper drops & priority shipping.',
    registerWelcomeMessage: 'Handcrafted luxury comfort engineered for everyday elegance.',
    passwordPolicy: {
      minLength: 6,
      requireUppercase: false,
      requireNumber: false,
      requireSpecialChar: false,
    },
    registrationFields: [],
  });

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    password: '',
    confirmPassword: '',
    customFields: {},
    acceptTerms: true,
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot Password Modal States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState(null);

  // General Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const from = location.state?.from?.pathname || '/account';

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch dynamic auth configuration from Neon DB
  useEffect(() => {
    const fetchAuthStrategy = async () => {
      try {
        const res = await authService.getAuthSettings();
        if (res?.data) {
          setAuthConfig(res.data);
        }
      } catch (err) {
        console.warn('Using default auth strategy:', err.message);
      }
    };
    fetchAuthStrategy();
  }, []);

  // Check for session expiration message in session storage
  useEffect(() => {
    const expiredMsg = sessionStorage.getItem('aurasole_session_expired_msg') || location.state?.sessionExpiredMsg;
    if (expiredMsg) {
      setError(expiredMsg);
      sessionStorage.removeItem('aurasole_session_expired_msg');
    }
  }, [location]);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!loginEmail || !loginPassword) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword);
      const role = res?.data?.user?.role;
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else if (res?.data?.user?.isProfileComplete === false) {
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

  // Handle Registration Custom Field Change
  const handleCustomFieldChange = (key, value) => {
    setRegisterData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value,
      },
    }));
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Please fill in all required account information.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const minLen = authConfig.passwordPolicy?.minLength || 6;
    if (registerData.password.length < minLen) {
      setError(`Password must be at least ${minLen} characters long.`);
      return;
    }

    if (authConfig.passwordPolicy?.requireUppercase && !/[A-Z]/.test(registerData.password)) {
      setError('Password must contain at least one uppercase letter (A-Z).');
      return;
    }

    if (authConfig.passwordPolicy?.requireNumber && !/[0-9]/.test(registerData.password)) {
      setError('Password must contain at least one number (0-9).');
      return;
    }

    if (authConfig.passwordPolicy?.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(registerData.password)) {
      setError('Password must contain at least one special character.');
      return;
    }

    // Validate dynamic required fields
    for (const field of authConfig.registrationFields || []) {
      if (field.isRequired) {
        const val =
          field.fieldKey === 'phone'
            ? registerData.phone
            : field.fieldKey === 'whatsappNumber'
            ? registerData.whatsappNumber
            : registerData.customFields[field.fieldKey];

        if (!val || String(val).trim() === '') {
          setError(`${field.fieldName} is required to create an account.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone || undefined,
        whatsappNumber: registerData.whatsappNumber || undefined,
        password: registerData.password,
        customFields: registerData.customFields,
      };

      const res = await register(payload);
      setSuccessMessage('Account created successfully! Welcome to AuraSole.');
      setTimeout(() => {
        navigate('/onboarding', { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In
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

  // Facebook Sign-In
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

  // Forgot Password Submit
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotEmail) {
      setForgotError('Please enter your account email.');
      return;
    }

    setForgotSubmitting(true);
    try {
      await authService.forgotPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset link.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-warmWhite flex flex-col justify-between relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8 select-none">
      {/* Background Decorative Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-luxury-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-luxury-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5 group active:scale-98 transition-transform">
          {globalStoreSettings.logo ? (
            <img src={globalStoreSettings.logo} alt="AuraSole" className="h-8 object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center font-display font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              A
            </div>
          )}
          <span className="font-display font-black text-2xl tracking-tight text-luxury-dark">
            Aura<span className="text-luxury-accent">Sole</span>
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs font-bold text-gray-500 hover:text-luxury-dark flex items-center gap-1 transition-colors"
        >
          <Compass className="w-3.5 h-3.5" /> Back to Store
        </Link>
      </header>

      {/* Main 3D Card Container */}
      <main className="max-w-6xl mx-auto w-full my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: 3D Luxury Slipper Showcase / Brand Message (Hidden on small mobile) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-accent/15 border border-luxury-accent/30 text-luxury-dark text-[11px] font-bold tracking-wider uppercase w-fit">
            <Sparkles className="w-3.5 h-3.5 text-luxury-accent" />
            <span>Doctor-Engineered Slipper Studio</span>
          </div>

          <h1 className="font-display font-black text-3xl xl:text-4xl text-luxury-dark leading-tight">
            {isFlipped ? authConfig.registerTitle : authConfig.loginTitle}
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed max-w-md">
            {isFlipped ? authConfig.registerSubtitle : authConfig.loginSubtitle}
          </p>

          {/* Interactive 3D Floating Slipper Canvas */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 p-6 border border-stone-800 text-white shadow-2xl">
            <div className="h-44 flex items-center justify-center">
              {isFull3D ? (
                <FloatingSlipper3D height={160} color="#C8A97E" autoRotate={true} />
              ) : (
                <div className="text-center space-y-2">
                  <span className="text-4xl">👡</span>
                  <p className="text-xs font-mono text-luxury-accent font-bold">Cloud Comfort Soles</p>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-stone-800 text-center">
              <p className="text-xs font-mono text-stone-300">
                {isFlipped ? authConfig.registerWelcomeMessage : authConfig.loginWelcomeMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: 3D FLIP AUTHENTICATION CARD */}
        <div className="col-span-1 lg:col-span-7 flex justify-center">
          <div
            className="w-full max-w-md"
            style={{
              perspective: '1200px',
            }}
          >
            {/* 3D Rotating Inner Card Body */}
            <div
              className="relative w-full rounded-3xl shadow-2xl transition-transform duration-700 ease-out transform-gpu will-change-transform"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: prefersReducedMotion ? 'none' : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* ========================================================= */}
              {/* FRONT FACE: CUSTOMER LOGIN FORM */}
              {/* ========================================================= */}
              <div
                className={`w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-xl ${
                  isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center font-display font-black text-xl mx-auto shadow-md mb-2">
                    A
                  </div>
                  <h2 className="font-display font-black text-2xl text-luxury-dark">Customer Sign In</h2>
                  <p className="text-xs text-gray-500 mt-1">Access your saved slippers, orders & priority delivery</p>
                </div>

                {/* Error Banner */}
                {error && !isFlipped && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMessage && !isFlipped && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{successMessage}</span>
                  </div>
                )}

                {/* Social Login Buttons (Google / Facebook) */}
                {(authConfig.googleLoginEnabled || authConfig.facebookLoginEnabled) && (
                  <div className="space-y-2.5 mb-5">
                    {authConfig.googleLoginEnabled && (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isSubmitting}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-xs transition-all active:scale-98 disabled:opacity-50"
                      >
                        {isGoogleLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-luxury-accent" />
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                        )}
                        <span>Continue with Google</span>
                      </button>
                    )}

                    {authConfig.facebookLoginEnabled && (
                      <button
                        type="button"
                        onClick={handleFacebookSignIn}
                        disabled={isFacebookLoading || isSubmitting}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold shadow-xs transition-all active:scale-98 disabled:opacity-50"
                      >
                        {isFacebookLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        )}
                        <span>Continue with Facebook</span>
                      </button>
                    )}

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-gray-100" />
                      <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-gray-400">
                        Or sign in with email
                      </span>
                      <div className="flex-grow border-t border-gray-100" />
                    </div>
                  </div>
                )}

                {/* Email / Password Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                      />
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                        Password
                      </label>
                      {authConfig.forgotPasswordEnabled && (
                        <button
                          type="button"
                          onClick={() => {
                            setForgotEmail(loginEmail);
                            setShowForgotPassword(true);
                          }}
                          className="text-[11px] font-bold text-luxury-accent hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-luxury-dark text-white hover:bg-stone-800 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-luxury-accent" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Showroom</span>
                        <ArrowRight className="w-3.5 h-3.5 text-luxury-accent" />
                      </>
                    )}
                  </button>
                </form>

                {/* 3D FLIP TO REGISTER BUTTON */}
                {authConfig.registrationEnabled && (
                  <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-2">New to AuraSole Footwear?</p>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setIsFlipped(true);
                      }}
                      className="w-full py-2.5 bg-luxury-warmWhite hover:bg-stone-100 text-luxury-dark border border-gray-200 rounded-2xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-xs group"
                    >
                      <span>Create New Account</span>
                      <Sparkles className="w-3.5 h-3.5 text-luxury-accent group-hover:rotate-12 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* BACK FACE: DYNAMIC REGISTRATION FORM */}
              {/* ========================================================= */}
              <div
                className={`absolute inset-0 w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-xl overflow-y-auto ${
                  isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  maxHeight: '85vh',
                }}
              >
                <div className="text-center mb-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-accent/15 text-luxury-dark text-[10px] font-black uppercase mb-1">
                    <Sparkles className="w-3 h-3 text-luxury-accent" />
                    <span>Join AuraSole Circle</span>
                  </div>
                  <h2 className="font-display font-black text-2xl text-luxury-dark">Create Account</h2>
                  <p className="text-xs text-gray-500">Fast doorstep delivery & customized slipper sizing</p>
                </div>

                {/* Error Banner */}
                {error && isFlipped && (
                  <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        placeholder="Naga Seshu Kumar"
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                      />
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-10 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-10 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Admin-Defined Custom Registration Fields */}
                  {authConfig.registrationFields?.map((field) => (
                    <div key={field.id}>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        {field.fieldName} {field.isRequired ? '*' : '(Optional)'}
                      </label>

                      {field.fieldType === 'SELECT' ? (
                        <select
                          required={field.isRequired}
                          value={
                            field.fieldKey === 'phone'
                              ? registerData.phone
                              : field.fieldKey === 'whatsappNumber'
                              ? registerData.whatsappNumber
                              : registerData.customFields[field.fieldKey] || ''
                          }
                          onChange={(e) => {
                            if (field.fieldKey === 'phone') {
                              setRegisterData({ ...registerData, phone: e.target.value });
                            } else if (field.fieldKey === 'whatsappNumber') {
                              setRegisterData({ ...registerData, whatsappNumber: e.target.value });
                            } else {
                              handleCustomFieldChange(field.fieldKey, e.target.value);
                            }
                          }}
                          className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                        >
                          <option value="">{field.placeholder || `Select ${field.fieldName}`}</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.fieldType === 'TEXTAREA' ? (
                        <textarea
                          rows={2}
                          required={field.isRequired}
                          value={registerData.customFields[field.fieldKey] || ''}
                          onChange={(e) => handleCustomFieldChange(field.fieldKey, e.target.value)}
                          placeholder={field.placeholder || field.fieldName}
                          className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                        />
                      ) : (
                        <input
                          type={field.fieldType === 'NUMBER' ? 'number' : field.fieldType === 'DATE' ? 'date' : field.fieldType === 'TEL' ? 'tel' : 'text'}
                          required={field.isRequired}
                          value={
                            field.fieldKey === 'phone'
                              ? registerData.phone
                              : field.fieldKey === 'whatsappNumber'
                              ? registerData.whatsappNumber
                              : registerData.customFields[field.fieldKey] || ''
                          }
                          onChange={(e) => {
                            if (field.fieldKey === 'phone') {
                              setRegisterData({ ...registerData, phone: e.target.value });
                            } else if (field.fieldKey === 'whatsappNumber') {
                              setRegisterData({ ...registerData, whatsappNumber: e.target.value });
                            } else {
                              handleCustomFieldChange(field.fieldKey, e.target.value);
                            }
                          }}
                          placeholder={field.placeholder || field.fieldName}
                          className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                        />
                      )}
                    </div>
                  ))}

                  {/* Password Rules Checklist */}
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] text-gray-500 space-y-1">
                    <span className="font-bold uppercase text-gray-700 block mb-0.5">Password Policy:</span>
                    <div className="flex items-center gap-1.5">
                      <span className={registerData.password.length >= (authConfig.passwordPolicy?.minLength || 6) ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                        • At least {authConfig.passwordPolicy?.minLength || 6} characters
                      </span>
                    </div>
                    {authConfig.passwordPolicy?.requireUppercase && (
                      <div className="flex items-center gap-1.5">
                        <span className={/[A-Z]/.test(registerData.password) ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                          • At least one uppercase letter (A-Z)
                        </span>
                      </div>
                    )}
                    {authConfig.passwordPolicy?.requireNumber && (
                      <div className="flex items-center gap-1.5">
                        <span className={/[0-9]/.test(registerData.password) ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                          • At least one number (0-9)
                        </span>
                      </div>
                    )}
                    {authConfig.passwordPolicy?.requireSpecialChar && (
                      <div className="flex items-center gap-1.5">
                        <span className={/[!@#$%^&*(),.?":{}|<>]/.test(registerData.password) ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                          • At least one special character
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-luxury-dark text-white hover:bg-stone-800 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 disabled:opacity-60 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-luxury-accent" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Slipper Account</span>
                        <ArrowRight className="w-3.5 h-3.5 text-luxury-accent" />
                      </>
                    )}
                  </button>
                </form>

                {/* 3D REVERSE FLIP TO LOGIN BUTTON */}
                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 mb-1.5">Already registered with AuraSole?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setIsFlipped(false);
                    }}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-luxury-accent" />
                    <span>Back to Customer Sign In</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotSuccess(false);
                setForgotError(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {forgotSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-gray-900">Reset Email Dispatched</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  If an account is associated with <strong>{forgotEmail}</strong>, a single-use password reset link has been sent to your inbox.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSuccess(false);
                  }}
                  className="mt-4 px-6 py-2.5 bg-luxury-dark text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-luxury-accent/15 text-luxury-dark flex items-center justify-center mx-auto mb-2 font-bold">
                    🔑
                  </div>
                  <h3 className="font-display font-black text-xl text-luxury-dark">Reset Password</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your registered email address and we'll send a secure password reset link.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="w-full py-2.5 bg-luxury-dark text-white rounded-2xl text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow"
                >
                  {forgotSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-luxury-accent" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-gray-400 pt-6 border-t border-gray-100/60 z-10">
        <p>© {new Date().getFullYear()} AuraSole Footwear Studio. 256-Bit SSL Encrypted Authentication.</p>
      </footer>
    </div>
  );
};

export default Login;
