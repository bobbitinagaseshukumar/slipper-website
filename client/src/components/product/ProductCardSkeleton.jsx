import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm animate-pulse flex flex-col">
      {/* Image Skeleton */}
      <div className="w-full aspect-[4/5] bg-gray-200 rounded-2xl mb-3" />

      {/* Category / Rating Skeleton */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="w-20 h-3 bg-gray-200 rounded" />
        <div className="w-12 h-3 bg-gray-200 rounded" />
      </div>

      {/* Title Skeleton */}
      <div className="w-3/4 h-4 bg-gray-200 rounded mb-1 px-1" />
      <div className="w-1/2 h-4 bg-gray-200 rounded mb-3 px-1" />

      {/* Price Skeleton */}
      <div className="pt-2 border-t border-gray-100 flex justify-between items-center px-1">
        <div className="w-16 h-5 bg-gray-200 rounded" />
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
