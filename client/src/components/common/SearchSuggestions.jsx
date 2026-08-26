import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, ArrowRight, Sparkles } from 'lucide-react';

const SearchSuggestions = ({ suggestions, query, onClose, isVisible }) => {
  const navigate = useNavigate();

  if (!isVisible || !query || query.trim().length < 2) return null;

  const { products = [], categories = [], keywords = [] } = suggestions;

  const handleProductClick = (slug) => {
    onClose();
    navigate(`/products/${slug}`);
  };

  const handleCategoryClick = (slug) => {
    onClose();
    navigate(`/shop?category=${slug}`);
  };

  const handleSearchSubmit = (searchTerm) => {
    onClose();
    navigate(`/shop?q=${encodeURIComponent(searchTerm)}`);
  };

  const hasResults = products.length > 0 || categories.length > 0 || keywords.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/80 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
      {!hasResults ? (
        <div className="py-6 text-center text-gray-500">
          <p className="text-sm font-medium">No direct suggestions for "{query}"</p>
          <button
            onClick={() => handleSearchSubmit(query)}
            className="mt-2 text-xs font-semibold text-luxury-accent hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            Search all slippers for "{query}" <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <div className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3 text-luxury-accent" /> Categories
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="px-3 py-1 bg-luxury-warmWhite hover:bg-luxury-accent hover:text-white rounded-full text-xs font-medium text-gray-700 transition-colors border border-gray-200/60"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {keywords.length > 0 && (
            <div>
              <div className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-luxury-accent" /> Popular Searches
              </div>
              <div className="space-y-1">
                {keywords.map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSubmit(kw)}
                    className="w-full text-left px-3 py-1.5 hover:bg-luxury-warmWhite rounded-lg text-xs font-medium text-gray-600 hover:text-luxury-dark transition-colors flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-luxury-accent" />
                      {kw}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-luxury-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Slipper Products */}
          {products.length > 0 && (
            <div>
              <div className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2">
                Matching Slippers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleProductClick(prod.slug)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-luxury-warmWhite/80 transition-all text-left border border-transparent hover:border-gray-200/50 group"
                  >
                    <img
                      src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=200'}
                      alt={prod.name}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-luxury-accent transition-colors">
                        {prod.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-luxury-dark">₹{prod.price}</span>
                        {prod.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through">₹{prod.originalPrice}</span>
                        )}
                        {prod.discountPercentage > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            {prod.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View All Search Action */}
          <div className="pt-2 border-t border-gray-100 text-center">
            <button
              onClick={() => handleSearchSubmit(query)}
              className="w-full py-2 bg-luxury-dark text-white hover:bg-luxury-accent rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" /> View all results for "{query}"
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
