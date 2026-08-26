import React from 'react';

const ProductDetailsSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="w-48 h-4 bg-gray-200 rounded" />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Gallery Skeleton */}
        <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4">
          <div className="flex lg:flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-2xl shrink-0" />
            ))}
          </div>
          <div className="flex-1 aspect-[4/5] bg-gray-200 rounded-3xl" />
        </div>

        {/* Right Info Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-3/4 h-8 bg-gray-200 rounded" />
          <div className="w-1/3 h-5 bg-gray-200 rounded" />
          <div className="w-1/2 h-8 bg-gray-200 rounded" />

          {/* Color & Size Skeletons */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="w-20 h-8 bg-gray-200 rounded-xl" />
              <div className="w-20 h-8 bg-gray-200 rounded-xl" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-12 h-12 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-3 pt-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-2xl" />
            <div className="flex-1 h-12 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
