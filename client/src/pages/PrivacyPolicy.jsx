import React from 'react';
import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';

const PrivacyPolicy = () => {
  const breadcrumbs = [{ label: 'Privacy Policy' }];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark">
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-400 mt-1">Last Updated: August 2026</p>
          </div>

          <p>
            At AuraSole Footwear, we are dedicated to safeguarding your privacy and ensuring your shopping experience is completely transparent, secure, and respectful of your personal data.
          </p>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            1. Information We Collect
          </h2>
          <p>
            When you create an account, purchase footwear, or contact our stylist team, we collect your name, email address, shipping delivery address, phone number, and WhatsApp number for live order notifications.
          </p>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>To process, dispatch, and deliver your slipper orders securely across India.</li>
            <li>To provide automated delivery tracking and doorstep return updates.</li>
            <li>To send optional promotional discounts and seasonal footwear collection releases.</li>
            <li>To prevent fraudulent transactions and preserve historical order invoices.</li>
          </ul>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            3. Payment Security & Data Protection
          </h2>
          <p>
            We never store credit/debit card numbers, UPI PINs, or net banking credentials on our servers. All digital payments are processed through PCI-DSS Level 1 compliant gateways (Razorpay).
          </p>

          <h2 className="font-display font-bold text-base text-luxury-dark pt-2">
            4. Contact Our Data Protection Officer
          </h2>
          <p>
            If you have questions regarding your stored personal data or wish to request account deactivation, please contact us at privacy@aurasolefootwear.com.
          </p>
        </div>
      </main>

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
