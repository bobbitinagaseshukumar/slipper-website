import React from 'react';
import { Feather, Shield, Droplets, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Feather,
      title: 'Cloud-Soft High-Density EVA',
      desc: 'Formulated with ultra-resilient micro-cell cushioning that absorbs 37% more ground impact.',
    },
    {
      icon: Shield,
      title: 'Anatomical Arch Alignment',
      desc: 'Deep biomedical heel cradle engineered by foot doctors to soothe plantar fasciitis and heel spurs.',
    },
    {
      icon: Droplets,
      title: 'Diamond Anti-Skid Soles',
      desc: 'Engineered drainage grooves and diamond grip textures ensure secure footing even on wet bathroom tiles.',
    },
    {
      icon: HeartHandshake,
      title: 'Anti-Chafing Ergonomic Straps',
      desc: 'Seamless molded edges and skin-friendly fleece linings prevent blisters and hot spots during all-day wear.',
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-luxury-accent">
            Footwear Science & Ergonomics
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-luxury-dark mt-2">
            Why Feet Love AuraSole
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            We don't make generic shoes. Every slipper is engineered specifically for foot health, spine alignment, and effortless relaxation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-3xl bg-luxury-warmWhite/80 border border-gray-100 hover:border-luxury-accent/40 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center gap-1.5 text-[11px] font-bold text-luxury-accent">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lab Tested</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
