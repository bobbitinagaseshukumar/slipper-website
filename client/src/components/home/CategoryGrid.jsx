import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import RevealOnScroll from '../common/RevealOnScroll';

const CategoryCard = ({ category }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({ x: rotateY, y: rotateX });
  };

  return (
    <Link
      to={`/shop?category=${category.slug}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovered
          ? `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)',
        transition: isHovered ? 'transform 100ms ease-out' : 'transform 400ms ease-out',
      }}
      className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500 bg-stone-100 border border-gray-100 block aspect-[3/4] will-change-transform transform-gpu active:scale-[0.98]"
    >
      {/* Category Image with Smooth Zoom */}
      <img
        src={
          category.image ||
          'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600'
        }
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
        loading="lazy"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

      {/* Content Information with 3D Depth */}
      <div
        style={{
          transform: isHovered ? 'translateZ(24px)' : 'translateZ(0px)',
          transition: 'transform 300ms ease-out',
        }}
        className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-white"
      >
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-luxury-accent mb-1">
          {category._count?.products || 0} Slipper Styles
        </span>
        <h3 className="font-display font-bold text-base sm:text-xl leading-tight group-hover:translate-x-1 transition-transform">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-[11px] text-gray-300 line-clamp-2 mt-1 hidden sm:block">
            {category.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-luxury-accent group-hover:text-white transition-colors">
          <span>Explore Slippers</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

const CategoryGrid = ({ categories = [] }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title with Scroll Reveal */}
        <RevealOnScroll direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-luxury-accent">
                Curated Footwear
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-luxury-dark mt-1">
                Shop by Category
              </h2>
            </div>
            <Link
              to="/shop"
              className="mt-3 sm:mt-0 text-xs sm:text-sm font-bold text-luxury-dark hover:text-luxury-accent flex items-center gap-1 transition-colors group"
            >
              <span>View Full Catalog</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </RevealOnScroll>

        {/* Category Cards Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, idx) => (
            <RevealOnScroll key={category.id} delay={idx * 100} direction="up">
              <CategoryCard category={category} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
