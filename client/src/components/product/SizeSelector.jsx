import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import SizeGuideModal from './SizeGuideModal';

const SizeSelector = ({
  allSizes = [],
  availableSizesForColor = [],
  selectedSize,
  onSelectSize,
  gender = 'Adult',
}) => {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Select Size (UK / India):{' '}
            <span className="text-luxury-dark font-black">{selectedSize || 'Choose Size'}</span>
          </label>
          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(true)}
            className="text-xs font-bold text-luxury-accent hover:underline flex items-center gap-1 transition-all active:scale-95"
          >
            <Ruler className="w-3.5 h-3.5" /> Size Guide
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {allSizes.map((size) => {
            const isAvailable = availableSizesForColor.includes(size);
            const isSelected = selectedSize === size;

            return (
              <button
                key={size}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectSize(size)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all duration-200 transform-gpu active:scale-90 ${
                  !isAvailable
                    ? 'border border-dashed border-gray-200 text-gray-300 bg-gray-50/60 cursor-not-allowed line-through'
                    : isSelected
                    ? 'bg-luxury-dark text-white shadow-lg scale-105 border-2 border-luxury-dark ring-2 ring-luxury-accent/40 -translate-y-1'
                    : 'bg-white border border-gray-200 text-gray-800 hover:border-luxury-accent hover:bg-gray-50 hover:-translate-y-0.5 shadow-2xs'
                }`}
                title={isAvailable ? `Size UK ${size}` : `Size UK ${size} Out of Stock`}
              >
                <span>{size}</span>
                <span className="text-[9px] font-normal opacity-70">UK</span>
              </button>
            );
          })}
        </div>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        gender={gender}
      />
    </>
  );
};

export default SizeSelector;
