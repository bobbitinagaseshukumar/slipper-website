import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle,
  MessageSquarePlus,
  ShieldCheck,
  PackageCheck,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import WriteReviewModal from '../reviews/WriteReviewModal';

const ProductReviewsSection = ({
  productId,
  reviews = [],
  rating = 5.0,
  reviewCount = 0,
  onReviewAdded,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eligibility, setEligibility] = useState({
    canReview: false,
    hasPurchased: false,
    isDelivered: false,
    hasReviewed: false,
    orderId: null,
    orderNumber: null,
    message: '',
  });
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  const fetchEligibility = async () => {
    if (!isAuthenticated || !productId) return;
    try {
      setIsCheckingEligibility(true);
      const res = await reviewService.checkEligibility(productId);
      if (res?.data) {
        setEligibility(res.data);
      }
    } catch (err) {
      console.warn('Failed to check review eligibility:', err.message);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  useEffect(() => {
    fetchEligibility();
  }, [isAuthenticated, productId]);

  // Calculate rating distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating] += 1;
    }
  });

  const totalRev = reviews.length > 0 ? reviews.length : reviewCount || 1;

  const handleReviewSuccess = () => {
    fetchEligibility();
    if (onReviewAdded) onReviewAdded();
  };

  return (
    <div id="reviews-section" className="space-y-8">
      {/* Reviews Summary Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Average Score */}
        <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
          <span className="text-xs font-bold uppercase tracking-widest text-luxury-accent">
            Customer Feedback
          </span>
          <div className="flex items-baseline justify-center md:justify-start gap-2 mt-2">
            <span className="font-display font-black text-5xl text-luxury-dark">
              {Number(rating).toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-gray-400">/ 5.0</span>
          </div>

          <div className="flex justify-center md:justify-start items-center gap-1 text-amber-500 my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-current' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">Based on {reviews.length} verified buyer reviews</p>

          {/* Strict Eligibility Action Area */}
          <div className="mt-4">
            {eligibility.hasReviewed ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Reviewed ✓</span>
              </div>
            ) : eligibility.canReview ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-luxury-dark text-white hover:bg-luxury-accent hover:text-luxury-dark text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5 mx-auto md:mx-0 active:scale-95"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            ) : eligibility.hasPurchased && !eligibility.isDelivered ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200/70 text-left">
                <PackageCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Review unlocks once your order #{eligibility.orderNumber} is delivered</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-500 text-[11px] font-medium border border-gray-200 text-left">
                <ShieldCheck className="w-3.5 h-3.5 text-luxury-accent shrink-0" />
                <span>Verified buyers can review after doorstep delivery</span>
              </div>
            )}
          </div>
        </div>

        {/* 5-Star Breakdown Progress Bars */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = Math.round((count / totalRev) * 100);
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-bold text-gray-700 flex items-center gap-0.5">
                  {star} <Star className="w-3 h-3 text-amber-500 fill-current" />
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-luxury-accent rounded-full transition-all duration-500"
                  />
                </div>
                <span className="w-8 text-right text-gray-400 font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-luxury-warmWhite text-luxury-accent flex items-center justify-center font-bold text-xs">
                    {rev.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      {rev.user?.name || 'Verified Buyer'}
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified Delivered Purchase
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              </div>

              {rev.title && (
                <h4 className="font-display font-bold text-sm text-gray-900">"{rev.title}"</h4>
              )}

              <p className="text-xs text-gray-600 leading-relaxed font-normal">{rev.comment}</p>

              {/* Review Photos if any */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {rev.images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-stone-50">
                      <img src={img} alt="review attachment" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl p-6 border border-gray-100">
            <p className="text-sm font-bold text-gray-800">No reviews yet for this slipper.</p>
            <p className="text-xs text-gray-500 mt-1">
              Be the first verified customer to share your comfort experience once your order arrives!
            </p>
          </div>
        )}
      </div>

      {/* Write Review Modal for Verified Delivered Customers */}
      {isModalOpen && (
        <WriteReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={{ id: productId, name: 'Slipper' }}
          orderId={eligibility.orderId}
          onReviewSubmitted={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default ProductReviewsSection;
