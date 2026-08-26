import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Award, ChevronDown } from 'lucide-react';
import FloatingSlipper3D from '../3d/FloatingSlipper3D';
import usePerformanceMode from '../../hooks/usePerformanceMode';

const HeroSection = ({ banners = [] }) => {
  const { isLightweight } = usePerformanceMode();

  const primaryBanner = banners[0] || {
    title: 'Experience Pure Cloud Comfort',
    subtitle: 'Handcrafted Ergonomic Slippers & Slides Engineered for Modern Steps',
    tagline: 'SUMMER 2026 EDITION',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop',
    link: '/shop',
    ctaText: 'Shop New Arrivals',
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-luxury-warmWhite via-brand-50/40 to-white pt-6 pb-20 lg:pt-14 lg:pb-28 border-b border-gray-100">
      {/* Background Soft Lighting Glow Blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-luxury-accent/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Cinematic Text Reveal Sequence */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            {/* Tagline Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-dark text-white text-xs font-semibold tracking-wider uppercase shadow-md backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-luxury-accent animate-pulse" />
              <span>{primaryBanner.tagline || 'FOOTWEAR STUDIO'}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-luxury-dark tracking-tight leading-[1.08]"
            >
              Step Into <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-luxury-dark via-luxury-accent to-brand-700 bg-clip-text text-transparent">
                Pure Cloud Comfort
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              {primaryBanner.subtitle ||
                'Engineered with high-density EVA shock absorption, orthopedic arch relief, and premium handcrafted materials. Designed exclusively for your everyday luxury steps.'}
            </motion.p>

            {/* Key Feature Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-semibold text-gray-700"
            >
              <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-gray-200/80 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-luxury-accent" />
                <span>Doctor-Approved Arch Support</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-gray-200/80 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-luxury-accent" />
                <span>Anti-Skid Diamond Grip</span>
              </div>
            </motion.div>

            {/* Action Buttons with 3D Tactile Styling */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3"
            >
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider btn-3d-dark flex items-center justify-center gap-2 group transform-gpu"
              >
                <span>{primaryBanner.ctaText || 'Shop Slipper Collection'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/shop?category=unisex"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-luxury-warmWhite text-luxury-dark border-2 border-luxury-dark/20 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center shadow-sm active:scale-95 transform-gpu"
              >
                Explore Ortho Range
              </Link>
            </motion.div>

            {/* Social Trust Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="pt-6 border-t border-gray-200/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500"
            >
              <div>
                <p className="font-extrabold text-base text-luxury-dark">4.9 / 5.0</p>
                <p className="text-[11px]">Over 15,000+ verified pairs</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="font-extrabold text-base text-luxury-dark">100%</p>
                <p className="text-[11px]">Waterproof & Anti-Skid</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: 3D Floating Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, z: -50 }}
            animate={{ opacity: 1, scale: 1, z: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
            className="lg:col-span-6 flex justify-center"
          >
            <FloatingSlipper3D
              imageUrl={primaryBanner.image}
              title={primaryBanner.title}
              badgeText="AuraSole 2026 Signature"
              price="₹899"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
