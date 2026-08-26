import React from 'react';
import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Terms = () => {
  const breadcrumbs = [{ label: 'Terms & Conditions' }];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark">
              Terms & Conditions
            </h1>
            <p className="text-xs text-gray-400 mt-1">Effective Date: August 2026</p>
          </div>

          <p>
            Welcome to AuraSole Footwear. By accessing our website, browsing our specialized slipper catalog, or purchasing footwear products, you agree to the following terms and conditions.
          </p>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            1. Dedicated Footwear Offerings
          </h2>
          <p>
            AuraSole is dedicated exclusively to footwear comfort, slides, flip-flops, and ergonomic slippers. All product images, descriptions, and material specifications represent our genuine physical retail stock.
          </p>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            2. Orders, Pricing & Inventory
          </h2>
          <p>
            All listed prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to cancel orders in the rare event of inventory discrepancies or technical inaccuracies, in which case any captured payments are refunded in full.
          </p>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            3. Doorstep Exchange & Returns
          </h2>
          <p>
            Customers may request a size exchange or return within 7 calendar days of order delivery through their Customer Account portal, provided footwear is unworn and in original condition.
          </p>
        </div>
      </main>

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Terms;
