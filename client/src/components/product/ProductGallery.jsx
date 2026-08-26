import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Sparkles, ChevronLeft, ChevronRight, Rotate3d } from 'lucide-react';
import FullscreenImageViewer from './FullscreenImageViewer';

const ProductGallery = ({ images = [], productName = 'Slipper' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0, glowX: 50, glowY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const imageList = images.length > 0
    ? images
    : [{ url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800', altText: productName }];

  const currentImage = imageList[selectedIndex] || imageList[0];

  // Mouse move handler for 3D tilt & magnifying zoom on desktop
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });

    if (!reducedMotion) {
      const centerX = width / 2;
      const centerY = height / 2;
      const mouseX = e.clientX - left;
      const mouseY = e.clientY - top;
      const rotateX = ((mouseY - centerY) / centerY) * -6;
      const rotateY = ((mouseX - centerX) / centerX) * 6;
      setTilt({ x: rotateY, y: rotateX, glowX: x, glowY: y });
    }
  };

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-4 items-start">
        {/* Thumbnails Column with 3D Hover Lift */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar max-h-[520px] shrink-0 py-1">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 shrink-0 bg-stone-100 active:scale-95 transform-gpu ${
                selectedIndex === idx
                  ? 'border-luxury-dark shadow-md scale-105 ring-2 ring-luxury-accent/30'
                  : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100 hover:-translate-y-0.5'
              }`}
            >
              <img
                src={img.url}
                alt={img.altText || `${productName} view ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* 3D Main Showcase Stage */}
        <div className="relative flex-1 w-full perspective-1000 flex flex-col items-center">
          <motion.div
            onMouseEnter={() => {
              setIsZooming(true);
              setIsHovered(true);
            }}
            onMouseLeave={() => {
              setIsZooming(false);
              setIsHovered(false);
              setTilt({ x: 0, y: 0, glowX: 50, glowY: 50 });
            }}
            onMouseMove={handleMouseMove}
            onClick={() => setIsFullscreenOpen(true)}
            style={{
              transform: !reducedMotion && isHovered && !isZooming
                ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-4px) scale3d(1.01, 1.01, 1.01)`
                : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)',
              transition: isHovered ? 'transform 100ms ease-out' : 'transform 400ms ease-out',
            }}
            className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-stone-100 to-stone-200 border border-gray-200/80 shadow-md aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] flex items-center justify-center cursor-crosshair transform-gpu"
          >
            {/* Dynamic Specular Studio Lighting Layer */}
            {isHovered && !reducedMotion && (
              <div
                className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%)`,
                }}
              />
            )}

            {/* Slipper Showcase Image with Cross-fade Animation */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage.url}
                src={currentImage.url}
                alt={currentImage.altText || productName}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transform: 'scale(1.85)',
                      }
                    : { transform: 'scale(1)' }
                }
                className="w-full h-full object-cover transition-transform duration-150 ease-out select-none"
              />
            </AnimatePresence>

            {/* Fullscreen Expansion Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreenOpen(true);
              }}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:text-luxury-dark hover:bg-white shadow-md transition-all hover:scale-110 active:scale-95 z-30"
              aria-label="View fullscreen image"
              title="Expand to Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Slipper Studio Watermark Pill */}
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-luxury-dark/85 text-white backdrop-blur-md text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 pointer-events-none z-30">
              <Sparkles className="w-3 h-3 text-luxury-accent" />
              <span>3D Slipper Studio</span>
            </div>

            {/* Mobile Swipe Navigation Arrows */}
            {imageList.length > 1 && (
              <div className="lg:hidden absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
                  }}
                  className="pointer-events-auto p-2 rounded-full bg-white/85 backdrop-blur-md shadow-md text-gray-800 hover:bg-white active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
                  }}
                  className="pointer-events-auto p-2 rounded-full bg-white/85 backdrop-blur-md shadow-md text-gray-800 hover:bg-white active:scale-90"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Realistic Reactive Soft Shadow underneath */}
          <motion.div
            animate={
              reducedMotion
                ? {}
                : {
                    scale: [1, 0.88, 1],
                    opacity: [0.45, 0.25, 0.45],
                  }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-3/4 h-4 bg-black/20 rounded-[100%] blur-md mt-4 pointer-events-none"
          />
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <FullscreenImageViewer
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        images={imageList}
        initialIndex={selectedIndex}
        productName={productName}
      />
    </>
  );
};

export default ProductGallery;
