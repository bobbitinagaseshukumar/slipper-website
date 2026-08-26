import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import QuickAddModal from './QuickAddModal';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const cardRef = useRef(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0, glowX: 50, glowY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartPopping, setIsHeartPopping] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!product) return null;

  const {
    id,
    name,
    slug,
    price,
    originalPrice,
    discountPercentage,
    rating = 4.8,
    reviewCount = 12,
    images = [],
    variants = [],
    isNewArrival,
    isBestSeller,
    isTrending,
    category,
    gender,
  } = product;

  const isWishlisted = wishlist?.some((item) => item.product?.id === id || item.productId === id);

  const primaryImage = images[0]?.url || 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600';
  const secondaryImage = images[1]?.url || primaryImage;

  // Extract unique colors
  const colorMap = new Map();
  variants.forEach((v) => {
    if (v.colorName && !colorMap.has(v.colorName)) {
      colorMap.set(v.colorName, v.colorCode || '#1A1A1A');
    }
  });
  const colors = Array.from(colorMap.entries()).slice(0, 4);

  // 3D Tilt Mouse Movement Handler
  const handleMouseMove = (e) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation limits (max 8 degrees tilt for premium subtlety)
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;

    setTilt({ x: rotateY, y: rotateX, glowX, glowY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glowX: 50, glowY: 50 });
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 350);

    if (isWishlisted) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist(id);
    }
  };

  const handleQuickAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickAddOpen(true);
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: !reducedMotion && isHovered
            ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-6px) scale3d(1.015, 1.015, 1.015)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 100ms ease-out, box-shadow 300ms ease-out' : 'transform 400ms ease-out, box-shadow 400ms ease-out',
          boxShadow: isHovered
            ? `${-tilt.x * 1.5}px ${tilt.y * 1.5 + 16}px 32px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)`
            : '0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        }}
        className="group relative flex flex-col bg-white rounded-3xl p-3 border border-gray-100/90 active:scale-[0.98] sm:active:scale-100 will-change-transform transform-gpu overflow-hidden"
      >
        {/* Dynamic Light Sheen Highlight Layer */}
        {isHovered && !reducedMotion && (
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 z-30"
            style={{
              background: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 60%)`,
            }}
          />
        )}

        {/* Product Image Container (4:5 Aspect Ratio) with Layered 3D Float */}
        <Link
          to={`/products/${slug}`}
          style={{
            transform: !reducedMotion && isHovered ? 'translateZ(26px)' : 'translateZ(0px)',
            transition: 'transform 300ms ease-out',
          }}
          className="relative block w-full aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 shadow-2xs"
        >
          {/* Primary & Secondary Image Flip */}
          <img
            src={isHovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />

          {/* Badges */}
          <div
            style={{
              transform: !reducedMotion && isHovered ? 'translateZ(38px)' : 'translateZ(0px)',
            }}
            className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10"
          >
            {isBestSeller && (
              <span className="px-2.5 py-1 rounded-full bg-luxury-dark text-white text-[10px] font-black tracking-wider uppercase shadow-md backdrop-blur-md">
                Best Seller
              </span>
            )}
            {isNewArrival && !isBestSeller && (
              <span className="px-2.5 py-1 rounded-full bg-luxury-accent text-luxury-dark text-[10px] font-black tracking-wider uppercase shadow-md backdrop-blur-md">
                New
              </span>
            )}
            {isTrending && !isBestSeller && !isNewArrival && (
              <span className="px-2.5 py-1 rounded-full bg-stone-800 text-white text-[10px] font-black tracking-wider uppercase shadow-md backdrop-blur-md">
                Trending
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow-md w-fit">
                {discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Floating Wishlist Button with Tactile Pop */}
          <button
            onClick={toggleWishlist}
            style={{
              transform: !reducedMotion && isHovered ? 'translateZ(42px)' : 'translateZ(0px)',
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-20 active:scale-90 ${
              isWishlisted
                ? 'bg-rose-50 text-rose-500 shadow-md'
                : 'bg-white/85 text-gray-600 hover:text-rose-500 hover:bg-white shadow-sm'
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-300 ${
                isHeartPopping ? 'scale-130 text-rose-600' : 'scale-100'
              } ${isWishlisted ? 'fill-current text-rose-500' : ''}`}
            />
          </button>

          {/* Quick Add Overlay on Desktop Hover */}
          <div
            style={{
              transform: !reducedMotion && isHovered ? 'translateZ(35px)' : 'translateZ(0px)',
            }}
            className="absolute bottom-2.5 inset-x-2.5 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
          >
            <button
              onClick={handleQuickAddClick}
              className="w-full py-2.5 bg-luxury-dark/95 hover:bg-luxury-accent text-white hover:text-luxury-dark rounded-xl text-xs font-bold shadow-lg backdrop-blur-md transition-colors flex items-center justify-center gap-1.5 active:scale-95 transform-gpu"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
            </button>
          </div>
        </Link>

        {/* Product Details Section with 3D Depth */}
        <div
          style={{
            transform: !reducedMotion && isHovered ? 'translateZ(18px)' : 'translateZ(0px)',
            transition: 'transform 300ms ease-out',
          }}
          className="pt-3 pb-1 px-1 flex flex-col flex-1 justify-between"
        >
          <div>
            {/* Category / Gender & Rating Row */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
              <span className="font-medium uppercase tracking-wider truncate">
                {gender} • {category?.name || 'Slippers'}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">({reviewCount})</span>
              </div>
            </div>

            {/* Product Title */}
            <Link
              to={`/products/${slug}`}
              className="font-display font-bold text-sm text-gray-900 line-clamp-1 hover:text-luxury-accent transition-colors block"
              title={name}
            >
              {name}
            </Link>
          </div>

          {/* Price & Colors Row */}
          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-luxury-dark">₹{price}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
              )}
            </div>

            {/* Color Swatch Dots with Hover Tooltip */}
            {colors.length > 0 && (
              <div className="flex items-center gap-1">
                {colors.map(([colorName, colorCode], idx) => (
                  <span
                    key={idx}
                    title={colorName}
                    style={{ backgroundColor: colorCode }}
                    className="w-3 h-3 rounded-full border border-gray-300 shadow-2xs hover:scale-125 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile Quick Add Button */}
          <button
            onClick={handleQuickAddClick}
            className="sm:hidden mt-3 w-full py-2.5 bg-luxury-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
          </button>
        </div>
      </div>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <QuickAddModal
          product={product}
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
