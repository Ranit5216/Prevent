import React from 'react'

const SkeletonCard = ({ variant = 'default' }) => {
  const isCompact = variant === 'compact'
  const imageHeight = isCompact ? 'h-[140px] sm:h-[160px]' : 'h-[180px] sm:h-[200px]'
  const cardPadding = isCompact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md animate-pulse ${cardPadding}`}>
      {/* Image Skeleton */}
      <div className={`w-full ${imageHeight} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-3`}></div>
      
      {/* Content Skeleton */}
      <div className="space-y-2">
        {/* Title Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        
        {/* Rating Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        
        {/* Price Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-24 mt-3"></div>
        
        {/* Button Skeleton */}
        <div className="h-9 bg-gray-200 rounded mt-4"></div>
      </div>
    </div>
  )
}

export default SkeletonCard

