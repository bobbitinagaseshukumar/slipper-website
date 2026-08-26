import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const GlobalPromotionPopup = () => {
  const { settings } = useStoreSettings();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (settings.popupActive) {
      const hasDismissed = sessionStorage.getItem(`popup_dismissed_${settings.popupTitle}`);
      if (!hasDismissed) {
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [settings.popupActive, settings.popupTitle]);

  if (!isOpen || !settings.popupActive) return null;

  const handleClose = () => {
    sessionStorage.setItem(`popup_dismissed_${settings.popupTitle}`, 'true');
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 relative text-center">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-700 transition-colors z-10"
          aria-label="Close promotion popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Optional Image */}
        {settings.popupImage && (
          <div className="aspect-[16/9] w-full bg-luxury-dark overflow-hidden">
            <img
              src={settings.popupImage}
              alt={settings.popupTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-accent/20 text-luxury-accent text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Special Exclusive Drop
          </div>

          <h3 className="font-display font-black text-2xl text-luxury-dark tracking-tight">
            {settings.popupTitle || 'Special Slipper Offer!'}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {settings.popupMessage || 'Use code COMFORT15 on checkout for an exclusive 15% discount on all cloud recovery slides.'}
          </p>

          <div className="pt-2">
            <Link
              to={settings.popupLink || '/shop'}
              onClick={handleClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-luxury-dark hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <span>{settings.popupCtaText || 'Claim Slipper Offer'}</span>
              <ArrowRight className="w-4 h-4 text-luxury-accent" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalPromotionPopup;
