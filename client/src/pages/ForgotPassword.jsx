import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import authService from '../services/authService';
import { sendPasswordReset } from '../services/firebaseAuthService';
import { isFirebaseConfigured } from '../firebase/config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isFirebaseConfigured) {
        await sendPasswordReset(email);
        setSubmitted(true);
        setMessage('A secure password reset email has been dispatched via Firebase. Please inspect your inbox.');
      } else {
        const res = await authService.forgotPassword(email);
        setSubmitted(true);
        setMessage(res.data?.message || res.message || 'Recovery instructions have been sent to your email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch password recovery link. Please verify your email address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-warmWhite flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center font-display font-black text-xl shadow-md">
            A
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-luxury-dark">
            Aura<span className="text-luxury-accent">Sole</span>
          </span>
        </Link>
        <h2 className="mt-4 font-display font-black text-2xl text-luxury-dark">
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Enter your registered email address and we'll send you a secure recovery link.
        </p>
      </div>

      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 shadow-2xl border border-gray-100/90 transform-gpu">
        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">Check Your Inbox</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="w-full py-3.5 bg-luxury-dark text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 btn-3d-dark transform-gpu"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 disabled:opacity-50 transform-gpu"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Recovery Link...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <Link
                to="/login"
                className="text-xs text-gray-500 hover:text-luxury-dark font-semibold inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
