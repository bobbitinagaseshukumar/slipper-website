import React from 'react';

const ProductSpecifications = ({ product }) => {
  if (!product) return null;

  const specs = [
    { label: 'Category', value: product.category?.name },
    { label: 'Subcategory', value: product.subcategory?.name },
    { label: 'Footwear Type', value: product.productType },
    { label: 'Upper Material', value: product.upperMaterial || product.material },
    { label: 'Sole Material', value: product.soleMaterial },
    { label: 'Comfort Technology', value: product.comfortFeatures },
    { label: 'Ideal For', value: product.gender === 'UNISEX' ? 'Men & Women (Unisex)' : product.gender },
    { label: 'Occasion', value: product.occasion },
    { label: 'Pattern', value: product.pattern },
    { label: 'SKU / Model', value: product.sku },
    { label: 'Care Instructions', value: product.careInstructions },
  ].filter((item) => item.value); // Only show rows with actual values

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="p-4 bg-luxury-warmWhite border-b border-gray-100">
        <h4 className="font-display font-bold text-sm text-luxury-dark uppercase tracking-wider">
          Product Details & Engineering Specs
        </h4>
      </div>
      <div className="divide-y divide-gray-100">
        {specs.map((item, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs ${
              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
            }`}
          >
            <span className="font-bold text-gray-500">{item.label}</span>
            <span className="sm:col-span-2 font-medium text-gray-900 mt-0.5 sm:mt-0">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSpecifications;
