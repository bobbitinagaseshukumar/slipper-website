import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const SortDropdown = ({ value = 'recommended', onChange }) => {
  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'newest', label: 'New Arrivals First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'bestselling', label: 'Best Sellers' },
    { value: 'discount', label: 'Biggest Discount' },
  ];

  return (
    <div className="relative inline-flex items-center gap-2">
      <span className="hidden sm:inline text-xs font-semibold text-gray-500 flex items-center gap-1">
        <ArrowUpDown className="w-3.5 h-3.5" /> Sort By:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-gray-200 text-luxury-dark text-xs font-bold py-2.5 pl-3 pr-8 rounded-2xl focus:outline-none focus:border-luxury-accent cursor-pointer shadow-xs transition-colors"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
