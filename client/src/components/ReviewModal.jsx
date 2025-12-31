import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { FaStar, FaRegStar, FaStarHalfAlt, FaCamera, FaSpinner, FaTimes, FaCheckCircle } from 'react-icons/fa';
import uploadFile from '../utils/UploadImage';

const ReviewModal = ({ isOpen, onClose, productId, productName, productImage, orderId, onReviewSubmitted }) => {
  const user = useSelector((state) => state?.user) || {};
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(false);
  const fileInputRef = useRef(null);

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, readonly = false, size = "text-2xl" }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (value) => {
      if (!readonly && onRatingChange) {
        onRatingChange(value);
      }
    };

    const handleMouseEnter = (value) => {
      if (!readonly) {
        setHoverRating(value);
      }
    };

    const handleMouseLeave = () => {
      if (!readonly) {
        setHoverRating(0);
      }
    };

    const displayRating = hoverRating || rating;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          if (displayRating >= star) {
            return (
              <FaStar
                key={star}
                className={`${size} text-[#ffbf00] cursor-pointer transition-all ${
                  readonly ? 'cursor-default' : 'hover:scale-110'
                }`}
                onClick={() => handleClick(star)}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
              />
            );
          } else if (displayRating >= star - 0.5) {
            return (
              <FaStarHalfAlt
                key={star}
                className={`${size} text-[#ffbf00] cursor-pointer transition-all ${
                  readonly ? 'cursor-default' : 'hover:scale-110'
                }`}
                onClick={() => handleClick(star)}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
              />
            );
          } else {
            return (
              <FaRegStar
                key={star}
                className={`${size} text-gray-300 cursor-pointer transition-all ${
                  readonly ? 'cursor-default' : 'hover:scale-110'
                }`}
                onClick={() => handleClick(star)}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
              />
            );
          }
        })}
      </div>
    );
  };

  // Check if user has already reviewed
  useEffect(() => {
    const checkIfReviewed = async () => {
      if (!isOpen || !productId || !user?._id) {
        setHasReviewed(false);
        return;
      }

      setCheckingReview(true);
      try {
        const response = await Axios({
          ...SummaryApi.canUserReview,
          data: { productId }
        });

        if (response.data.success) {
          // The API returns: { success: true, data: { canReview, hasExistingReview, hasDeliveredOrder } }
          // OR: { success: true, canReview, ... } (check both structures)
          const responseData = response.data.data || response.data;
          const { canReview, hasExistingReview, hasDeliveredOrder } = responseData || {};
          
          // User has already reviewed ONLY if hasExistingReview is true
          // If canReview is false but hasExistingReview is false, it means they don't have a delivered order yet
          if (hasExistingReview === true) {
            setHasReviewed(true);
          } else {
            // User hasn't reviewed yet (either can review or waiting for delivery)
            setHasReviewed(false);
          }
        }
      } catch (error) {
        // If error, assume not reviewed
        // Error checking review status
        setHasReviewed(false);
      } finally {
        setCheckingReview(false);
      }
    };

    checkIfReviewed();
  }, [isOpen, productId, user?._id]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReviewForm({ rating: 0, title: '', comment: '' });
      setSelectedImages([]);
      setHasReviewed(false);
    }
  }, [isOpen]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedImages.length + files.length > 5) {
      toast.error('You can upload maximum 5 images');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const newImages = results
        .filter(result => result?.data?.success)
        .map(result => result.data.data.url);
      
      setSelectedImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user?._id) {
      toast.error('Please login to submit a review');
      return;
    }

    if (reviewForm.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await Axios({
        ...SummaryApi.createReview,
        data: {
          productId,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
          images: selectedImages
        }
      });

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setHasReviewed(true);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {productImage && (
              <img
                src={productImage}
                alt={productName}
                className="w-16 h-16 rounded-lg object-cover border-2 border-white/30"
              />
            )}
            <div>
              <h2 className="text-xl font-bold">Write a Review</h2>
              <p className="text-sm text-white/90">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {checkingReview ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-[#DC2626]" />
            </div>
          ) : hasReviewed ? (
            <div className="text-center py-12">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Review Already Submitted</h3>
              <p className="text-gray-600 mb-6">You have already reviewed this product. Thank you for your feedback!</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#DC2626] text-white rounded-lg font-semibold hover:bg-[#991B1B] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block font-semibold mb-3 text-lg">Your Rating *</label>
                <StarRating
                  rating={reviewForm.rating}
                  onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
                />
                {reviewForm.rating > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                  {reviewForm.rating === 5 ? 'Excellent!' :
                   reviewForm.rating === 4 ? 'Very Good!' :
                   reviewForm.rating === 3 ? 'Good' :
                   reviewForm.rating === 2 ? 'Fair' : 'Poor'}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold mb-2 text-base">Review Title (Optional)</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block font-semibold mb-2 text-base">Your Review *</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this service..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all resize-vertical"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block font-semibold mb-2 text-base">Upload Photos (Optional, Max 5)</label>
                <div className="flex flex-wrap gap-3">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Review ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-[#DC2626] text-white rounded-full p-1 hover:bg-[#991B1B] transition-all"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                  {selectedImages.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImages}
                      className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#DC2626] hover:bg-[#FEE2E2] transition-all disabled:opacity-50"
                    >
                      {uploadingImages ? (
                        <FaSpinner className="animate-spin text-[#DC2626] text-xl" />
                      ) : (
                        <>
                          <FaCamera className="text-[#DC2626] text-xl mb-1" />
                          <span className="text-xs text-gray-600">Add</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || reviewForm.rating === 0 || !reviewForm.comment.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaStar />
                      <span>Submit Review</span>
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

export default ReviewModal;

