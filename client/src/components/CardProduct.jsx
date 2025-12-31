import React from "react";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { Link } from "react-router-dom";
import { valideURLConvert } from "../utils/valideURLConvert";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import AddToCartButton from "./AddToCartButton";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  return names.map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

// Star Rating Component
const StarRating = ({ rating, size = 'text-[10px]' }) => {
  const stars = [];
  const fullRating = parseFloat(rating) || 0;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(fullRating)) {
      // Full star
      stars.push(
        <FaStar
          key={i}
          className={`${size} text-[#fbbf24] fill-[#fbbf24]`}
        />
      );
    } else if (i === Math.ceil(fullRating) && fullRating % 1 >= 0.5) {
      // Half star
      stars.push(
        <FaStarHalfAlt
          key={i}
          className={`${size} text-[#fbbf24] fill-[#fbbf24]`}
        />
      );
    } else {
      // Empty star
      stars.push(
        <FaRegStar
          key={i}
          className={`${size} text-[#fbbf24]`}
        />
      );
    }
  }
  
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const CardProduct = ({ data, variant = 'compact' }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;
  const finalPrice = pricewithDiscount(data.price, data.discount);
  const savings = data.discount ? data.price - finalPrice : 0;
  
  // Get vendor info
  const vendorName = data?.admin_info?.name || data?.admin_id?.name || '';
  const vendorAvatar = data?.admin_id?.avatar && data?.admin_id?.avatar.trim() !== '' ? data.admin_id.avatar : '';
  const vendorInitials = getInitials(vendorName);

  // Variant styles: 'compact' for product list, 'default' for home page
  const isCompact = variant === 'compact';
  
  // Mobile-optimized dimensions for consistent card sizes
  const imageHeight = 'h-[140px] sm:h-[160px]'; // Smaller on mobile, larger on desktop
  const cardPadding = isCompact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'; // Tighter padding on mobile
  const titleSize = isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'; // Smaller text on mobile
  const priceSize = isCompact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'; // Responsive price size

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.03)] sm:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-300 cursor-pointer flex flex-col h-full w-full max-w-full active:scale-[0.98] sm:hover:-translate-y-1 sm:hover:scale-[1.01] sm:hover:shadow-[0_8px_24px_rgba(220,38,38,0.15),0_4px_12px_rgba(0,0,0,0.1)] group relative border border-[rgba(220,38,38,0.08)] sm:border-[rgba(220,38,38,0.1)]">
      {/* Top Accent Bar on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DC2626] to-[#991B1B] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

      {/* Image Section - Fixed Height */}
      <Link to={url} className="block flex-shrink-0 relative">
        <div className={`w-full ${imageHeight} bg-gradient-to-br from-[#667eea] to-[#764ba2] overflow-hidden relative`}>
          {data.image && data.image[0] ? (
            <>
              <OptimizedImage
                src={data.image[0]}
                alt={data.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                fetchPriority="auto"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl md:text-3xl font-semibold">
              {data.name?.substring(0, 3) || '📷'}
            </div>
          )}
          {/* Discount Badge - Professional Style - Mobile Optimized */}
          {Boolean(data.discount) && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-[12px] sm:rounded-[16px] text-[9px] sm:text-[10px] font-bold tracking-wide shadow-[0_2px_6px_rgba(220,38,38,0.4)] sm:shadow-[0_2px_8px_rgba(220,38,38,0.4)] z-20 backdrop-blur-sm">
              {data.discount}% OFF
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className={`${cardPadding} flex flex-col flex-grow bg-white`}>
        {/* Service Header with Logo - Mobile Optimized */}
        <div className="flex items-start gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 pb-2 sm:pb-2.5 border-b border-[#f1f5f9] min-h-[56px] sm:min-h-[64px]">
          {/* Logo Wrapper */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] overflow-hidden border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(220,38,38,0.08)] sm:shadow-[0_2px_8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(220,38,38,0.1)] bg-white flex items-center justify-center transition-all duration-300 sm:group-hover:scale-105 sm:group-hover:shadow-[0_4px_12px_rgba(220,38,38,0.2),0_0_0_1px_rgba(220,38,38,0.2)]">
              {vendorAvatar ? (
                <OptimizedImage
                  src={vendorAvatar}
                  alt={vendorName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  fetchPriority="auto"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-white font-bold text-xs">
                  {vendorInitials || 'BR'}
                </div>
              )}
            </div>
            {/* Verified Badge - Mobile Optimized */}
            {data.verified && (
              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#10b981] rounded-full border-[1.5px] sm:border-2 border-white flex items-center justify-center shadow-[0_1px_4px_rgba(16,185,129,0.4)] sm:shadow-[0_2px_6px_rgba(16,185,129,0.4)]">
                <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-white" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="flex-1 min-w-0">
            {/* Service Name */}
            <Link to={url} className="block">
              <h3 className={`${titleSize} font-bold text-[#1e293b] mb-1 sm:mb-1.5 line-clamp-2 sm:group-hover:text-[#DC2626] transition-colors leading-tight sm:leading-snug`}>
                {data.name}
              </h3>
            </Link>
            {/* Rating & Location - Mobile Optimized */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap mt-0.5 sm:mt-1">
              {/* Rating - Always show - Mobile Optimized */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <StarRating 
                  rating={data.averageRating || data.rating || data.ratingStats?.average || 0}
                  size="text-[9px] sm:text-[10px]"
                />
                <span className="text-[10px] sm:text-xs text-[#475569] font-semibold">
                  {(data.averageRating || data.rating || data.ratingStats?.average || 0).toFixed(1)}
                </span>
                {(data.reviewCount || data.ratingStats?.total) ? (
                  <span className="text-[9px] sm:text-[10px] text-[#94a3b8] font-normal">
                    ({data.reviewCount || data.ratingStats?.total || 0})
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] text-[#94a3b8] font-normal">
                    (0)
                  </span>
                )}
              </div>
              {/* Location - Mobile Optimized */}
              {(data.location || data.address || data.city || data?.admin_id?.location) && (
                <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-[#64748b]">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#64748b] flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="line-clamp-1 max-w-[80px] sm:max-w-none">
                    {data.location || data.address || data.city || data?.admin_id?.location || 'Location'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Section - Enhanced - Mobile Optimized */}
        <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 bg-gradient-to-br from-[#fef2f2] to-[#fee2e2] rounded-lg sm:rounded-lg border border-[#fecaca] min-h-[52px] sm:min-h-[60px] flex flex-col justify-center">
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5">
            <span className={`${priceSize} font-extrabold text-[#DC2626] tracking-tight`}>
              {DisplayPriceInRupees(finalPrice)}
            </span>
            {Boolean(data.discount) && (
              <span className="text-xs sm:text-sm text-[#94a3b8] line-through font-medium">
                {DisplayPriceInRupees(data.price)}
              </span>
            )}
          </div>
          {Boolean(data.discount) && savings > 0 && (
            <div className="text-[9px] sm:text-[10px] text-[#10b981] font-semibold">
              You save {DisplayPriceInRupees(savings)}
            </div>
          )}
        </div>

        {/* Add to Cart Button - Professional - Mobile Optimized */}
        <div className="w-full mt-auto">
          {data.stock === 0 ? (
            <div className="w-full bg-gray-200 text-gray-600 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-center font-semibold text-[10px] sm:text-xs h-[32px] sm:h-[36px] flex items-center justify-center">
              Out of stock
            </div>
          ) : (
            <AddToCartButton 
              data={data} 
              customButtonClass="w-full bg-gradient-to-r from-[#DC2626] to-[#991B1B] active:from-[#991B1B] active:to-[#7f1d1d] sm:hover:from-[#991B1B] sm:hover:to-[#7f1d1d] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wide shadow-[0_2px_6px_rgba(220,38,38,0.3)] sm:shadow-[0_2px_8px_rgba(220,38,38,0.3)] active:shadow-[0_1px_4px_rgba(220,38,38,0.4)] sm:hover:shadow-[0_4px_12px_rgba(220,38,38,0.4)] active:scale-[0.98] sm:hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 relative overflow-hidden group/btn h-[32px] sm:h-[36px] flex items-center justify-center"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CardProduct;
