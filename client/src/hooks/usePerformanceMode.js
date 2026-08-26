import { useState, useEffect } from 'react';

/**
 * usePerformanceMode
 * Automatically determines optimal 3D animation tier:
 * - 'full': High-end desktop with full 3D tilt, parallax, and specular lighting
 * - 'balanced': Normal tablets & smartphones with lightweight touch effects
 * - 'lightweight': Low-power devices or when prefers-reduced-motion is active
 */
export const usePerformanceMode = () => {
  const [tier, setTier] = useState('full');

  useEffect(() => {
    // 1. Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setTier('lightweight');
      return;
    }

    // 2. Check mobile / tablet width
    const width = window.innerWidth;
    if (width < 768) {
      setTier('balanced');
    } else {
      setTier('full');
    }

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (motion) {
        setTier('lightweight');
      } else if (currentWidth < 768) {
        setTier('balanced');
      } else {
        setTier('full');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    tier,
    isFull3D: tier === 'full',
    isBalanced: tier === 'balanced',
    isLightweight: tier === 'lightweight',
  };
};

export default usePerformanceMode;
