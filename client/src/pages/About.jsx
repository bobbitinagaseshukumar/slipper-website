import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Award,
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Header from '../components/common/Header';
import AnnouncementBar from '../components/common/AnnouncementBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFloatingButton from '../components/common/WhatsAppFloatingButton';
import Footer from '../components/common/Footer';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useStoreSettings } from '../context/StoreSettingsContext';

const About = () => {
  const { settings } = useStoreSettings();

  const breadcrumbs = [
    { label: `About ${settings.storeName || 'AuraSole'}` },
  ];

  const cleanWhatsApp = (settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-luxury-warmWhite">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Section */}
        <section className="relative rounded-3xl bg-gradient-to-r from-luxury-dark via-stone-900 to-luxury-dark text-white p-8 sm:p-16 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-luxury-accent text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
              Our Footwear Journey
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl leading-tight">
              Redefining Everyday Comfort, One Step at a Time.
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {settings.aboutStory || `${settings.storeName || 'AuraSole'} was founded with a singular, uncompromising vision: to create the ultimate dedicated slipper collection for everyday living, engineered with orthopedic arch support, ultra-soft dual-density EVA foam, and contemporary styling.`}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="px-6 py-3 bg-luxury-accent text-luxury-dark font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:bg-amber-400 transition-all flex items-center gap-2"
              >
                <span>Explore Slipper Collections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Mission & Vision Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-luxury-dark">Our Mission</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {settings.aboutMission || "To handcraft India's most comfortable, doctor-approved daily recovery slippers."}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-luxury-dark">Our Vision</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {settings.aboutVision || 'To elevate everyday indoor and outdoor footwear into a premium wellness experience.'}
            </p>
          </div>
        </section>

        {/* 3 Core Pillars of Footwear Craftsmanship */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
              Engineering Excellence
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark">
              Built Different. Handcrafted for Support.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-luxury-dark">
                Orthopedic Arch Contouring
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Biomechanical heel cups and deep medial arch arches cradle your feet, relieving plantar fascia tension and aligning posture with every step.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-luxury-dark">
                Dual-Density Cloud Foam
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Soft top-sheet footbed offers marshmallow plushness, while a high-rebound resilient base layer absorbs floor shocks effortlessly.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-luxury-dark text-luxury-accent flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-luxury-dark">
                Anti-Skid Hydro Grip
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Laser-siped tread patterns channel water away instantly, ensuring rock-solid traction in bathrooms, verandas, pool decks, and monsoons.
              </p>
            </div>
          </div>
        </section>

        {/* Physical Store & Slipper Showroom Details */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
              Our Flagship Showroom
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-luxury-dark">
              Experience {settings.storeName || 'AuraSole'} in Person
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Visit our physical flagship footwear studio to get personalized size fittings and try on our complete line of men’s, women’s, and children’s comfort slides.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-gray-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-luxury-accent shrink-0 mt-0.5" />
                <span>{settings.address || 'Showroom 42, Slipper Heritage Lane, Luxury Avenue, Mumbai - 400001'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-luxury-accent shrink-0" />
                <span>{settings.businessHours || 'Mon – Sat: 9:00 AM – 9:00 PM'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-luxury-accent shrink-0" />
                <span>{settings.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(`Hello ${settings.storeName || 'AuraSole'}, I would like to inquire about your slipper showroom.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-bold hover:underline"
                >
                  WhatsApp Stylist: {settings.whatsappNumber || '+91 98765 43210'}
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3] bg-stone-100">
            <img
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800"
              alt={`${settings.storeName || 'AuraSole'} Showroom`}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      </main>

      <WhatsAppFloatingButton />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default About;
