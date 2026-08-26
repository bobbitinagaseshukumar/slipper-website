import React from 'react';
import { X, Ruler, CheckCircle } from 'lucide-react';

const SizeGuideModal = ({ isOpen, onClose, gender = 'Men' }) => {
  if (!isOpen) return null;

  const sizeChart = [
    { uk: '5', euro: '38', cm: '24.0', inches: '9.4' },
    { uk: '6', euro: '39 - 40', cm: '24.8', inches: '9.8' },
    { uk: '7', euro: '41', cm: '25.6', inches: '10.1' },
    { uk: '8', euro: '42', cm: '26.5', inches: '10.4' },
    { uk: '9', euro: '43', cm: '27.3', inches: '10.7' },
    { uk: '10', euro: '44 - 45', cm: '28.1', inches: '11.0' },
    { uk: '11', euro: '46', cm: '29.0', inches: '11.4' },
    { uk: '12', euro: '47', cm: '29.8', inches: '11.7' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-luxury-accent mb-2">
          <Ruler className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Footwear Fit Guide</span>
        </div>

        <h3 className="font-display font-black text-xl text-luxury-dark mb-4">
          Slipper Sizing & Measurement Chart
        </h3>

        {/* Size Chart Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-luxury-warmWhite text-luxury-dark font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">UK / India Size</th>
                <th className="py-3 px-4">EU Size</th>
                <th className="py-3 px-4">Foot Length (cm)</th>
                <th className="py-3 px-4">Inches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {sizeChart.map((row) => (
                <tr key={row.uk} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-luxury-dark">Size {row.uk}</td>
                  <td className="py-2.5 px-4 text-gray-500">{row.euro}</td>
                  <td className="py-2.5 px-4 font-bold text-luxury-accent">{row.cm} cm</td>
                  <td className="py-2.5 px-4 text-gray-500">{row.inches}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure Instructions */}
        <div className="p-4 rounded-2xl bg-luxury-warmWhite/80 border border-gray-100 text-xs space-y-2">
          <p className="font-bold text-luxury-dark flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> How To Measure Your Foot Length:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-600 pl-1 leading-relaxed">
            <li>Place a sheet of blank paper on the floor against a flat wall.</li>
            <li>Stand on the paper with your heel lightly touching the wall.</li>
            <li>Mark the tip of your longest toe on the paper with a pencil.</li>
            <li>Measure the distance from the edge of the paper to the mark in centimeters.</li>
            <li>If you are between sizes, we recommend ordering one size up for a relaxed fit.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
