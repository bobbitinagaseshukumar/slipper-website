import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Tag, Sparkles } from 'lucide-react';
import RevealOnScroll from '../common/RevealOnScroll';

const ShopByBrand = ({ brands = [] }) => {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="py-16 bg-stone-950 text-white border-b border-stone-900 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-luxury-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
                  Footwear Houses & Labels
                </span>
                <span className="px-2 py-0.5 rounded-full bg-luxury-accent/20 text-luxury-accent text-[10px] font-black border border-luxury-accent/30">
                  Featured Brands
                </span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white mt-1">
                Shop by Footwear Brand
              </h2>
            </div>
            <Link
              to="/shop"
              className="mt-3 sm:mt-0 text-xs sm:text-sm font-bold text-luxury-accent hover:text-white flex items-center gap-1 transition-colors group"
            >
              <span>View All Slippers</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </RevealOnScroll>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((b, idx) => (
            <RevealOnScroll key={b.id} direction="up" delay={idx * 50}>
              <Link
                to={`/brand/${b.slug}`}
                className="group p-5 rounded-3xl bg-stone-900/80 border border-stone-800 hover:border-luxury-accent/60 hover:bg-stone-800/90 transition-all duration-300 flex flex-col items-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 block"
              >
                {/* Brand Logo (Admin Uploaded & Cropped) */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-950 border border-stone-800 p-2 flex items-center justify-center overflow-hidden mb-3 group-hover:scale-105 transition-transform">
                  {b.image ? (
                    <img src={b.image} alt={b.imageAlt || b.name} className="w-full h-full object-contain" />
                  ) : (
                    <Tag className="w-8 h-8 text-stone-700 group-hover:text-luxury-accent transition-colors" />
                  )}
                </div>

                <h3 className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-luxury-accent transition-colors line-clamp-1">
                  {b.name}
                </h3>

                <span className="text-[10px] font-mono text-stone-400 mt-0.5">
                  {b._count?.products || 0} Models
                </span>

                {b.brandingType === 'COMPANY' && (
                  <span className="mt-2 px-2 py-0.5 rounded-full bg-luxury-accent/15 text-luxury-accent text-[9px] font-bold border border-luxury-accent/30">
                    Company
                  </span>
                )}
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByBrand;
