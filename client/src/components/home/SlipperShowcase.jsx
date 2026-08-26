import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import RevealOnScroll from '../common/RevealOnScroll';

const HOTSPOTS = [
  {
    id: 1,
    title: 'Dual-Density Cloud Foam',
    description: 'High-resilience EVA absorbs 60% more heel strike impact.',
    top: '30%',
    left: '28%',
  },
  {
    id: 2,
    title: 'Anatomical Arch Cradle',
    description: 'Sculpted to human foot contours to alleviate plantar fasciitis.',
    top: '55%',
    left: '52%',
  },
  {
    id: 3,
    title: 'Laser-Siped Hydro Grip',
    description: 'Deep micro-grooves channel bathroom water for anti-skid safety.',
    top: '80%',
    left: '75%',
  },
];

const SlipperShowcase = () => {
  const [activeHotspot, setActiveHotspot] = useState(1);

  return (
    <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
      {/* Background Lighting Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-luxury-accent/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-brand-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
              Biomechanics & Craftsmanship
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl">
              Engineered Down to the Millimeter
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Discover why thousands choose AuraSole as their dedicated everyday footwear.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Interactive Slipper Visual with Hotspots */}
          <div className="lg:col-span-7 relative">
            <RevealOnScroll direction="left">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-stone-800/80 to-stone-900/90 border border-white/10 p-6 sm:p-10 shadow-2xl">
                <div className="aspect-[4/3] relative flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1000"
                    alt="AuraSole Slipper Anatomy"
                    className="w-full h-full object-cover rounded-2xl filter drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                  />

                  {/* Interactive Hotspot Pins */}
                  {HOTSPOTS.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => setActiveHotspot(spot.id)}
                      style={{ top: spot.top, left: spot.left }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        activeHotspot === spot.id
                          ? 'bg-luxury-accent text-luxury-dark scale-125 shadow-glow ring-4 ring-luxury-accent/30'
                          : 'bg-white/90 text-gray-900 hover:scale-110 hover:bg-white shadow-lg'
                      }`}
                      aria-label={spot.title}
                    >
                      <span className="text-xs font-black">{spot.id}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>Tap hotspots (1, 2, 3) to inspect anatomy</span>
                  <span className="text-luxury-accent font-bold">100% Waterproof</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Feature Breakdown Cards */}
          <div className="lg:col-span-5 space-y-4">
            {HOTSPOTS.map((spot) => {
              const isActive = activeHotspot === spot.id;
              return (
                <RevealOnScroll key={spot.id} delay={spot.id * 100} direction="right">
                  <div
                    onClick={() => setActiveHotspot(spot.id)}
                    className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-white/10 border-luxury-accent/50 shadow-lg translate-x-2'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isActive
                            ? 'bg-luxury-accent text-luxury-dark font-black'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {spot.id}
                      </div>
                      <h3 className="font-display font-bold text-base text-white">
                        {spot.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed pl-10">
                      {spot.description}
                    </p>
                  </div>
                </RevealOnScroll>
              );
            })}

            <div className="pt-4 pl-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-luxury-accent hover:bg-amber-400 text-luxury-dark font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95"
              >
                <span>Shop Ortho & Comfort Slippers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SlipperShowcase;
