import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tag, Sparkles, Loader2, ArrowLeft, SlidersHorizontal, PackageX } from 'lucide-react';
import brandService from '../services/brandService';
import productService from '../services/productService';

import AnnouncementBar from '../components/common/AnnouncementBar';
import Header from '../components/common/Header';
import MobileMenu from '../components/common/MobileMenu';
import MobileBottomNav from '../components/common/MobileBottomNav';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';

import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';

const BrandPage = () => {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('popular');

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [brandRes, prodsRes] = await Promise.all([
          brandService.getBrandBySlug(slug),
          productService.getProducts({ brand: slug, sort: sortOrder }),
        ]);

        if (brandRes?.data) setBrand(brandRes.data);
        if (prodsRes?.data) setProducts(prodsRes.data.products || []);
      } catch (err) {
        console.error('Failed to load brand showroom:', err);
        setError(err.message || 'Brand showroom not found.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandData();
  }, [slug, sortOrder]);

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs
            items={[
              { label: 'Home', path: '/' },
              { label: 'Shop', path: '/shop' },
              { label: brand?.name || slug, path: `/brand/${slug}` },
            ]}
          />
        </div>

        {/* Brand Banner Showroom */}
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-luxury-accent mx-auto" />
            <p className="text-xs text-gray-500 font-bold mt-2">Opening Brand Showroom...</p>
          </div>
        ) : error || !brand ? (
          <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <PackageX className="w-8 h-8" />
            </div>
            <h2 className="font-display font-black text-2xl text-luxury-dark">Brand Showroom Not Found</h2>
            <p className="text-xs text-gray-500">
              The brand you are looking for might be inactive or unavailable.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-luxury-dark text-white font-bold text-xs rounded-xl shadow-lg hover:bg-stone-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Shop
            </Link>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            {/* Brand Header Card */}
            <div className="relative rounded-3xl overflow-hidden bg-stone-950 text-white p-6 sm:p-10 border border-stone-800 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-luxury-accent/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Brand Logo (1:1 Cropped) */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-stone-900 border border-stone-800 p-3 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.imageAlt || brand.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Tag className="w-12 h-12 text-luxury-accent" />
                  )}
                </div>

                {/* Brand Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-display font-black text-2xl sm:text-4xl text-white">
                      {brand.name}
                    </h1>
                    <span className="px-3 py-1 rounded-full bg-luxury-accent/20 text-luxury-accent text-xs font-black border border-luxury-accent/30">
                      {brand.brandingType === 'COMPANY' ? 'Company Flagship' : 'Footwear Line'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                    {brand.description ||
                      'Crafted with premium comfort materials and anatomical support for timeless elegance.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-stone-400 pt-1">
                    <span>{products.length} Models in Catalog</span>
                    <span>•</span>
                    <Link
                      to={`/shop?brand=${brand.slug}`}
                      className="text-luxury-accent hover:underline font-bold"
                    >
                      Filter in Shop Catalog →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid & Sorting */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                <h3 className="font-display font-black text-xl text-luxury-dark">
                  {brand.name} Slipper Collection ({products.length})
                </h3>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Sort By:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 focus:border-luxury-accent outline-none shadow-xs"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest Drops</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Slippers Grid */}
              <div className="pt-8">
                {products.length === 0 ? (
                  <div className="py-16 text-center text-gray-500 space-y-2">
                    <p className="text-sm font-bold text-gray-700">No Slippers under this brand currently.</p>
                    <p className="text-xs">Browse our other curated collections in the shop.</p>
                    <Link
                      to="/shop"
                      className="inline-block mt-3 px-5 py-2 bg-luxury-dark text-white font-bold text-xs rounded-xl shadow"
                    >
                      Explore All Slippers
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {products.map((prod) => (
                      <ProductCard key={prod.id} product={prod} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default BrandPage;
