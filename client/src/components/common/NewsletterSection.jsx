import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import notificationService from '../../services/notificationService';
import RevealOnScroll from './RevealOnScroll';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await notificationService.subscribe(email);
      setIsSuccess(true);
      setMessage(res.data?.message || res.message || "You're subscribed! 🎉");
      setEmail('');
    } catch (err) {
      setError(err.message || 'Subscription failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-luxury-warmWhite to-white border-t border-gray-100 relative overflow-hidden">
      {/* Background Lighting Glows */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-luxury-accent/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-brand-200/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <RevealOnScroll direction="up">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-gray-200/80 shadow-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-luxury-dark text-luxury-accent text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Slipper Club VIP</span>
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark">
                Never Miss a Slipper Deal
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Subscribe to receive fresh season drops, festival offers, and exclusive VIP coupons directly in your inbox.
              </p>
            </div>

            {isSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
                {error && (
                  <p className="text-xs font-semibold text-rose-600">{error}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all shadow-2xs"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3.5 px-6 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 disabled:opacity-50 transform-gpu"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-gray-400">
                  Zero spam. Unsubscribe anytime with 1-click in your profile.
                </p>
              </form>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default NewsletterSection;
