import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Clock } from 'lucide-react';

const FlashSaleBanner = () => {
  // 12 hours countdown state
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 45,
    seconds: 20,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <section className="py-12 bg-luxury-warmWhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-luxury-dark via-stone-900 to-luxury-surface text-white p-8 sm:p-12 shadow-2xl border border-white/10">
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-luxury-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black tracking-wider uppercase">
                <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
                <span>Limited Edition Flash Sale</span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                Up to 45% OFF on <br className="hidden sm:inline" />
                <span className="text-luxury-accent">Cloud Comfort & Arch Slides</span>
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed font-normal">
                Upgrade your daily footwear comfort. Use promo code{' '}
                <span className="text-luxury-gold font-bold bg-white/10 px-2 py-0.5 rounded">
                  COMFORT15
                </span>{' '}
                at checkout for an additional 15% instant savings.
              </p>

              <div className="pt-2 flex justify-center lg:justify-start">
                <Link
                  to="/shop?sort=discount"
                  className="px-8 py-3.5 rounded-full bg-luxury-accent hover:bg-luxury-accentHover text-luxury-dark font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center gap-2 group"
                >
                  <span>Claim Flash Offer</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Timer Boxes */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-1 text-luxury-accent text-xs font-bold uppercase tracking-wider mb-4">
                <Clock className="w-4 h-4" /> Deal Ends In
              </div>

              <div className="flex items-center gap-2 sm:gap-3 max-w-full justify-center">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div className="w-13 h-13 sm:w-20 sm:h-20 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center font-display font-black text-lg sm:text-3xl text-white shadow-inner">
                    {formatNumber(timeLeft.hours)}
                  </div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 mt-1">Hours</span>
                </div>

                <span className="font-black text-xl sm:text-2xl text-luxury-accent mb-4">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div className="w-13 h-13 sm:w-20 sm:h-20 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center font-display font-black text-lg sm:text-3xl text-white shadow-inner">
                    {formatNumber(timeLeft.minutes)}
                  </div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 mt-1">Mins</span>
                </div>

                <span className="font-black text-xl sm:text-2xl text-luxury-accent mb-4">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div className="w-13 h-13 sm:w-20 sm:h-20 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center font-display font-black text-lg sm:text-3xl text-luxury-gold shadow-inner">
                    {formatNumber(timeLeft.seconds)}
                  </div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 mt-1">Secs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleBanner;
