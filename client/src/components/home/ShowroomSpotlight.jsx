import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Award, ArrowRight, RotateCw, Eye, Check } from 'lucide-react';
import RevealOnScroll from '../common/RevealOnScroll';
import usePerformanceMode from '../../hooks/usePerformanceMode';

const SHOWROOM_MODELS = [
  {
    id: 'cloud-slide',
    name: 'AuraCloud Dual-Density Slide',
    category: "Men's & Women's Recovery",
    price: '₹899',
    originalPrice: '₹1,299',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=900&auto=format&fit=crop',
    material: 'EVA High-Resilience Cloud Foam',
    finish: 'Smooth Matte Diffuse',
    archSupport: '4.8/5.0 Ergonomic Cradle',
    grip: 'Laser-Siped Hydro Traction',
    slug: 'aurasole-cloud-recovery-slides',
  },
  {
    id: 'ortho-walker',
    name: 'OrthoRelief Wellness Flip-Flop',
    category: 'Therapeutic Footbed',
    price: '₹1,199',
    originalPrice: '₹1,699',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=900&auto=format&fit=crop',
    material: 'Memory Cushion & Natural Rubber Sole',
    finish: 'Textured Anti-Fatigue Top',
    archSupport: 'Doctor-Certified High Arch',
    grip: 'Diamond Micro-Lug Pattern',
    slug: 'orthopedic-comfort-walkers',
  },
  {
    id: 'daily-breeze',
    name: 'AuraBreeze Waterproof Daily Slipper',
    category: 'Monsoon & Indoor Wear',
    price: '₹599',
    originalPrice: '₹899',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop',
    material: '100% Hydrophobic Polymer Compound',
    finish: 'Water-Repellent Satin Sheen',
    archSupport: 'Everyday Medium Arch',
    grip: 'Anti-Skid Tile Grip',
    slug: 'daily-comfort-flip-flops',
  },
];

const ShowroomSpotlight = () => {
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { isFull3D, isLightweight } = usePerformanceMode();

  const currentModel = SHOWROOM_MODELS[selectedModelIndex];

  return (
    <section className="py-24 bg-gradient-to-b from-luxury-dark via-stone-900 to-luxury-dark text-white relative overflow-hidden">
      {/* Studio Lighting Spotlight Cone */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-luxury-accent/25 via-luxury-gold/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
      
      {/* Decorative Showroom Orbit Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[300px] sm:h-[400px] rounded-[100%] border border-white/10 pointer-events-none transform -rotate-12" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Reveal */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-luxury-accent/30 text-luxury-accent text-xs font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Virtual 3D Showroom</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight">
              Step Into the 3D Slipper Stage
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
              Inspect our signature footwear models with realistic studio lighting, floor shadows, and ergonomic material specifications.
            </p>
          </div>
        </RevealOnScroll>

        {/* Model Selection Tabs */}
        <RevealOnScroll direction="up" delay={100}>
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl gap-2 max-w-full overflow-x-auto no-scrollbar">
              {SHOWROOM_MODELS.map((model, idx) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModelIndex(idx);
                    setRotationAngle(0);
                  }}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap active:scale-95 transform-gpu flex items-center gap-2 ${
                    selectedModelIndex === idx
                      ? 'bg-luxury-accent text-luxury-dark shadow-lg scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{model.name}</span>
                  {selectedModelIndex === idx && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* 3D Showroom Stage Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left / Center: Interactive 3D Slipper Showcase Stage */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-lg aspect-square flex items-center justify-center select-none perspective-1200">
              {/* Virtual Pedestal Surface Floor Shadow */}
              <div className="absolute bottom-8 w-3/4 h-12 bg-black/60 rounded-[100%] blur-xl pointer-events-none" />
              <div className="absolute bottom-12 w-1/2 h-6 bg-luxury-accent/20 rounded-[100%] blur-lg pointer-events-none" />

              {/* Floating Slipper with AnimatePresence & Touch Parallax */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentModel.id}
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: isLightweight ? 0 : [0, -16, 0],
                    rotateY: rotationAngle,
                  }}
                  exit={{ opacity: 0, scale: 0.85, y: -20 }}
                  transition={{
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.4 },
                    y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="relative z-20 w-4/5 cursor-grab active:cursor-grabbing transform-gpu"
                  drag={isFull3D ? 'x' : false}
                  dragConstraints={{ left: -100, right: 100 }}
                  dragElastic={0.2}
                  onDrag={(e, info) => setRotationAngle(info.offset.x * 0.25)}
                  onDragEnd={() => {
                    setTimeout(() => setRotationAngle(0), 1000);
                  }}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gradient-to-b from-stone-800 to-stone-900 p-2 group">
                    <img
                      src={currentModel.image}
                      alt={currentModel.name}
                      className="w-full h-full object-cover rounded-2xl filter drop-shadow-2xl"
                    />

                    {/* Slipper Material Badge Tag */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-luxury-dark/90 text-white backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                      <Sparkles className="w-3 h-3 text-luxury-accent" />
                      <span>{currentModel.finish}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Drag to Rotate Hint */}
              {isFull3D && (
                <div className="absolute bottom-0 flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                  <RotateCw className="w-3.5 h-3.5 text-luxury-accent animate-spin [animation-duration:8s]" />
                  <span>Drag horizontally to rotate 3D view</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Technical Slipper Specifications Panel */}
          <div className="lg:col-span-5 space-y-6">
            <RevealOnScroll direction="right">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
                    {currentModel.category}
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
                    {currentModel.name}
                  </h3>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="font-display font-black text-3xl text-luxury-accent">
                      {currentModel.price}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {currentModel.originalPrice}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                      Limited Showroom Offer
                    </span>
                  </div>
                </div>

                {/* Footwear Specs Grid */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-gray-400">Sole Compound:</span>
                    <span className="font-bold text-white text-right">{currentModel.material}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-gray-400">Arch Support:</span>
                    <span className="font-bold text-emerald-400 text-right">{currentModel.archSupport}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-gray-400">Tread Safety:</span>
                    <span className="font-bold text-luxury-accent text-right">{currentModel.grip}</span>
                  </div>
                </div>

                {/* Direct Action CTA */}
                <div className="pt-2">
                  <Link
                    to={`/products/${currentModel.slug}`}
                    className="w-full py-4 px-8 rounded-2xl bg-luxury-accent hover:bg-amber-400 text-luxury-dark font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 transform-gpu"
                  >
                    <span>View Slipper Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowroomSpotlight;
