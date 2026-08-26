import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import productService from '../../services/productService';
import SearchSuggestions from './SearchSuggestions';

const SearchBar = ({ className = '', isMobile = false, onSearchComplete }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [], keywords: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Debounced suggestion fetch
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions({ products: [], categories: [], keywords: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productService.getSuggestions(query);
        if (res?.data) {
          setSuggestions(res.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Suggestions error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    if (onSearchComplete) onSearchComplete();
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions({ products: [], categories: [], keywords: [] });
    setIsOpen(false);
  };

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search slippers, slides, sizes, comfort..."
          className="w-full bg-white/80 hover:bg-white focus:bg-white text-luxury-dark text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-full border border-gray-200 focus:border-luxury-accent focus:ring-2 focus:ring-luxury-accent/20 transition-all outline-none shadow-sm placeholder:text-gray-400"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-luxury-accent animate-spin" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      <SearchSuggestions
        suggestions={suggestions}
        query={query}
        isVisible={isOpen}
        onClose={() => {
          setIsOpen(false);
          if (onSearchComplete) onSearchComplete();
        }}
      />
    </div>
  );
};

export default SearchBar;
