import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, RefreshCw, Mail, CheckCircle2, Lock } from 'lucide-react';
import otpService from '../services/otpService';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

const OTPVerification = () => {
  const { settings } = useStoreSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth() || {};

  const email = location.state?.email || '';
  const purpose = location.state?.purpose || 'LOGIN';
  const name = location.state?.name || '';
  const redirectUrl = location.state?.redirectUrl || '/account';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [cooldown, setCooldown] = useState(30);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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
      handleVerify(newDigits.join(''));
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
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpCode) => {
    const code = otpCode || digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await otpService.verifyCustomerOTP({
        email,
        otp: code,
        purpose,
        name,
      });

      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
        if (loginWithToken) loginWithToken(res.data.token, res.data.user);
      }

      setSuccessMsg('Verification successful! Taking you to your slippers...');
      setTimeout(() => {
        navigate(redirectUrl, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Incorrect verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    try {
      await otpService.sendCustomerOTP({ email, purpose, name });
      setCooldown(30);
      setSuccessMsg('A new verification code has been sent to your email.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-warmWhite flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.storeName} className="h-10 max-w-[140px] object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center font-display font-black text-xl shadow-md">
              {settings.storeName ? settings.storeName.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
          <span className="font-display font-black text-2xl tracking-tight text-luxury-dark">
            {settings.storeName || 'AuraSole'}
          </span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-100 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-display font-black text-2xl text-luxury-dark tracking-tight">
            Security Verification
          </h2>
          <p className="text-xs text-gray-500">
            We sent a 6-digit verification code to
          </p>
          <p className="text-xs font-mono font-bold text-gray-900 bg-gray-50 py-1 px-3 rounded-lg inline-block">
            {email}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 6-Digit Inputs */}
        <div className="flex justify-center gap-2 sm:gap-3 my-4" onPaste={handlePaste}>
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
              className="w-11 h-13 sm:w-12 sm:h-14 rounded-2xl border-2 border-gray-200 text-center font-mono font-black text-xl sm:text-2xl text-luxury-dark bg-gray-50 focus:bg-white focus:border-luxury-accent focus:outline-none transition-all shadow-2xs"
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={isSubmitting || digits.some((d) => d === '')}
          onClick={() => handleVerify()}
          className="w-full py-4 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 disabled:opacity-50 transform-gpu"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Resend Cooldown */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <Link to="/login" className="text-gray-400 hover:text-gray-700 font-semibold">
            ← Change Email
          </Link>

          <button
            type="button"
            disabled={cooldown > 0}
            onClick={handleResend}
            className="text-luxury-accent font-bold hover:underline disabled:text-gray-300 disabled:no-underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
