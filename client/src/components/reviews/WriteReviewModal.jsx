import React, { useState } from 'react';
import {
  Star,
  X,
  ShieldCheck,
  Image,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import reviewService from '../../services/reviewService';

const RATING_LABELS = {
  1: 'Poor — Unsatisfactory Comfort',
  2: 'Fair — Needs Improvement',
  3: 'Good — Standard Comfort',
  4: 'Very Good — Highly Comfortable',
  5: 'Excellent — Cloud-Like Luxury',
};

const WriteReviewModal = ({
  isOpen,
  onClose,
  product,
  orderId = null,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleAddImage = () => {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!comment || comment.trim().length < 5) {
      setError('Please write at least 5 characters in your review comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.addReview(product.id, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images,
        orderId,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onReviewSubmitted) onReviewSubmitted();
        onClose();
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to submit review. Reviews are strictly permitted only for delivered orders.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-luxury-dark via-stone-900 to-luxury-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {product.images?.[0]?.url && (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover bg-stone-800 border border-white/10"
              />
            )}
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Delivered Purchase
              </span>
              <h3 className="font-display font-bold text-base text-white truncate max-w-[240px]">
                {product.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            aria-label="Close review modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-display font-black text-xl text-luxury-dark">
                Review Published!
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Thank you for sharing your verified slipper experience with our community.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="space-y-2 text-center bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                  Your Overall Comfort Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-xs'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-luxury-accent">
                  {RATING_LABELS[hoverRating || rating]}
                </p>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Headline / Short Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Best arch support slipper I've ever owned!"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Your Detailed Experience <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the fit, sole cushioning, arch support, and build quality..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all leading-relaxed"
                />
              </div>

              {/* Optional Photo URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Add Slipper Photos (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image link: https://..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-luxury-accent focus:bg-white transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-2xl transition-colors"
                  >
                    + Add
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {images.map((img, i) => (
                      <div key={i} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                        <img src={img} alt="review upload" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-2xl text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3.5 rounded-2xl bg-luxury-dark hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-luxury-accent" />
                      <span>Verifying & Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 text-luxury-accent fill-luxury-accent" />
                      <span>Submit Verified Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;
