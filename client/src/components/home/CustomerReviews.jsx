import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

const CustomerReviews = ({ reviews = [] }) => {
  const defaultReviews = [
    {
      id: '1',
      rating: 5,
      title: 'Best arch support slides in India!',
      comment:
        'I suffer from severe plantar fasciitis and standing in the kitchen used to be painful. These slippers completely eliminated my heel pain within a week. Highly recommended!',
      user: { name: 'Dr. Ananya Iyer' },
      product: { name: 'OrthoRelief Arch Support Slides' },
    },
    {
      id: '2',
      rating: 5,
      title: 'Like walking on fluffy clouds',
      comment:
        'The memory foam footbed and plush fleece lining are unmatched. The quality feels equal to international luxury brands at a fraction of the cost.',
      user: { name: 'Kavita Menon' },
      product: { name: 'VelvetCloud Plush Bedroom Slippers' },
    },
    {
      id: '3',
      rating: 5,
      title: 'Non-slip bathroom magic',
      comment:
        'The drainage system and diamond grip sole are genuine lifesavers. No more slipping on wet bathroom tiles. Bought pairs for my entire family.',
      user: { name: 'Vikram Patel' },
      product: { name: 'HydroGrip Quick-Dry Slides' },
    },
  ];

  const reviewList = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <section className="py-20 bg-luxury-warmWhite border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-luxury-accent">
            Verified Experiences
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-luxury-dark mt-2">
            Loved By Over 15,000+ Customers
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
            <span className="text-xs font-bold text-gray-700 ml-2">
              4.9/5 Average Rating across India
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewList.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100/90 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-luxury-accent/20" />
                </div>

                <h3 className="font-display font-bold text-sm text-gray-900 mb-2">
                  "{rev.title || 'Incredible Comfort'}"
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    {rev.user?.name || 'Verified Buyer'}
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  </p>
                  <p className="text-[10px] text-gray-400">Verified Purchase</p>
                </div>
                {rev.product && (
                  <span className="text-[10px] text-luxury-accent font-semibold max-w-[120px] truncate text-right">
                    {rev.product.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
