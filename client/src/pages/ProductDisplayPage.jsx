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

  // Debug container dimensions when data changes
  useEffect(() => {
    if (imageContainer.current && data.image.length > 0) {
      const container = imageContainer.current;
      console.log('Container dimensions:', {
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth,
        scrollLeft: container.scrollLeft,
        imageCount: data.image.length,
        canScroll: container.scrollWidth > container.clientWidth
      });
    }
  }, [data.image]);

  const handleScrollRight = () => {
    if (imageContainer.current) {
      const container = imageContainer.current;
      const scrollAmount = 200;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScrollLeft = Math.min(container.scrollLeft + scrollAmount, maxScroll);
      
      console.log('Scrolling right:', {
        current: container.scrollLeft,
        max: maxScroll,
        new: newScrollLeft,
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth
      });
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    } else {
      console.log('imageContainer ref is null');
    }
  };
  
  const handleScrollLeft = () => {
    if (imageContainer.current) {
      const container = imageContainer.current;
      const scrollAmount = 200;
      const newScrollLeft = Math.max(container.scrollLeft - scrollAmount, 0);
      
      console.log('Scrolling left:', {
        current: container.scrollLeft,
        new: newScrollLeft
      });
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    } else {
      console.log('imageContainer ref is null');
    }
  };

  // Lightbox modal for gallery
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextLightbox = () => setLightboxIndex((prev) => (prev + 1) % ([...data.image, ...(Array.isArray(data.video) ? data.video : [])].length));
  const prevLightbox = () => setLightboxIndex((prev) => (prev - 1 + ([...data.image, ...(Array.isArray(data.video) ? data.video : [])].length)) % ([...data.image, ...(Array.isArray(data.video) ? data.video : [])].length));

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-1">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Gallery Section */}
          <div className="w-full lg:w-7/12 flex flex-col gap-8">
            <div className="bg-white rounded-3xl shadow-2xl pt-1 pb-4 px-2 md:pt-2 md:pb-6 md:px-6 flex flex-col items-center sticky top-24 z-10">
              {/* Main Image/Video */}
              <div className="relative w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden group mt-0">
                {data.image.length > 0 && image < data.image.length ? (
                  <img
                    src={data.image[image]}
                    alt={data.name}
                    className="w-full h-full object-contain transition-all duration-300 cursor-pointer bg-white"
                    style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', margin: 'auto' }}
                    onClick={() => openLightbox(image)}
                  />
                ) : Array.isArray(data.video) && data.video.length > 0 && image - data.image.length < data.video.length ? (
                  <video
                    src={data.video[image - data.image.length]}
                    controls
                    className="w-full h-full object-contain transition-all duration-300 cursor-pointer bg-white"
                    style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', margin: 'auto' }}
                    onClick={() => openLightbox(image)}
                  />
                ) : null}
                {/* Expand Icon */}
                <button
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-all duration-300 opacity-0 group-hover:opacity-100"
                  onClick={() => openLightbox(image)}
                  aria-label="Expand"
                >
                  <FaExpand className="text-gray-600" />
                </button>
                {/* Navigation Arrows for mobile */}
                {data.image.length > 4 && (
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 lg:hidden">
                    <button
                      onClick={handleScrollLeft}
                      className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg pointer-events-auto transition-all duration-300 hover:scale-110 z-10"
                      aria-label="Scroll left"
                    >
                      <FaAngleLeft className="text-gray-700 text-lg" />
                    </button>
                    <button
                      onClick={handleScrollRight}
                      className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg pointer-events-auto transition-all duration-300 hover:scale-110 z-10"
                      aria-label="Scroll right"
                    >
                      <FaAngleRight className="text-gray-700 text-lg" />
                    </button>
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              <div className="relative w-full mt-0">
                <div
                  ref={imageContainer}
                  className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth py-2 w-full"
                  style={{ 
                    scrollBehavior: 'smooth',
                    minWidth: 'max-content'
                  }}
                >
                  {data.image.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        index === image ? 'border-blue-600 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${data.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover bg-white"
                        style={{ aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
                      />
                    </button>
                  ))}
                  {Array.isArray(data.video) && data.video.map((vid, vIndex) => {
                    const index = data.image.length + vIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => setImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          index === image ? 'border-blue-600 shadow-lg' : 'border-gray-200 hover:border-blue-300'
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
                {/* Navigation Arrows for desktop */}
                {data.image.length > 4 && (
                  <div className="hidden lg:flex absolute inset-y-0 left-0 right-0 items-center justify-between">
                    <button
                      onClick={handleScrollLeft}
                      className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg pointer-events-auto transition-all duration-300 hover:scale-110 z-10 -ml-4"
                      aria-label="Scroll left"
                    >
                      <FaAngleLeft className="text-gray-700 text-lg" />
                    </button>
                    <button
                      onClick={handleScrollRight}
                      className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg pointer-events-auto transition-all duration-300 hover:scale-110 z-10 -mr-4"
                      aria-label="Scroll right"
                    >
                      <FaAngleRight className="text-gray-700 text-lg" />
                    </button>
                  </div>
                )}
              </div>
              {/* Dots */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {[...data.image, ...(Array.isArray(data.video) ? data.video : [])].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === image ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Lightbox Modal */}
            {lightboxOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 flex flex-col items-center">
                  <button
                    className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
                    onClick={closeLightbox}
                  >
                    <span className="text-xl">&times;</span>
                  </button>
                  <div className="w-full aspect-square flex items-center justify-center bg-gray-50 rounded-xl">
                    {lightboxIndex < data.image.length ? (
                      <img
                        src={data.image[lightboxIndex]}
                        alt={data.name}
                        className="w-full h-full object-contain bg-white"
                        style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', margin: 'auto' }}
                      />
                    ) : (
                      <video
                        src={data.video[lightboxIndex - data.image.length]}
                        controls
                        className="w-full h-full object-contain bg-white"
                        style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', margin: 'auto' }}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full mt-4">
                    <button onClick={prevLightbox} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      <FaAngleLeft className="text-xl text-gray-600" />
                    </button>
                    <button onClick={nextLightbox} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      <FaAngleRight className="text-xl text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Info Panel */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 sticky top-24 z-20">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 flex flex-col gap-6">
              {/* Product Title & Unit */}
              <div>
                <span className="inline-block bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-xs font-semibold mb-3 tracking-wide uppercase">Booking Now For Your Special Day</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{data.name}</h1>
              </div>
              {/* Price Section */}
              <div className="flex items-end gap-4 flex-wrap">
                <div className="bg-green-50 border-2 border-green-600 rounded-xl px-7 py-4">
                  <p className="text-3xl font-bold text-green-700">
                    {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
                  </p>
                </div>
                {data.discount && (
                  <>
                    <p className="text-lg text-gray-400 line-through">
                      {DisplayPriceInRupees(data.price)}
                    </p>
                    <span className="text-xl font-bold text-green-600">
                      {data.discount}% <span className="text-sm text-gray-500">Off</span>
                    </span>
                  </>
                )}
              </div>
               {/* Add to Cart Section */}
              <div className="pt-1">
                {data.stock === 0 ? (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-center">
                    <p className="font-medium">Out of Stock</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <AddToCartButton data={data} />
                  </div>
                )}
              </div>
            </div>
            {/* Tabs for Details */}
            <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-4 mt-2">
              <div className="flex gap-2 border-b pb-2">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-200 ${tab === t.key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-blue-600'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="pt-2">
                {tab === 'description' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-700 text-base leading-relaxed">{data.description}</p>
                  </div>
                )}
                {tab === 'details' && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Details</h3>
                    {data?.more_details && Object.entries(data.more_details).map(([key, value], index) => (
                      <div key={index}>
                        <span className="font-medium text-gray-600">{key}: </span>
                        <span className="text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'why' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Why Book From Our Platform?</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow">
                        <img
                          src={HospitalityImage}
                          alt="Superfast Delivery"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Superfast Delivery</h4>
                        <p className="text-gray-600 text-sm">Our service team will reach your exact location and carry out their duties in harmony with you.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow">
                        <img
                          src={BestPrice}
                          alt="Best Prices & Offers"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Best Prices & Offers</h4>
                        <p className="text-gray-600 text-sm">Get the best price with our service—affordable, transparent, and competitive rates tailored to meet your needs and budget.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow">
                        <img
                          src={WideVarity}
                          alt="Wide Variety"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Wide Variety</h4>
                        <p className="text-gray-600 text-sm">We offer a wide variety of services, ensuring tailored solutions to meet diverse customer needs across multiple industries and preferences.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Admin Social Media Links */}
            {data?.admin_info && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow flex flex-col gap-2 mt-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect with {data.admin_info.name}</h3>
                <div className="flex items-center gap-4">
                  {data.admin_info.facebookLink && (
                    <a
                      href={data.admin_info.facebookLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <FaFacebook size={24} />
                    </a>
                  )}
                  {data.admin_info.youtubeLink && (
                    <a
                      href={data.admin_info.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <FaYoutube size={24} />
                    </a>
                  )}
                  {data.admin_info.instagramLink && (
                    <a
                      href={data.admin_info.instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      <FaInstagram size={24} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplayPage;
