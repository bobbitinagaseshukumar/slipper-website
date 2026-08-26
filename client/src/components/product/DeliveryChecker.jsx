import React, { useState } from 'react';
import { MapPin, Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const DeliveryChecker = () => {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState(null); // 'checking' | 'serviceable' | 'invalid'
  const [estimate, setEstimate] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6 || !/^\d{6}$/.test(pincode.trim())) {
      setStatus('invalid');
      setEstimate(null);
      return;
    }

    setStatus('checking');
    setTimeout(() => {
      // Realistic delivery calculation based on pin code zones
      const pinNum = parseInt(pincode.trim(), 10);
      let days = '2–3 days';
      if (pinNum >= 560000 && pinNum <= 560100) days = 'Tomorrow (Express)';
      else if (pinNum >= 110000 && pinNum <= 110099) days = '1–2 days (Metro Express)';
      else if (pinNum >= 400000 && pinNum <= 400099) days = '1–2 days (Metro Express)';
      else days = '3–4 days';

      setStatus('serviceable');
      setEstimate(days);
    }, 600);
  };

  return (
    <div className="p-4 rounded-3xl bg-luxury-warmWhite/80 border border-gray-200/80 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
        <Truck className="w-4 h-4 text-luxury-accent" />
        <span>Check Doorstep Delivery & COD</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value);
              if (status) setStatus(null);
            }}
            placeholder="Enter 6-digit PIN code"
            className="w-full bg-white border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:ring-1 focus:ring-luxury-accent"
          />
          <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-luxury-dark text-white rounded-2xl text-xs font-bold hover:bg-luxury-accent hover:text-luxury-dark transition-colors shrink-0"
        >
          {status === 'checking' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check'}
        </button>
      </form>

      {status === 'serviceable' && (
        <div className="text-xs text-emerald-700 font-medium flex items-start gap-1.5 animate-in fade-in">
          <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Delivery by {estimate} to {pincode}</p>
            <p className="text-[11px] text-gray-600">✓ Free shipping on this item | Cash on Delivery available</p>
          </div>
        </div>
      )}

      {status === 'invalid' && (
        <div className="text-xs text-rose-600 font-medium flex items-center gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Please enter a valid 6-digit Indian PIN code.</span>
        </div>
      )}
    </div>
  );
};

export default DeliveryChecker;
