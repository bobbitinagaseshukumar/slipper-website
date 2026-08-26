import React from 'react';
import { Check } from 'lucide-react';

const ColorSelector = ({ colors = [], selectedColor, onSelectColor }) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Color: <span className="text-luxury-dark font-black">{selectedColor}</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {colors.map(({ name, code }) => {
          const isSelected = selectedColor?.toLowerCase() === name?.toLowerCase();
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelectColor(name)}
              className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-all duration-200 transform-gpu active:scale-95 ${
                isSelected
                  ? 'border-luxury-dark bg-luxury-warmWhite shadow-md font-bold ring-2 ring-luxury-accent/30 -translate-y-0.5'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700 hover:-translate-y-0.5 shadow-2xs'
              }`}
            >
              {/* Color Swatch Dot */}
              <span
                style={{ backgroundColor: code || '#1A1A1A' }}
                className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform"
              >
                {isSelected && (
                  <Check
                    className={`w-2.5 h-2.5 ${
                      code?.toLowerCase() === '#ffffff' || code?.toLowerCase() === '#f5f5f5'
                        ? 'text-black'
                        : 'text-white'
                    }`}
                  />
                )}
              </span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;
