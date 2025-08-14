import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaCheckCircle, FaHome, FaShoppingBag, FaUser, FaArrowRight, FaEnvelope, FaPhone } from 'react-icons/fa'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'

const Success = () => {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const orders = useSelector(state => state.orders.order)
  const latestOrder = orders && orders.length > 0 ? orders[0] : null
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const successText = Boolean(location?.state?.text) ? location?.state?.text : "Payment"
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {successText} Successful!
            </h1>
            <p className="text-green-100">Thank you for your order</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Order Number */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4 text-center">
              <h3 className="font-semibold text-gray-800 mb-1">Order Number</h3>
              <p className="text-xl font-bold text-blue-600 font-mono">
                {latestOrder?.orderId || `ORD-${Date.now().toString().slice(-8)}`}
              </p>
            </div>

            {/* Order Details */}
            {latestOrder && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaShoppingBag className="text-green-600" />
                  Order Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{latestOrder.product_details?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                      {latestOrder.order_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{DisplayPriceInRupees(latestOrder.totalAmt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(latestOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Order Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Order Placed</p>
                    <p className="text-xs text-gray-500">Confirmed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600 text-sm">Processing</p>
                    <p className="text-xs text-gray-500">Preparing order</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600 text-sm">Delivery</p>
                    <p className="text-xs text-gray-500">
                      {latestOrder?.delivery_date 
                        ? new Date(latestOrder.delivery_date).toLocaleDateString()
                        : 'On the way'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Link 
                to="/" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <FaHome />
                Go to Home
                <FaArrowRight className="text-xs" />
              </Link>
              
              <Link 
                to="/dashboard/myorders" 
                className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
              >
                <FaUser />
                View Orders
              </Link>
            </div>

            {/* Contact */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2">Need help?</p>
              <div className="flex justify-center gap-4 text-xs">
                <a href="mailto:support@preevent.in" className="flex items-center gap-1 text-green-600 hover:text-green-700">
                  <FaEnvelope />
                  Email
                </a>
                <a href="tel:+91-1234567890" className="flex items-center gap-1 text-green-600 hover:text-green-700">
                  <FaPhone />
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Success