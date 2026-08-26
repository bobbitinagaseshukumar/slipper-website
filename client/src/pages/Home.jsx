import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, Compass } from 'lucide-react';
import homepageService from '../services/homepageService';

import AnnouncementBar from '../components/common/AnnouncementBar';
import Header from '../components/common/Header';
import MobileMenu from '../components/common/MobileMenu';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import Footer from '../components/common/Footer';
import RevealOnScroll from '../components/common/RevealOnScroll';

import HeroSection from '../components/home/HeroSection';
import CategoryGrid from '../components/home/CategoryGrid';
import FlashSaleBanner from '../components/home/FlashSaleBanner';
import SlipperShowcase from '../components/home/SlipperShowcase';
import ShowroomSpotlight from '../components/home/ShowroomSpotlight';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CustomerReviews from '../components/home/CustomerReviews';
import NewsletterSection from '../components/common/NewsletterSection';

import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';

const Home = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setIsLoading(true);
        const res = await homepageService.getHomepageData();
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        setError(err.message || 'Unable to connect to server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHome();
  }, []);

  const settings = data?.settings || {};
  const banners = data?.banners || [];
  const categories = data?.categories || [];
  const newArrivals = data?.newArrivals || [];
  const trending = data?.trending || [];
  const collections = data?.collections || {};
  const reviews = data?.reviews || [];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      {/* Announcement Bar */}
      <AnnouncementBar text={settings.announcementText} />

      {/* Main Header */}
      <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1">
        {/* Hero Section with 3D Floating Slipper */}
        <HeroSection banners={banners} />

        {/* Categories Showcase with 3D Tilt Cards */}
        <CategoryGrid categories={categories} />

        {/* 1. New Arrivals Section */}
        <section className="py-16 bg-luxury-warmWhite">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealOnScroll direction="up">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
                    Fresh Drops
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark mt-1">
                    New Season Arrivals
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    The latest handcrafted styles engineered for maximum comfort.
                  </p>
                </div>
                <Link
                  to="/shop?sort=newest"
                  className="mt-3 sm:mt-0 text-xs sm:text-sm font-bold text-luxury-dark hover:text-luxury-accent flex items-center gap-1 transition-colors group"
                >
                  <span>View All New</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </RevealOnScroll>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : newArrivals.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {newArrivals.slice(0, 8).map((product, idx) => (
                  <RevealOnScroll key={product.id} delay={idx * 80} direction="up">
                    <ProductCard product={product} />
                  </RevealOnScroll>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                New collection arriving soon!
              </p>
            )}
          </div>
        </section>

        {/* 2. Trending Slides & Slippers */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealOnScroll direction="up">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
                    Popular Choice
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark mt-1">
                    Trending Now
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Our most-loved slippers chosen by thousands of happy feet.
                  </p>
                </div>
                <Link
                  to="/shop?sort=bestselling"
                  className="mt-3 sm:mt-0 text-xs sm:text-sm font-bold text-luxury-dark hover:text-luxury-accent flex items-center gap-1 transition-colors group"
                >
                  <span>View Best Sellers</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </RevealOnScroll>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : trending.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {trending.slice(0, 4).map((product, idx) => (
                  <RevealOnScroll key={product.id} delay={idx * 100} direction="up">
                    <ProductCard product={product} />
                  </RevealOnScroll>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* Flash Sale Banner */}
        <RevealOnScroll direction="up">
          <FlashSaleBanner />
        </RevealOnScroll>

        {/* 3. Interactive Slipper Anatomy & Showcase Section */}
        <SlipperShowcase />

        {/* 4. Virtual 3D Showroom Spotlight */}
        <ShowroomSpotlight />

        {/* 4. Men's Curated Stories */}
        {collections.men && collections.men.length > 0 && (
          <section className="py-16 bg-luxury-warmWhite">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <RevealOnScroll direction="up">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
                      Gentlemen's Edition
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark mt-1">
                      Men's Comfort & Slides
                    </h2>
                  </div>
                  <Link
                    to="/shop?category=men"
                    className="text-xs sm:text-sm font-bold text-luxury-dark hover:text-luxury-accent flex items-center gap-1 transition-colors group"
                  >
                    <span>Shop Men</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </RevealOnScroll>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {collections.men.map((product, idx) => (
                  <RevealOnScroll key={product.id} delay={idx * 80} direction="up">
                    <ProductCard product={product} />
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us Biomechanics Section */}
        <WhyChooseUs />

        {/* Customer Testimonials */}
        <CustomerReviews reviews={reviews} />

        {/* VIP Slipper Newsletter Subscription */}
        <NewsletterSection />
      </main>

      {/* Floating Action Buttons */}
      <WhatsAppFloatingButton whatsappNumber={settings.whatsappNumber} />
      <ScrollToTopButton />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
