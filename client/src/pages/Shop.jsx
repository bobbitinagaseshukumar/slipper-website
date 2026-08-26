import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, PackageX, RotateCcw, Sparkles } from 'lucide-react';
import productService from '../services/productService';

import AnnouncementBar from '../components/common/AnnouncementBar';
import Header from '../components/common/Header';
import MobileMenu from '../components/common/MobileMenu';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';

import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';

import FilterSidebar from '../components/shop/FilterSidebar';
import MobileFilterDrawer from '../components/shop/MobileFilterDrawer';
import SortDropdown from '../components/shop/SortDropdown';
import ActiveFilters from '../components/shop/ActiveFilters';
import Pagination from '../components/shop/Pagination';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 1 });
  const [filterOptions, setFilterOptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract current search params into filter object
  const currentFilters = useMemo(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (value) params[key] = value;
    }
    return params;
  }, [searchParams]);

  // Count active filters (excluding sort and page)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    const ignoreKeys = ['sort', 'page', 'limit'];
    for (const [key, value] of Object.entries(currentFilters)) {
      if (!ignoreKeys.includes(key) && value) {
        if (['gender', 'size', 'color', 'material'].includes(key)) {
          count += value.split(',').length;
        } else {
          count += 1;
        }
      }
    }
    return count;
  }, [currentFilters]);

  // Fetch filter metadata once on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await productService.getFilterOptions();
        if (res?.data) {
          setFilterOptions(res.data);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products whenever searchParams change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await productService.getProducts(currentFilters);
        if (res?.data) {
          setProducts(res.data.products || []);
          setPagination(res.data.pagination || { page: 1, limit: 24, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        setError(err.message || 'Unable to load slippers');
      } finally {
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Update a single filter in the URL
  const handleFilterChange = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page'); // Reset to page 1 on filter modification
    setSearchParams(next);
  };

  // Sort change handler
  const handleSortChange = (newSort) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    next.delete('page');
    setSearchParams(next);
  };

  // Page change handler
  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  // Remove individual filter chip
  const handleRemoveFilter = (chip) => {
    const next = new URLSearchParams(searchParams);
    if (chip.isMulti) {
      const currentValues = (next.get(chip.key) || '').split(',').filter((v) => v !== chip.value);
      if (currentValues.length > 0) {
        next.set(chip.key, currentValues.join(','));
      } else {
        next.delete(chip.key);
      }
    } else if (chip.isPrice) {
      next.delete('minPrice');
      next.delete('maxPrice');
    } else {
      next.delete(chip.key);
    }
    next.delete('page');
    setSearchParams(next);
  };

  // Clear all filters
  const handleClearAll = () => {
    const next = new URLSearchParams();
    if (searchParams.get('sort')) {
      next.set('sort', searchParams.get('sort'));
    }
    setSearchParams(next);
  };

  // Compute Page Title & Breadcrumb label
  const activeCategory = currentFilters.category;
  const searchQuery = currentFilters.q;

  let pageTitle = 'All Slippers & Footwear';
  if (searchQuery) {
    pageTitle = `Search Results for "${searchQuery}"`;
  } else if (activeCategory) {
    const foundCat = filterOptions.categories?.find((c) => c.slug === activeCategory);
    pageTitle = foundCat ? foundCat.name : `${activeCategory.toUpperCase()} Slippers`;
  }

  const breadcrumbItems = [
    { label: 'Shop', link: '/shop' },
    ...(activeCategory ? [{ label: pageTitle }] : []),
    ...(searchQuery ? [{ label: `"${searchQuery}"` }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Title & Slipper Categories Bar */}
        <div className="pt-2 pb-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-luxury-dark tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                Discover ergonomic comfort, orthopedic arch support, and handcrafted luxury slippers.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-400">
              {pagination.total} styles available
            </span>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 pb-1">
            <button
              onClick={() => handleFilterChange('category', '')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                !activeCategory
                  ? 'bg-luxury-dark text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              All Styles
            </button>
            {filterOptions.categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFilterChange('category', cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-luxury-dark text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: Filter Trigger & Sort Row */}
        <div className="py-4 flex items-center justify-between gap-4">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-luxury-dark shadow-2xs hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-luxury-accent" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-luxury-dark text-white text-[10px] flex items-center justify-center font-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop Summary Count */}
          <div className="hidden lg:block text-xs font-semibold text-gray-500">
            Showing <span className="font-bold text-luxury-dark">{products.length}</span> of{' '}
            <span className="font-bold text-luxury-dark">{pagination.total}</span> slippers
          </div>

          {/* Sort Dropdown */}
          <SortDropdown
            value={currentFilters.sort || 'recommended'}
            onChange={handleSortChange}
          />
        </div>

        {/* Active Filter Chips */}
        <ActiveFilters
          filters={currentFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAll}
        />

        {/* Master Catalog Body (Sidebar + Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
          {/* Left Column: Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <FilterSidebar
                filters={currentFilters}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                activeCount={activeFilterCount}
              />
            </div>
          </div>

          {/* Right Column: Products Grid & Pagination */}
          <div className="lg:col-span-9 flex flex-col justify-between">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="py-16 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <p className="text-sm font-bold text-rose-600 mb-2">Unable to load slippers</p>
                <p className="text-xs text-gray-500 mb-4">{error}</p>
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="px-6 py-2.5 bg-luxury-dark text-white rounded-xl text-xs font-bold hover:bg-luxury-accent transition-colors"
                >
                  Reload Slipper Catalog
                </button>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty Search / Filter Result */
              <div className="py-20 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-luxury-warmWhite flex items-center justify-center text-gray-400 mb-4">
                  <PackageX className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-lg text-luxury-dark mb-1">
                  No slippers found matching your filters
                </h3>
                <p className="text-xs text-gray-500 max-w-md mb-6 leading-relaxed">
                  Try adjusting your price range, clearing selected sizes or colors, or searching for broader terms like "slides" or "comfort".
                </p>
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 bg-luxury-dark hover:bg-luxury-accent text-white hover:text-luxury-dark font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && products.length > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Slide-Over Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={currentFilters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        totalProducts={pagination.total}
        activeCount={activeFilterCount}
      />

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Shop;
