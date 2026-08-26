import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Star, RotateCcw, Filter } from 'lucide-react';

const FilterSidebar = ({
  filters = {},
  filterOptions = {},
  onFilterChange,
  onClearAll,
  activeCount = 0,
}) => {
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const {
    categories = [],
    sizes = [],
    colors = [],
    materials = [],
    occasions = [],
    priceRange = { min: 0, max: 3000 },
  } = filterOptions;

  const currentCategory = filters.category || '';
  const currentGenders = filters.gender ? filters.gender.split(',') : [];
  const currentSizes = filters.size ? filters.size.split(',') : [];
  const currentColors = filters.color ? filters.color.split(',') : [];
  const currentMaterials = filters.material ? filters.material.split(',') : [];
  const currentMinPrice = filters.minPrice || '';
  const currentMaxPrice = filters.maxPrice || '';
  const currentRating = filters.rating || '';
  const currentDiscount = filters.minDiscount || '';
  const inStockOnly = filters.inStockOnly === 'true';

  // Toggle multi-select values (comma separated)
  const handleMultiSelectToggle = (filterKey, value) => {
    const currentList = filters[filterKey] ? filters[filterKey].split(',') : [];
    let newList;
    if (currentList.includes(value)) {
      newList = currentList.filter((item) => item !== value);
    } else {
      newList = [...currentList, value];
    }
    onFilterChange(filterKey, newList.length > 0 ? newList.join(',') : '');
  };

  return (
    <aside className="w-full bg-white rounded-3xl p-6 border border-gray-100/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-bold text-luxury-dark uppercase tracking-wider">
          <Filter className="w-4 h-4 text-luxury-accent" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-luxury-accent text-luxury-dark text-xs font-black">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div>
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-900 uppercase tracking-wider mb-3"
        >
          <span>Category</span>
          {collapsedSections.category ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {!collapsedSections.category && (
          <div className="space-y-1.5">
            <button
              onClick={() => onFilterChange('category', '')}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                !currentCategory ? 'bg-luxury-dark text-white font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>All Categories</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onFilterChange('category', cat.slug)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  currentCategory === cat.slug
                    ? 'bg-luxury-dark text-white font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span className={`text-[10px] ${currentCategory === cat.slug ? 'text-luxury-accent' : 'text-gray-400'}`}>
                    {cat._count.products}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Gender Filter */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={() => toggleSection('gender')}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-900 uppercase tracking-wider mb-3"
        >
          <span>Gender</span>
          {collapsedSections.gender ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {!collapsedSections.gender && (
          <div className="flex flex-wrap gap-2">
            {['MEN', 'WOMEN', 'KIDS', 'UNISEX'].map((g) => {
              const isSelected = currentGenders.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => handleMultiSelectToggle('gender', g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-luxury-accent border-luxury-accent text-luxury-dark shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {g === 'UNISEX' ? 'Unisex' : g[0] + g.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Size Filter */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={() => toggleSection('size')}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-900 uppercase tracking-wider mb-3"
        >
          <span>Size (UK / India)</span>
          {collapsedSections.size ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {!collapsedSections.size && (
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((s) => {
              const isSelected = currentSizes.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => handleMultiSelectToggle('size', s)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                    isSelected
                      ? 'bg-luxury-dark border-luxury-dark text-white shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Color Swatches Filter */}
      {colors.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => toggleSection('color')}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-900 uppercase tracking-wider mb-3"
          >
            <span>Color</span>
            {collapsedSections.color ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {!collapsedSections.color && (
            <div className="grid grid-cols-2 gap-2">
              {colors.map(({ name, code }) => {
                const isSelected = currentColors.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => handleMultiSelectToggle('color', name)}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border text-[11px] font-medium transition-all text-left truncate ${
                      isSelected
                        ? 'border-luxury-dark bg-luxury-warmWhite font-bold shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: code }}
                      className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                    />
                    <span className="truncate">{name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Price Range Filter */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-900 uppercase tracking-wider mb-3"
        >
          <span>Price (₹)</span>
          {collapsedSections.price ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {!collapsedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-1">Min (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={currentMinPrice}
                  onChange={(e) => onFilterChange('minPrice', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-luxury-accent"
                />
              </div>
              <span className="text-gray-400 mt-4">–</span>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-1">Max (₹)</label>
                <input
                  type="number"
                  placeholder="3000"
                  value={currentMaxPrice}
                  onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-luxury-accent"
                />
              </div>
            </div>

            {/* Quick Price Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Under ₹799', min: '0', max: '799' },
                { label: '₹800 – ₹1,499', min: '800', max: '1499' },
                { label: '₹1,500+', min: '1500', max: '' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onFilterChange('minPrice', p.min);
                    onFilterChange('maxPrice', p.max);
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-semibold text-gray-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Rating Filter */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-900 uppercase tracking-wider mb-3"
        >
          <span>Customer Rating</span>
          {collapsedSections.rating ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {!collapsedSections.rating && (
          <div className="space-y-1.5">
            {[4, 3, 2].map((stars) => {
              const isSelected = currentRating === String(stars);
              return (
                <button
                  key={stars}
                  onClick={() => onFilterChange('rating', isSelected ? '' : String(stars))}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    isSelected ? 'bg-luxury-dark text-white font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < stars ? 'fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span>{stars}★ & Above</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Discount Filter */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={() => toggleSection('discount')}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-900 uppercase tracking-wider mb-3"
        >
          <span>Minimum Discount</span>
          {collapsedSections.discount ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {!collapsedSections.discount && (
          <div className="flex flex-wrap gap-1.5">
            {['10', '20', '30', '40', '50'].map((d) => {
              const isSelected = currentDiscount === d;
              return (
                <button
                  key={d}
                  onClick={() => onFilterChange('minDiscount', isSelected ? '' : d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {d}% or more
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. Availability */}
      <div className="pt-4 border-t border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onFilterChange('inStockOnly', e.target.checked ? 'true' : '')}
            className="w-4 h-4 text-luxury-accent rounded focus:ring-luxury-accent accent-luxury-accent"
          />
          <span className="text-xs font-bold text-gray-800">In Stock Only</span>
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
