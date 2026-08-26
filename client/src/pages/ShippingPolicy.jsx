import React from 'react';
import { Truck, Clock, ShieldCheck } from 'lucide-react';
import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';

const ShippingPolicy = () => {
  const breadcrumbs = [{ label: 'Shipping & Delivery Policy' }];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs text-gray-400 mt-1">Fast & Secure Delivery Across 19,000+ PIN Codes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-stone-50 border border-gray-100 space-y-1 text-center">
              <Truck className="w-6 h-6 text-luxury-accent mx-auto" />
              <p className="font-bold text-xs text-gray-900">Free Delivery</p>
              <p className="text-[11px] text-gray-500">On all orders above ₹999</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-gray-100 space-y-1 text-center">
              <Clock className="w-6 h-6 text-luxury-accent mx-auto" />
              <p className="font-bold text-xs text-gray-900">2-5 Business Days</p>
              <p className="text-[11px] text-gray-500">Metro cities & Tier-1 hubs</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-gray-100 space-y-1 text-center">
              <ShieldCheck className="w-6 h-6 text-luxury-accent mx-auto" />
              <p className="font-bold text-xs text-gray-900">COD Available</p>
              <p className="text-[11px] text-gray-500">Cash on delivery with zero surcharge</p>
            </div>
          </div>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            1. Order Dispatch Timeline
          </h2>
          <p>
            All confirmed footwear orders are processed, quality inspected, and dispatched from our Bangalore fulfillment facility within 24 business hours.
          </p>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            2. Live Courier Tracking
          </h2>
          <p>
            As soon as your package is dispatched via BlueDart, Delhivery, or Xpressbees, you will receive an SMS and WhatsApp notification containing your live tracking ID and direct tracking link.
          </p>
        </div>
      </main>

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
