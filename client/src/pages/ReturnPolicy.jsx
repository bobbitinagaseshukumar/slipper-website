import React from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';

const ReturnPolicy = () => {
  const breadcrumbs = [{ label: '7-Day Return & Size Exchange Policy' }];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark">
              7-Day Doorstep Returns & Exchanges
            </h1>
            <p className="text-xs text-gray-400 mt-1">100% Worry-Free Footwear Sizing Guarantee</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Got the wrong size? Request a replacement directly from your Orders tab in 1 click!</span>
          </div>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            1. Eligibility Conditions
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Return or exchange request must be initiated within 7 days of package delivery.</li>
            <li>Slippers must be clean, unused, and in their original packaging box.</li>
          </ul>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            2. Hassle-Free Doorstep Pickup
          </h2>
          <p>
            Our logistics partner will arrive at your registered address to collect the footwear. You do not need to visit any courier center.
          </p>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            3. Instant Refund Processing
          </h2>
          <p>
            For prepaid orders, refunds are credited back to the original payment source within 2-4 business days. For COD orders, refund is issued directly via UPI or direct bank transfer.
          </p>
        </div>
      </main>

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default ReturnPolicy;
