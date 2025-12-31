import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { FaStar, FaRegStar, FaStarHalfAlt, FaThumbsUp, FaFlag, FaSpinner, FaTimes, FaCheckCircle } from 'react-icons/fa';

const Reviews = ({ productId }) => {
  const user = useSelector((state) => state?.user) || {};
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    total: 0,
    average: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [expandedImage, setExpandedImage] = useState(null);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductReviews,
        data: {
          productId,
          page,
          limit: 10,
          filter,
          sort
        }
      });

      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setRatingStats(response.data.data.ratingStats);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    } else {
      setLoading(false);
      setReviews([]);
      setRatingStats({
        total: 0,
        average: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    }
  }, [productId, page, filter, sort]);

  // Always show the component, even if productId is missing
  if (!productId) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-4 sm:mb-6 flex items-center gap-2">
          <FaStar className="text-[#DC2626] text-xl sm:text-2xl" />
          Customer Reviews
        </h2>
        <div className="text-center py-12">
          <FaSpinner className="animate-spin text-4xl text-[#DC2626] mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // Star rating component
  const StarRating = ({ rating, onRatingChange, readonly = false, size = 'text-lg' }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <FaStar
            key={i}
            className={`${size} ${readonly ? 'text-[#ffbf00]' : 'text-gray-300 cursor-pointer hover:text-[#ffbf00]'} transition-colors`}
            onClick={() => !readonly && onRatingChange && onRatingChange(i)}
          />
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <FaStarHalfAlt
            key={i}
            className={`${size} ${readonly ? 'text-[#ffbf00]' : 'text-gray-300 cursor-pointer hover:text-[#ffbf00]'} transition-colors`}
            onClick={() => !readonly && onRatingChange && onRatingChange(i)}
          />
        );
      } else {
        stars.push(
          <FaRegStar
            key={i}
            className={`${size} ${readonly ? 'text-gray-300' : 'text-gray-300 cursor-pointer hover:text-[#ffbf00]'} transition-colors`}
            onClick={() => !readonly && onRatingChange && onRatingChange(i)}
          />
        );
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };


  // Handle helpful toggle
  const handleMarkHelpful = async (reviewId) => {
    if (!user?._id) {
      toast.error('Please login to mark reviews as helpful');
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.markReviewHelpful,
        data: { reviewId }
      });

      if (response.data.success) {
        fetchReviews();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Handle report review
  const handleReportReview = async (reviewId) => {
    if (!user?._id) {
      toast.error('Please login to report reviews');
      return;
    }

    if (window.confirm('Are you sure you want to report this review?')) {
      try {
        const response = await Axios({
          ...SummaryApi.reportReview,
          data: { reviewId }
        });

        if (response.data.success) {
          toast.success('Review reported successfully');
        }
      } catch (error) {
        AxiosToastError(error);
      }
    }
  };

  // Calculate percentage for rating breakdown
  const getPercentage = (count) => {
    if (ratingStats.total === 0) return 0;
    return Math.round((count / ratingStats.total) * 100);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Check if user marked review as helpful
  const isHelpful = (review) => {
    if (!user?._id) return false;
    return review.helpful_users?.some(id => id.toString() === user._id.toString());
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8" style={{ minHeight: '200px' }}>
      {/* Rating Summary */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-4 sm:mb-6 flex items-center gap-2">
          <FaStar className="text-[#DC2626] text-xl sm:text-2xl" />
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-br from-[#FEE2E2] to-white border-2 border-[#FEE2E2] rounded-xl">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#DC2626] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {parseFloat(ratingStats.average).toFixed(1)}
            </div>
            <div className="mb-2">
              <StarRating rating={parseFloat(ratingStats.average)} readonly size="text-xl sm:text-2xl" />
            </div>
            <div className="text-sm sm:text-base text-[#6B7280]">
              Based on {ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="flex flex-col gap-2 sm:gap-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats.breakdown[star] || 0;
              const percentage = getPercentage(count);
              return (
                <div key={star} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1 min-w-[60px] sm:min-w-[80px]">
                    <span className="text-sm sm:text-base font-semibold">{star}</span>
                    <FaStar className="text-[#ffbf00] text-xs sm:text-sm" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ffbf00] to-[#DC2626] rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs sm:text-sm text-[#6B7280] min-w-[40px] text-right">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
          {['all', '5', '4', '3', '2', '1', 'photos', 'verified'].map((f) => {
            let label = f.charAt(0).toUpperCase() + f.slice(1);
            if (f === 'all') label = 'All Reviews';
            if (f === 'photos') label = 'With Photos';
            if (f === 'verified') label = 'Verified Purchase';
            if (['5', '4', '3', '2', '1'].includes(f)) label = `${f} Star${f !== '1' ? 's' : ''}`;

            let count = 0;
            if (f === 'all') count = ratingStats.total;
            else if (f === 'photos') count = reviews.filter(r => r.images?.length > 0).length;
            else if (f === 'verified') count = reviews.filter(r => r.verified_purchase).length;
            else if (['5', '4', '3', '2', '1'].includes(f)) count = ratingStats.breakdown[parseInt(f)] || 0;

            return (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                  filter === f
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-md'
                    : 'bg-white text-[#111827] border-[#E5E7EB] hover:bg-[#FEE2E2] hover:border-[#DC2626]'
                }`}
              >
                {label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-[#6B7280] font-medium">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-[#E5E7EB] rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>


      {/* Reviews List */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-[#111827] mb-4 sm:mb-6 flex items-center gap-2">
          <FaStar className="text-[#DC2626]" />
          Recent Reviews
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-[#DC2626]" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <FaStar className="text-4xl sm:text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border-2 border-[#E5E7EB] rounded-xl p-4 sm:p-6 hover:border-[#DC2626] hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-white flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">
                      {review.user_details?.avatar ? (
                        <img
                          src={review.user_details.avatar}
                          alt={review.user_details.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(review.user_details?.name)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm sm:text-base text-[#111827]">
                          {review.user_details?.name || 'Anonymous'}
                        </h4>
                        {review.verified_purchase && (
                          <span className="inline-flex items-center gap-1 bg-[#00b050] text-white px-2 py-0.5 rounded text-xs font-semibold">
                            <FaCheckCircle className="text-xs" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B7280]">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StarRating rating={review.rating} readonly size="text-sm sm:text-base" />
                  </div>
                </div>

                {review.title && (
                  <h5 className="font-semibold text-base sm:text-lg mb-2 text-[#111827]">{review.title}</h5>
                )}

                <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  {review.comment}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                    {review.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Review ${index + 1}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-[#E5E7EB] cursor-pointer hover:border-[#DC2626] transition-all"
                        onClick={() => setExpandedImage(img)}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-[#E5E7EB]">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      isHelpful(review)
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-[#F5F5F5] text-[#111827] hover:bg-[#FEE2E2] hover:text-[#DC2626]'
                    }`}
                  >
                    <FaThumbsUp />
                    Helpful ({review.helpful_count || 0})
                  </button>
                  <button
                    onClick={() => handleReportReview(review._id)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F5F5] text-[#111827] rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-all"
                  >
                    <FaFlag />
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 sm:px-4 py-2 border-2 border-[#E5E7EB] rounded-lg text-sm sm:text-base font-semibold hover:bg-[#FEE2E2] hover:border-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-sm sm:text-base text-[#6B7280]">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 sm:px-4 py-2 border-2 border-[#E5E7EB] rounded-lg text-sm sm:text-base font-semibold hover:bg-[#FEE2E2] hover:border-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-2 right-2 bg-[#DC2626] hover:bg-[#991B1B] text-white p-2 rounded-full transition-all z-10"
            >
              <FaTimes className="text-lg" />
            </button>
            <img
              src={expandedImage}
              alt="Expanded review"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;

