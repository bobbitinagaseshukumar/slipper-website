import React from 'react';
import { X, Check } from 'lucide-react';
import FilterSidebar from './FilterSidebar';

const MobileFilterDrawer = ({
  isOpen,
  onClose,
  filters,
  filterOptions,
  onFilterChange,
  onClearAll,
  totalProducts = 0,
  activeCount = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl z-10 flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Sticky Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-luxury-warmWhite rounded-t-3xl">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base text-luxury-dark">Filters</h3>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-luxury-accent text-luxury-dark text-xs font-black">
                {activeCount} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div className="p-4 overflow-y-auto flex-1">
          <FilterSidebar
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
            activeCount={activeCount}
          />
        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-3 shadow-lg">
          <button
            type="button"
            onClick={onClearAll}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-2xl transition-colors"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-2 py-3 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <Check className="w-4 h-4" /> Apply ({totalProducts} Slippers)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterDrawer;
