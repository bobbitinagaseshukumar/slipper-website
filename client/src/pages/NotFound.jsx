import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, ArrowLeft } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <span className="text-luxury-accent font-display font-black text-7xl sm:text-9xl tracking-tighter">
          404
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-luxury-dark mt-4">
          Oops! Looks Like You Lost Your Step
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mt-2 leading-relaxed">
          The page or slipper product you're looking for doesn't exist or has moved to a new collection.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link
            to="/"
            className="px-6 py-3 bg-luxury-dark text-white rounded-2xl text-xs font-bold hover:bg-luxury-accent hover:text-luxury-dark transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
          <Link
            to="/shop"
            className="px-6 py-3 bg-white border border-gray-200 text-luxury-dark rounded-2xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" /> Explore Slippers
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
