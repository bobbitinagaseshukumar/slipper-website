import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, ArrowRight, Flame } from 'lucide-react';
import RevealOnScroll from '../common/RevealOnScroll';
import ProductCard from '../product/ProductCard';

/**
 * Calculates remaining time until target date
 */
const calculateTimeLeft = (targetDate) => {
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - new Date().getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
};

const DynamicSection = ({ section }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(section?.endDate));

  useEffect(() => {
    if (!section?.endDate) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(section.endDate);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [section?.endDate]);

  if (!section || !section.isActive) return null;

  const productsList = section.products
    ?.map((item) => item.product)
    ?.filter((p) => p && p.isActive !== false) || [];

  if (productsList.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-luxury-warmWhite relative overflow-hidden border-t border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <RevealOnScroll direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {section.badgeText && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    {section.badgeText}
                  </span>
                )}
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
                  Limited Slipper Drop
                </span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-4xl text-luxury-dark tracking-tight">
                {section.title}
              </h2>

              {section.subtitle && (
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed font-medium">
                  {section.subtitle}
                </p>
              )}
            </div>

            {/* Countdown Clock (If scheduled sale active) */}
            {timeLeft && (
              <div className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-stone-800 self-start md:self-auto">
                <Clock className="w-4 h-4 text-luxury-accent animate-pulse" />
                <span className="text-[10px] font-mono text-stone-400 font-bold uppercase mr-1">
                  Sale Ends In:
                </span>
                <div className="flex items-center gap-1 font-mono font-black text-xs text-white">
                  <span className="bg-stone-800 px-1.5 py-0.5 rounded text-luxury-accent">
                    {String(timeLeft.days).padStart(2, '0')}d
                  </span>
                  <span>:</span>
                  <span className="bg-stone-800 px-1.5 py-0.5 rounded text-luxury-accent">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="bg-stone-800 px-1.5 py-0.5 rounded text-luxury-accent">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="bg-stone-800 px-1.5 py-0.5 rounded text-luxury-accent">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            )}
          </div>
        </RevealOnScroll>

        {/* Section Promotional Banner (If provided) */}
        {section.bannerImage && (
          <RevealOnScroll direction="up">
            <div className="w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/1] rounded-3xl overflow-hidden shadow-lg border border-stone-200 relative group">
              {section.bannerImage.endsWith('.mp4') || section.bannerImage.endsWith('.webm') || section.bannerImage.includes('video') ? (
                <video
                  src={section.bannerImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <img
                  src={section.bannerImage}
                  alt={section.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4 sm:p-6">
                <div className="text-white">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-luxury-accent font-bold">
                    Special Showcase
                  </span>
                  <h3 className="font-display font-black text-lg sm:text-2xl">{section.title}</h3>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {productsList.slice(0, section.productLimit || 12).map((prod, idx) => (
            <RevealOnScroll key={prod.id || idx} delay={idx * 75} direction="up">
              <ProductCard product={prod} />
            </RevealOnScroll>
          ))}
        </div>

        {/* View All CTA Button */}
        <div className="text-center pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-luxury-dark text-white hover:bg-luxury-accent hover:text-luxury-dark text-xs font-black uppercase tracking-wider transition-all shadow-md group"
          >
            <span>Explore All Slipper Deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DynamicSection;
