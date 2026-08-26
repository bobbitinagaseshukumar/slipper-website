import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Loader2, Package, ArrowRight, Filter, Sparkles } from 'lucide-react';
import productService from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import QuickAddModal from '../components/product/QuickAddModal';
import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState(null);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== query) {
        setSearchParams({ q: searchInput });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load Search Results from Backend
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await productService.getProducts({ search: query, limit: 24 });
        if (res?.data?.products) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to search slippers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const breadcrumbs = [
    { label: 'Shop Catalog', link: '/shop' },
    { label: query ? `Search: "${query}"` : 'Search Slippers' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Search Header Banner */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
              Smart Slipper Discovery
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark mt-1">
              {query ? `Results for "${query}"` : 'Search Our Footwear Catalog'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Find men’s slides, women’s comfort walkers, kids daily wear, and orthopedic soles.
            </p>
          </div>

          {/* Large Search Input */}
          <div className="relative max-w-xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search slippers by style, comfort feature, size, or color..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-colors"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Product Results Grid */}
        <div>
          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-luxury-accent" />
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-600 pb-2 border-b border-gray-100">
                <span>{products.length} footwear styles matching your query</span>
                <Link to="/shop" className="text-luxury-accent hover:underline flex items-center gap-1">
                  View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickAdd={(p) => setQuickAddProduct(p)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl p-8 border border-gray-100 space-y-4">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <div>
                <h3 className="font-display font-bold text-base text-gray-900">
                  No slippers found for "{query}"
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Try searching for popular styles like "Slides", "EVA", "Black", "Arch Support", or browse our curated collections.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-dark text-white rounded-2xl text-xs font-bold hover:bg-luxury-accent hover:text-luxury-dark transition-colors shadow-md"
                >
                  <span>Explore All Slippers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Quick Add Modal */}
      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          isOpen={!!quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
        />
      )}

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default SearchPage;
