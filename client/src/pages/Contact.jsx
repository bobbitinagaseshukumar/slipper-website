import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useStoreSettings } from '../context/StoreSettingsContext';

const Contact = () => {
  const { settings } = useStoreSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order & Sizing Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    // Simulate reliable dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedback({
        type: 'success',
        text: `Thank you! Your message has been received. Our ${settings.storeName || 'AuraSole'} stylist team will get in touch shortly.`,
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Order & Sizing Inquiry',
        message: '',
      });
    }, 800);
  };

  const breadcrumbs = [{ label: `Contact ${settings.storeName || 'AuraSole'} & Store Help` }];
  const cleanWhatsApp = (settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
            Customer Care & Showroom
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-luxury-dark">
            We Are Here to Assist Your Feet
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Have questions regarding sizing, custom orders, or delivery status? Reach our dedicated footwear stylists.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Contact Channels */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Chat Card */}
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-sm text-luxury-dark">
                WhatsApp Footwear Stylist
              </h3>
              <p className="text-xs text-gray-500">
                Instant sizing advice and live delivery tracking queries.
              </p>
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(`Hello ${settings.storeName || 'AuraSole'}, I need assistance choosing the right slippers.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-emerald-700 hover:underline pt-1"
              >
                Chat on WhatsApp ({settings.whatsappNumber || '+91 98765 43210'}) →
              </a>
            </div>

            {/* Helpline Card */}
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-sm text-luxury-dark">Customer Helpline</h3>
              <p className="text-xs text-gray-500">{settings.businessHours || 'Mon–Sat: 9:00 AM – 9:00 PM'}</p>
              <a
                href={`tel:${settings.phone || '+919876543210'}`}
                className="inline-block text-xs font-bold text-blue-700 hover:underline pt-1"
              >
                {settings.phone || '+91 98765 43210'}
              </a>
            </div>

            {/* Email Support Card */}
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-sm text-luxury-dark">Email Support</h3>
              <p className="text-xs text-gray-500">{settings.contactEmail || settings.supportEmail || 'support@aurasole.com'}</p>
              <a
                href={`mailto:${settings.contactEmail || settings.supportEmail || 'support@aurasole.com'}`}
                className="inline-block text-xs font-bold text-purple-700 hover:underline pt-1"
              >
                Write an Email →
              </a>
            </div>

            {/* Showroom Location */}
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <MapPin className="w-4 h-4 text-luxury-accent shrink-0" />
                <span>Showroom Location</span>
              </div>
              <p className="text-xs text-gray-600 pl-6 leading-relaxed">
                {settings.address || 'Showroom 42, Slipper Heritage Lane, Luxury Avenue, Mumbai - 400001'}
              </p>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="font-display font-black text-xl text-luxury-dark">Send Us a Message</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Our support team typically responds within 2 business hours.
              </p>
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Inquiry Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                  >
                    <option value="Order & Sizing Inquiry">Order & Sizing Inquiry</option>
                    <option value="Delivery Tracking Query">Delivery Tracking Query</option>
                    <option value="Exchange or Return Help">Exchange or Return Help</option>
                    <option value="Corporate / Bulk Footwear">Corporate / Bulk Footwear</option>
                    <option value="Feedback / Stylist Request">Feedback / Stylist Request</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can our footwear team assist you today?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-luxury-dark text-white font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-luxury-accent" />
                    <span>Transmitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-luxury-accent" />
                    <span>Send Message to {settings.storeName || 'AuraSole'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Contact;
