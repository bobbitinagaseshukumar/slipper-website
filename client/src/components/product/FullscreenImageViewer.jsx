import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const FullscreenImageViewer = ({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  productName = 'Slipper',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white z-10">
        <div>
          <h3 className="font-display font-bold text-sm sm:text-base text-gray-200 truncate max-w-xs sm:max-w-md">
            {productName}
          </h3>
          <p className="text-xs text-gray-400">
            Image {currentIndex + 1} of {images.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close fullscreen view"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Center Image */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-8 max-h-[80vh]">
        <img
          src={currentImage.url}
          alt={currentImage.altText || productName}
          className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
        />

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
            className="absolute left-2 sm:left-6 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
            className="absolute right-2 sm:right-6 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="flex justify-center gap-2 overflow-x-auto py-2 no-scrollbar z-10">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
              currentIndex === idx
                ? 'border-luxury-accent scale-105 opacity-100 shadow-glow'
                : 'border-white/20 opacity-50 hover:opacity-90'
            }`}
          >
            <img src={img.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FullscreenImageViewer;
