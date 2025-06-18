import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { FaAngleRight, FaAngleLeft, FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa6"
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import Divider from '../components/Divider'
import HospitalityImage from '../assets/image.png'
import BestPrice from '../assets/best price.jpeg'
import WideVarity from '../assets/wide assortment.jpg'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from '../components/AddToCartButton'
<<<<<<< HEAD
import Loading from '../components/Loading'
=======
<<<<<<< HEAD
import Loading from '../components/Loading'
=======

>>>>>>> 3dc8716a5f1b9afee4f3f4c58afce981c5e6691c
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9

const ProductDisplayPage = () => {
  const params = useParams()
  let productId = params?.product?.split("-")?.slice(-1)[0]
  const [data, setData] = useState({
    name: "",
    image: []
  })
  const [image, setImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const imageContainer = useRef()

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        setData(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductDetails()
  }, [params])

  const handleScrollRight = () => {
    imageContainer.current.scrollLeft += 100
  }
  const handleScrollLeft = () => {
    imageContainer.current.scrollLeft -= 100
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-6">
            {/* Left Column - Image Gallery */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="aspect-square relative">
                  <img
                    src={data.image[image]}
                    alt={data.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9
              {/* Image Navigation Dots */}
              <div className="flex items-center justify-center gap-2">
                {data.image.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === image ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
<<<<<<< HEAD
=======
=======
            </div> 
              
              {
                data.stock === 0 ? (
                  <p className='text-lg text-red-500 my-2'>Out of Stock</p>
                ) 
                : (
                   //<button className='my-4 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded'>Add</button>
                  <div className='my-4'>
                    <AddToCartButton data={data}/>
                  </div>
                )
              }
           
>>>>>>> 3dc8716a5f1b9afee4f3f4c58afce981c5e6691c
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9

              {/* Thumbnail Gallery */}
              <div className="relative">
                <div
                  ref={imageContainer}
                  className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth"
                >
                  {data.image.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === image ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${data.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={handleScrollLeft}
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg pointer-events-auto transition-all duration-300 hover:scale-110"
                  >
                    <FaAngleLeft className="text-gray-600" />
                  </button>
                  <button
                    onClick={handleScrollRight}
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg pointer-events-auto transition-all duration-300 hover:scale-110"
                  >
                    <FaAngleRight className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Product Details - Desktop */}
              <div className="hidden lg:block space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Product Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-600">Description</p>
                      <p className="text-gray-800 mt-1">{data.description}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Unit</p>
                      <p className="text-gray-800 mt-1">{data.unit}</p>
                    </div>
                    {data?.more_details && Object.entries(data.more_details).map(([key, value], index) => (
                      <div key={index}>
                        <p className="font-medium text-gray-600">{key}</p>
                        <p className="text-gray-800 mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-8">
              <div>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Booking Now For Your Special Day
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.name}</h1>
                <p className="text-gray-600">{data.unit}</p>
              </div>

              <Divider />

              {/* Price Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Price</h3>
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 border-2 border-green-600 rounded-lg px-6 py-3">
                    <p className="text-2xl font-bold text-green-700">
                      {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
                    </p>
                  </div>
                  {data.discount && (
                    <>
                      <p className="text-lg text-gray-500 line-through">
                        {DisplayPriceInRupees(data.price)}
                      </p>
                      <span className="text-xl font-bold text-green-600">
                        {data.discount}% <span className="text-sm text-gray-500">Discount</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="pt-4">
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

              {/* Why Book From Us Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Why Book From Our Platform?</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={HospitalityImage}
                        alt="Superfast Delivery"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Superfast Delivery</h3>
                      <p className="text-gray-600">Our service team will reach your exact location and carry out their duties in harmony with you.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={BestPrice}
                        alt="Best Prices & Offers"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Best Prices & Offers</h3>
                      <p className="text-gray-600">Get the best price with our service—affordable, transparent, and competitive rates tailored to meet your needs and budget.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={WideVarity}
                        alt="Wide Variety"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Wide Variety</h3>
                      <p className="text-gray-600">We offer a wide variety of services, ensuring tailored solutions to meet diverse customer needs across multiple industries and preferences.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details - Mobile */}
              <div className="lg:hidden bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Product Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-600">Description</p>
                    <p className="text-gray-800 mt-1">{data.description}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Unit</p>
                    <p className="text-gray-800 mt-1">{data.unit}</p>
                  </div>
                  {data?.more_details && Object.entries(data.more_details).map(([key, value], index) => (
                    <div key={index}>
                      <p className="font-medium text-gray-600">{key}</p>
                      <p className="text-gray-800 mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Social Media Links */}
              {data?.admin_info && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Connect with {data.admin_info.name}</h3>
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
    </div>
  )
}

export default ProductDisplayPage