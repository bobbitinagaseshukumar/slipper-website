import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MailX, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import notificationService from '../services/notificationService';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirmUnsubscribe = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await notificationService.unsubscribe({ token, email });
      setIsUnsubscribed(true);
    } catch (err) {
      setError(err.message || 'Failed to update subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-warmWhite flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center font-display font-black text-xl shadow-md">
            A
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-luxury-dark">
            Aura<span className="text-luxury-accent">Sole</span>
          </span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-100 text-center space-y-6">
        {isUnsubscribed ? (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="font-display font-black text-xl text-luxury-dark">
              Unsubscribed Successfully
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              You will no longer receive marketing, coupon, or festival emails from AuraSole Footwear. Essential transactional emails regarding your orders will still be delivered safely.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="w-full py-3.5 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 transform-gpu"
              >
                <span>Return to Store</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <MailX className="w-7 h-7" />
            </div>
            <h2 className="font-display font-black text-xl text-luxury-dark">
              Email Preferences
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure you want to unsubscribe <strong>{email || 'your email'}</strong> from AuraSole promotional updates, festival deals, and special coupons?
            </p>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmUnsubscribe}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Unsubscribe from Marketing</span>
                )}
              </button>

              <Link
                to="/"
                className="block w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
              >
                Keep My Subscription
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
