import React, { useState, useRef, useEffect } from 'react'

/**
 * OptimizedImage Component
 * Features:
 * - Lazy loading with Intersection Observer
 * - WebP format support with fallback
 * - Responsive images with srcset
 * - Placeholder while loading
 * - Error handling with fallback
 */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  style = {},
  loading = 'lazy',
  fetchPriority = 'auto',
  width,
  height,
  sizes,
  onClick,
  onError,
  onLoad,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23F3F4F6"/%3E%3C/svg%3E',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  // Check if browser supports WebP
  const supportsWebP = () => {
    if (typeof window === 'undefined') return false
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  // Convert image URL to WebP if supported and ensure HTTPS
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc || originalSrc.startsWith('data:')) return originalSrc
    
    // Convert HTTP to HTTPS to avoid mixed content errors
    let processedSrc = originalSrc
    if (processedSrc.startsWith('http://')) {
      processedSrc = processedSrc.replace('http://', 'https://')
    }
    
    // If using Cloudinary or similar CDN, add WebP format
    if (processedSrc.includes('cloudinary') || processedSrc.includes('res.cloudinary')) {
      const webpSrc = processedSrc.replace(/\.(jpg|jpeg|png)/i, '.webp')
      return supportsWebP() ? webpSrc : processedSrc
    }
    
    // For other image hosts, try to add format parameter
    // This is a generic approach - adjust based on your image hosting
    return processedSrc
  }

  // Generate responsive srcset
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || baseSrc.startsWith('data:')) return undefined
    
    // Generate different sizes for responsive images
    const sizes = [400, 800, 1200, 1600]
    const srcSet = sizes
      .map(size => {
        const optimizedSrc = getOptimizedSrc(baseSrc)
        // Add size parameter if using CDN, otherwise return base
        if (optimizedSrc.includes('cloudinary')) {
          return `${optimizedSrc}?w=${size} ${size}w`
        }
        return `${optimizedSrc} ${size}w`
      })
      .join(', ')
    
    return srcSet || undefined
  }

  useEffect(() => {
    if (!src) return

    // If loading is 'eager' or fetchPriority is 'high', load immediately
    if (loading === 'eager' || fetchPriority === 'high') {
      setImageSrc(getOptimizedSrc(src))
      return
    }

    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(getOptimizedSrc(src))
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current)
              }
            }
          })
        },
        {
          rootMargin: '50px', // Start loading 50px before image enters viewport
          threshold: 0.01
        }
      )

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current)
      }
    } else {
      // Fallback for browsers without Intersection Observer
      setImageSrc(getOptimizedSrc(src))
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current)
      }
    }
  }, [src, loading, fetchPriority])

  const handleLoad = (e) => {
    setIsLoaded(true)
    if (onLoad) onLoad(e)
  }

  const handleError = (e) => {
    setHasError(true)
    // Fallback to original src if WebP fails
    if (imageSrc !== src && !src.startsWith('data:')) {
      setImageSrc(src)
    } else if (onError) {
      onError(e)
    } else {
      // Default error handling
      e.target.style.display = 'none'
    }
  }

  const srcSet = generateSrcSet(src)
  const optimizedSrc = imageSrc !== placeholder ? getOptimizedSrc(imageSrc) : placeholder

  return (
    <img
      ref={imgRef}
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      style={{
        ...style,
        imageRendering: 'auto',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        willChange: isLoaded ? 'auto' : 'opacity'
      }}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      width={width}
      height={height}
      onClick={onClick}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
}

export default OptimizedImage

