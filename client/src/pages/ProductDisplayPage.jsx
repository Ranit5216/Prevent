import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import { FaAngleRight, FaAngleLeft, FaFacebook, FaYoutube, FaInstagram, FaExpand } from "react-icons/fa6";
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import Divider from '../components/Divider';
import HospitalityImage from '../assets/image.png';
import BestPrice from '../assets/best price.jpeg';
import WideVarity from '../assets/wide assortment.jpg';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import AddToCartButton from '../components/AddToCartButton';
import Loading from '../components/Loading';
import Reviews from '../components/Reviews';
import OptimizedImage from '../components/OptimizedImage';

const ProductDisplayPage = () => {
  const params = useParams();
  let productId = params?.product?.split("-")?.slice(-1)[0];
  const [data, setData] = useState({
    name: "",
    image: [],
    video: []
  });
  const [image, setImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const imageContainer = useRef();
  const [tab, setTab] = useState('description');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Optimize image URL for better quality
  const optimizeImageUrl = (url) => {
    if (!url) return url;
    // If using Cloudinary or similar CDN, you can add quality parameters
    // For now, return original URL - you can modify this based on your image hosting
    return url;
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId
        }
      });
      const { data: responseData } = response;
      if (responseData.success) {
        setData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [params]);

  // Scroll thumbnail container to show active thumbnail
  useEffect(() => {
    if (imageContainer.current && data.image.length > 0) {
      const container = imageContainer.current;
      const thumbnailWidth = 80 + 16; // 20 (w-20) = 80px + gap-4 (16px)
      const scrollPosition = image * thumbnailWidth - container.clientWidth / 2 + thumbnailWidth / 2;
      
      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [image, data.image.length]);

  // Navigate to next/previous image
  const totalMedia = data.image.length + (Array.isArray(data.video) ? data.video.length : 0);
  
  const handleNextImage = () => {
    setImage((prev) => (prev + 1) % totalMedia);
  };
  
  const handlePrevImage = () => {
    setImage((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  // Scroll thumbnail container
  const handleScrollRight = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (imageContainer.current) {
      const container = imageContainer.current;
      const thumbnailWidth = 80 + 16; // w-20 (80px) + gap-4 (16px)
      const scrollAmount = thumbnailWidth * 2; // Scroll 2 thumbnails at a time
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScrollLeft = Math.min(container.scrollLeft + scrollAmount, maxScroll);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };
  
  const handleScrollLeft = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (imageContainer.current) {
      const container = imageContainer.current;
      const thumbnailWidth = 80 + 16; // w-20 (80px) + gap-4 (16px)
      const scrollAmount = thumbnailWidth * 2; // Scroll 2 thumbnails at a time
      const newScrollLeft = Math.max(container.scrollLeft - scrollAmount, 0);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Lightbox modal for gallery
  const openLightbox = (index) => {
    const totalItems = data.image.length + (Array.isArray(data.video) ? data.video.length : 0);
    if (totalItems > 0 && index >= 0 && index < totalItems) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextLightbox = () => {
    const totalItems = data.image.length + (Array.isArray(data.video) ? data.video.length : 0);
    setLightboxIndex((prev) => (prev + 1) % totalItems);
  };
  const prevLightbox = () => {
    const totalItems = data.image.length + (Array.isArray(data.video) ? data.video.length : 0);
    setLightboxIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  // Tabs for details
  const TABS = [
    { key: 'description', label: 'Description' },
    { key: 'details', label: 'Details' },
    { key: 'why', label: 'Why Book With Us?' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-3 sm:py-4 md:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Gallery Section */}
          <div className="w-full lg:w-7/12 flex flex-col gap-4 sm:gap-5 md:gap-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg pt-2 pb-3 px-2 sm:pt-3 sm:pb-4 md:pt-2 md:pb-6 md:px-6 flex flex-col items-center lg:sticky lg:top-24 z-10">
              {/* Main Image/Video */}
              <div className="relative w-full aspect-square bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden group mt-0">
                {data.image.length > 0 && image < data.image.length ? (
                  <OptimizedImage
                    src={optimizeImageUrl(data.image[image])}
                    alt={data.name}
                    className="w-full h-full object-cover transition-all duration-300 cursor-pointer bg-white"
                    style={{ 
                      maxHeight: '100%', 
                      maxWidth: '100%', 
                      display: 'block', 
                      margin: 'auto'
                    }}
                    loading="eager"
                    fetchPriority="high"
                    onClick={() => openLightbox(image)}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : Array.isArray(data.video) && data.video.length > 0 && image >= data.image.length && image - data.image.length < data.video.length ? (
                  <video
                    src={data.video[image - data.image.length]}
                    controls
                    className="w-full h-full object-cover transition-all duration-300 cursor-pointer bg-white"
                    style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', margin: 'auto' }}
                    onClick={() => openLightbox(image)}
                    preload="metadata"
                  />
                ) : data.image.length > 0 ? (
                  <OptimizedImage
                    src={optimizeImageUrl(data.image[0])}
                    alt={data.name}
                    className="w-full h-full object-cover transition-all duration-300 cursor-pointer bg-white"
                    style={{ 
                      maxHeight: '100%', 
                      maxWidth: '100%', 
                      display: 'block', 
                      margin: 'auto'
                    }}
                    loading="eager"
                    fetchPriority="high"
                    onClick={() => openLightbox(0)}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : null}
                {/* Navigation Arrows for Main Image */}
                {totalMedia > 1 && (
                  <>
                    {/* Left Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 border border-gray-200"
                      aria-label="Previous image"
                    >
                      <FaAngleLeft className="text-[#DC2626] text-base sm:text-lg md:text-xl" />
                    </button>
                    {/* Right Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 border border-gray-200"
                      aria-label="Next image"
                    >
                      <FaAngleRight className="text-[#DC2626] text-base sm:text-lg md:text-xl" />
                    </button>
                  </>
                )}
                {/* Expand Icon */}
                {totalMedia > 0 && (
                  <button
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 z-20"
                    onClick={() => openLightbox(image)}
                    aria-label="Expand"
                  >
                    <FaExpand className="text-[#DC2626] text-sm sm:text-base" />
                  </button>
                )}
              </div>
              {/* Thumbnails */}
              <div className="relative w-full mt-0">
                <div
                  ref={imageContainer}
                  className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-none scroll-smooth py-2 w-full"
                  style={{ 
                    scrollBehavior: 'smooth',
                    minWidth: 'max-content'
                  }}
                >
                  {data.image.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setImage(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        index === image ? 'border-[#DC2626] shadow-lg scale-105' : 'border-gray-200 hover:border-[#DC2626]/50'
                      }`}
                    >
                      <OptimizedImage
                        src={optimizeImageUrl(img)}
                        alt={`${data.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover bg-white"
                        style={{ 
                          aspectRatio: '1/1', 
                          objectFit: 'cover', 
                          display: 'block'
                        }}
                        loading="lazy"
                        fetchPriority="auto"
                        sizes="80px"
                      />
                    </button>
                  ))}
                  {Array.isArray(data.video) && data.video.map((vid, vIndex) => {
                    const index = data.image.length + vIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => setImage(index)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          index === image ? 'border-[#DC2626] shadow-lg scale-105' : 'border-gray-200 hover:border-[#DC2626]/50'
                        }`}
                      >
                        <div className="relative w-full h-full">
                          <video
                            src={vid}
                            className="w-full h-full object-cover bg-white"
                            style={{ aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <FaAngleRight className="text-white text-2xl" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Dots */}
              {totalMedia > 1 && (
                <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-3 md:mt-4">
                  {[...data.image, ...(Array.isArray(data.video) ? data.video : [])].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setImage(index)}
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                        index === image ? 'bg-[#DC2626] scale-125' : 'bg-gray-300 hover:bg-[#DC2626]/50'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* Lightbox Modal */}
            {lightboxOpen && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
                onClick={closeLightbox}
              >
                <div 
                  className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full p-3 sm:p-4 flex flex-col items-center max-h-[95vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#DC2626] hover:bg-[#991B1B] text-white p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 z-10"
                    onClick={closeLightbox}
                  >
                    <span className="text-lg sm:text-xl font-bold">&times;</span>
                  </button>
                  <div className="w-full aspect-square flex items-center justify-center bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden max-h-[70vh] sm:max-h-[80vh]">
                    {lightboxIndex < data.image.length && data.image[lightboxIndex] ? (
                      <OptimizedImage
                        src={optimizeImageUrl(data.image[lightboxIndex])}
                        alt={data.name}
                        className="w-full h-full object-contain bg-white"
                        style={{ 
                          maxHeight: '100%', 
                          maxWidth: '100%', 
                          display: 'block', 
                          margin: 'auto'
                        }}
                        loading="eager"
                        fetchPriority="high"
                        sizes="100vw"
                      />
                    ) : Array.isArray(data.video) && data.video[lightboxIndex - data.image.length] ? (
                      <video
                        src={data.video[lightboxIndex - data.image.length]}
                        controls
                        className="w-full h-full object-contain bg-white"
                        style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', margin: 'auto' }}
                      />
                    ) : (
                      <p className="text-gray-500">No media available</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full mt-3 sm:mt-4 px-2">
                    <button onClick={prevLightbox} className="p-2 sm:p-3 bg-[#DC2626] text-white rounded-full hover:bg-[#991B1B] transition-all duration-300 hover:scale-110">
                      <FaAngleLeft className="text-lg sm:text-xl" />
                    </button>
                    <button onClick={nextLightbox} className="p-2 sm:p-3 bg-[#DC2626] text-white rounded-full hover:bg-[#991B1B] transition-all duration-300 hover:scale-110">
                      <FaAngleRight className="text-lg sm:text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Info Panel */}
          <div className="w-full lg:w-5/12 flex flex-col gap-4 sm:gap-5 md:gap-6 lg:sticky lg:top-24 z-20">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-4 sm:gap-5 md:gap-6">
              {/* Product Title & Unit */}
              <div>
                <span className="inline-block bg-gradient-to-r from-[#FEE2E2] to-[#FEE2E2] text-[#DC2626] px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[0.65rem] sm:text-xs font-semibold mb-2 sm:mb-3 tracking-wide uppercase border border-[#DC2626]/20">Booking Now For Your Special Day</span>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#111827] mb-2 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{data.name}</h1>
              </div>
              {/* Price Section */}
              <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
                <div className="bg-gradient-to-r from-[#DC2626] to-[#991B1B] rounded-lg sm:rounded-xl px-4 py-3 sm:px-5 sm:py-3 md:px-6 md:py-4 shadow-md">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                    {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
                  </p>
                </div>
                {data.discount && (
                  <>
                    <p className="text-base sm:text-lg text-[#6B7280] line-through">
                      {DisplayPriceInRupees(data.price)}
                    </p>
                    <span className="text-lg sm:text-xl font-bold text-[#DC2626] bg-[#FEE2E2] px-2.5 sm:px-3 py-1 rounded-lg">
                      {data.discount}% <span className="text-xs sm:text-sm text-[#991B1B]">Off</span>
                    </span>
                  </>
                )}
              </div>
               {/* Add to Cart Section */}
              <div className="pt-1">
                {data.stock === 0 ? (
                  <div className="bg-[#FEE2E2] text-[#DC2626] px-4 py-3 rounded-lg text-center border border-[#DC2626]/20">
                    <p className="font-semibold text-sm sm:text-base">Out of Stock</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg">
                    <AddToCartButton 
                      data={data} 
                      customButtonClass="w-full bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Tabs for Details */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4">
              <div className="flex gap-1 sm:gap-2 border-b-2 border-[#E5E7EB] pb-2 overflow-x-auto scrollbar-none">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-t-lg font-semibold text-xs sm:text-sm transition-all duration-200 relative whitespace-nowrap flex-shrink-0 ${
                      tab === t.key 
                        ? 'text-[#DC2626]' 
                        : 'text-[#6B7280] hover:text-[#DC2626]'
                    }`}
                  >
                    {t.label}
                    {tab === t.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC2626] rounded-t-full"></span>
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-2 sm:pt-3 md:pt-4">
                {tab === 'description' && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-2 sm:mb-3">Description</h3>
                    <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed">{data.description}</p>
                  </div>
                )}
                {tab === 'details' && (
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-2 sm:mb-3">Product Details</h3>
                    {data?.more_details && Object.entries(data.more_details).map(([key, value], index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-1 sm:gap-2 pb-2 border-b border-[#E5E7EB] last:border-0">
                        <span className="font-semibold text-[#111827] text-sm sm:text-base sm:min-w-[120px]">{key}:</span>
                        <span className="text-[#6B7280] text-sm sm:text-base">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'why' && (
                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-3 sm:mb-4">Why Book From Our Platform?</h3>
                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F5F5F5] rounded-lg sm:rounded-xl hover:bg-[#FEE2E2] transition-colors">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-md">
                        <img
                          src={HospitalityImage}
                          alt="Superfast Delivery"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#111827] mb-1 text-sm sm:text-base">Superfast Delivery</h4>
                        <p className="text-[#6B7280] text-xs sm:text-sm">Our service team will reach your exact location and carry out their duties in harmony with you.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F5F5F5] rounded-lg sm:rounded-xl hover:bg-[#FEE2E2] transition-colors">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-md">
                        <img
                          src={BestPrice}
                          alt="Best Prices & Offers"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#111827] mb-1 text-sm sm:text-base">Best Prices & Offers</h4>
                        <p className="text-[#6B7280] text-xs sm:text-sm">Get the best price with our service—affordable, transparent, and competitive rates tailored to meet your needs and budget.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F5F5F5] rounded-lg sm:rounded-xl hover:bg-[#FEE2E2] transition-colors">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-md">
                        <img
                          src={WideVarity}
                          alt="Wide Variety"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#111827] mb-1 text-sm sm:text-base">Wide Variety</h4>
                        <p className="text-[#6B7280] text-xs sm:text-sm">We offer a wide variety of services, ensuring tailored solutions to meet diverse customer needs across multiple industries and preferences.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Admin Social Media Links */}
            {data?.admin_info && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-[#E5E7EB] shadow-lg flex flex-col gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-2 sm:mb-3">Connect with {data.admin_info.name}</h3>
                <div className="flex items-center gap-3 sm:gap-4">
                  {data.admin_info.facebookLink && (
                    <a
                      href={data.admin_info.facebookLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1877F2] hover:text-[#1877F2] hover:scale-110 transition-all duration-300 p-1.5 sm:p-2 rounded-full hover:bg-[#FEE2E2]"
                    >
                      <FaFacebook size={20} className="sm:w-6 sm:h-6" />
                    </a>
                  )}
                  {data.admin_info.youtubeLink && (
                    <a
                      href={data.admin_info.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF0000] hover:text-[#FF0000] hover:scale-110 transition-all duration-300 p-1.5 sm:p-2 rounded-full hover:bg-[#FEE2E2]"
                    >
                      <FaYoutube size={20} className="sm:w-6 sm:h-6" />
                    </a>
                  )}
                  {data.admin_info.instagramLink && (
                    <a
                      href={data.admin_info.instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E4405F] hover:text-[#E4405F] hover:scale-110 transition-all duration-300 p-1.5 sm:p-2 rounded-full hover:bg-[#FEE2E2]"
                    >
                      <FaInstagram size={20} className="sm:w-6 sm:h-6" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Reviews Section - Full Width - Always Visible */}
      <div className="w-full mt-8 sm:mt-10 md:mt-12 px-3 sm:px-4 md:px-6 lg:px-8">
        <Reviews productId={productId} />
      </div>
    </div>
  );
};

export default ProductDisplayPage;
