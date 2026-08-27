import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck } from 'lucide-react';

const FloatingSlipper3D = ({
  imageUrl = 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop',
  title = 'AuraCloud Recovery Slide',
  badgeText = 'Cloud-Comfort Technology',
  price = '₹899',
  isCompact = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const motionHandler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', motionHandler);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  // Motion values for smooth cursor and drag parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const dragRotateY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 140, mass: 0.8 };
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [12, -12]), springConfig);
  const rotateYBase = useSpring(useTransform(mouseX, [-200, 200], [-14, 14]), springConfig);
  const rotateY = useTransform([rotateYBase, dragRotateY], ([base, drag]) => base + drag);

  const handleMouseMove = (e) => {
    if (isMobile || reducedMotion || isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (isDragging) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center select-none perspective-1000 ${
        isCompact ? 'p-3' : 'p-6 lg:p-12'
      }`}
    >
      {/* Background Studio Glow & Orbit Ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-gradient-to-tr from-luxury-accent/20 via-luxury-gold/15 to-transparent blur-3xl" />
        <div className="absolute w-80 h-80 lg:w-[420px] lg:h-[420px] rounded-full border border-luxury-accent/20 border-dashed animate-spin [animation-duration:45s]" />
      </div>

      {/* 3D Floating Interactive Card */}
      <motion.div
        style={{
          rotateX: isMobile || reducedMotion ? 0 : rotateX,
          rotateY: isMobile || reducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 flex flex-col items-center cursor-grab active:cursor-grabbing"
      >
        {/* Floating Top Tag Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ transform: 'translateZ(40px)' }}
          className="absolute -top-6 lg:-top-8 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-luxury-accent/40 shadow-lg text-luxury-dark text-xs font-bold flex items-center gap-1.5 z-30"
        >
          <Sparkles className="w-3.5 h-3.5 text-luxury-accent animate-pulse" />
          <span>{badgeText}</span>
        </motion.div>

        {/* Continuous Smooth 3D Slipper Visual Container */}
        <motion.div
          animate={
            reducedMotion
              ? {}
              : {
                  y: [0, -14, 0],
                  rotateZ: [0, 1.2, 0, -1.2, 0],
                }
          }
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative max-w-xs sm:max-w-sm lg:max-w-md transform-gpu"
        >
          {/* Main Slipper Image/Video with AnimatePresence Color Crossfade */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/70 bg-gradient-to-b from-stone-100 to-stone-200">
            <AnimatePresence mode="wait">
              {imageUrl && (imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') || imageUrl.includes('video')) ? (
                <motion.video
                  key={imageUrl}
                  src={imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1.05 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="w-full h-64 sm:h-72 lg:h-80 object-cover select-none pointer-events-none"
                />
              ) : (
                <motion.img
                  key={imageUrl}
                  src={imageUrl}
                  alt={title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1.05 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="w-full h-64 sm:h-72 lg:h-80 object-cover select-none pointer-events-none"
                />
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Pill Info Badge (Bottom Left) */}
          <div
            style={{ transform: 'translateZ(48px)' }}
            className="absolute -bottom-3 left-1 sm:-bottom-4 sm:-left-6 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl bg-luxury-dark/95 text-white backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-2 sm:gap-3 z-30"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-luxury-accent text-luxury-dark flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium">Anatomical Arch</p>
              <p className="text-[11px] sm:text-xs font-bold text-white">100% Relief</p>
            </div>
          </div>

          {/* Floating Pill Price Badge (Bottom Right) */}
          <div
            style={{ transform: 'translateZ(48px)' }}
            className="absolute -bottom-3 right-1 sm:-bottom-4 sm:-right-6 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl bg-white/95 text-luxury-dark backdrop-blur-xl border border-luxury-accent/30 shadow-2xl flex items-center gap-2 z-30"
          >
            <div>
              <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase">Intro Price</p>
              <p className="text-xs sm:text-sm font-black text-luxury-dark">{price}</p>
            </div>
          </div>
        </motion.div>

        {/* Reactive Soft Shadow underneath (scales counter to slipper height) */}
        <motion.div
          animate={
            reducedMotion
              ? {}
              : {
                  scale: [1, 0.82, 1],
                  opacity: [0.55, 0.3, 0.55],
                }
          }
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-48 sm:w-64 h-6 bg-black/30 rounded-[100%] blur-md mt-6"
        />
      </motion.div>
    </div>
  );
};

export default FloatingSlipper3D;
