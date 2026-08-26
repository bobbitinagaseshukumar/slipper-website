import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import otpService from '../../services/otpService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth() || {};

  const [step, setStep] = useState(1); // 1 = Credentials, 2 = 2FA OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // OTP Step 2 State
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(30);
  const inputsRef = useRef([]);

  // Cooldown countdown timer
  useEffect(() => {
    if (step === 2 && cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, cooldown]);

  // Step 1: Submit Credentials & Request 2FA OTP
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await otpService.sendAdminLoginOTP({ email, password });
      setStep(2);
      setCooldown(30);
      setSuccessMsg(`Security verification code sent to ${email}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP input
  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...digits];
    newDigits[index] = cleanVal ? cleanVal.slice(-1) : '';
    setDigits(newDigits);
    setError(null);

    // Auto-advance
    if (cleanVal && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit on 6th digit
    if (cleanVal && index === 5 && newDigits.every((d) => d !== '')) {
      handleOtpVerify(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      handleOtpVerify(pasted);
    }
  };

  // Step 2: Verify 2FA OTP and Grant Admin Access
  const handleOtpVerify = async (otpCode) => {
    const code = otpCode || digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await otpService.verifyAdminLoginOTP({ email, otp: code });
      if (res?.data?.token) {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('token', res.data.token);
        if (loginWithToken) loginWithToken(res.data.token, res.data.admin);
      }

      setSuccessMsg('2FA verified! Loading Admin Portal...');
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 800);
    } catch (err) {
      setError(err.message || 'Incorrect admin security code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setError(null);
    try {
      await otpService.sendAdminLoginOTP({ email, password });
      setCooldown(30);
      setSuccessMsg('A new administrator security code has been sent.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-7 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-luxury-dark border border-luxury-accent/40 text-luxury-accent flex items-center justify-center mx-auto shadow-glow">
            {step === 1 ? <Shield className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-luxury-accent font-bold">
            {step === 1 ? 'Store Management Portal' : '2-Factor Authentication Required'}
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            {step === 1 ? 'AuraSole Admin' : 'Enter Admin Security Code'}
          </h1>
          <p className="text-xs text-stone-400">
            {step === 1
              ? 'Sign in to manage slipper inventory, orders, customers & storefront.'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Admin Credentials Form */}
        {step === 1 && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aurasole.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-luxury-accent transition-colors"
                />
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-luxury-accent transition-colors"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-luxury-accent hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-glow transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Continue to 2FA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 2FA OTP Form */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 rounded-2xl border-2 border-stone-800 text-center font-mono font-black text-xl sm:text-2xl text-luxury-accent bg-stone-950 focus:bg-stone-900 focus:border-luxury-accent focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <button
              type="button"
              disabled={isLoading || digits.some((d) => d === '')}
              onClick={() => handleOtpVerify()}
              className="w-full py-4 rounded-2xl bg-luxury-accent hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-glow transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying 2FA Security...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Admin Portal</span>
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-stone-400 hover:text-stone-200 font-semibold"
              >
                ← Back to Password
              </button>

              <button
                type="button"
                disabled={cooldown > 0}
                onClick={handleResendOTP}
                className="text-luxury-accent font-bold hover:underline disabled:text-stone-600 disabled:no-underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <Link
            to="/"
            className="text-xs font-semibold text-stone-500 hover:text-luxury-accent transition-colors"
          >
            ← Back to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
