import React from 'react';
import { X, RotateCcw } from 'lucide-react';

const ActiveFilters = ({ filters = {}, onRemoveFilter, onClearAll }) => {
  const chips = [];

  if (filters.q) {
    chips.push({ key: 'q', label: `Search: "${filters.q}"`, value: '' });
  }

  if (filters.category) {
    chips.push({ key: 'category', label: `Category: ${filters.category}`, value: '' });
  }

  if (filters.gender) {
    filters.gender.split(',').forEach((g) => {
      chips.push({
        key: 'gender',
        label: `Gender: ${g}`,
        value: g,
        isMulti: true,
      });
    });
  }

  if (filters.size) {
    filters.size.split(',').forEach((s) => {
      chips.push({
        key: 'size',
        label: `Size: ${s}`,
        value: s,
        isMulti: true,
      });
    });
  }

  if (filters.color) {
    filters.color.split(',').forEach((c) => {
      chips.push({
        key: 'color',
        label: `Color: ${c}`,
        value: c,
        isMulti: true,
      });
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: 'price',
      label: `₹${filters.minPrice || 0} - ₹${filters.maxPrice || '3000+'}`,
      isPrice: true,
    });
  }

  if (filters.rating) {
    chips.push({ key: 'rating', label: `${filters.rating}★ & Above`, value: '' });
  }

  if (filters.minDiscount) {
    chips.push({ key: 'minDiscount', label: `${filters.minDiscount}%+ Discount`, value: '' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-xs font-bold text-gray-400 mr-1">Active:</span>
      {chips.map((chip, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-warmWhite border border-luxury-accent/30 text-luxury-dark text-xs font-semibold shadow-2xs group"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(chip)}
            className="p-0.5 rounded-full text-gray-400 hover:text-rose-600 hover:bg-white transition-colors"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 ml-2 transition-colors"
      >
        <RotateCcw className="w-3 h-3" /> Clear All
      </button>
    </div>
  );
};

export default ActiveFilters;
