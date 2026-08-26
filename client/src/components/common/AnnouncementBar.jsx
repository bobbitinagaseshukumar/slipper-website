import React, { useState } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const AnnouncementBar = ({ text }) => {
  const { settings } = useStoreSettings();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;
  if (settings.announcementActive === false) return null;

  const displayMessage = text || settings.announcementMessage || '🔥 Festival Sale Live — Up to 50% OFF Signature Slippers | Express Free Shipping Across India';
  const destinationLink = settings.announcementLink || '/shop';

  return (
    <div className="bg-luxury-dark text-luxury-warmWhite text-xs py-2 px-4 border-b border-white/10 transition-all duration-300 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center font-medium tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-luxury-accent animate-pulse shrink-0" />
        <span>{displayMessage}</span>
        <Link
          to={destinationLink}
          className="hidden sm:inline-flex items-center gap-0.5 text-luxury-accent hover:text-white ml-2 font-semibold underline underline-offset-2 transition-colors"
        >
          Shop Now <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default AnnouncementBar;
