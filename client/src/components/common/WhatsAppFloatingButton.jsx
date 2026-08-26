import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const WhatsAppFloatingButton = ({ whatsappNumber }) => {
  const { settings } = useStoreSettings();
  const rawNumber = whatsappNumber || settings.whatsappNumber || '+919876543210';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(`Hello ${settings.storeName || 'AuraSole'}! I need assistance choosing the right slippers.`);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 lg:bottom-8 right-5 z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3.5 py-3 rounded-full shadow-2xl transition-all duration-300 group hover:scale-105 active:scale-95 transform-gpu"
      aria-label="Chat with footwear specialist on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 fill-current animate-pulse" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 text-xs font-bold tracking-wide">
        Need Slipper Help?
      </span>
    </a>
  );
};

export default WhatsAppFloatingButton;
