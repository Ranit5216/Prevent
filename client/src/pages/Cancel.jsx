import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaTimesCircle, FaHome, FaShoppingBag, FaUser, FaArrowRight, FaEnvelope, FaPhone, FaInfoCircle } from 'react-icons/fa'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'

const Cancel = () => {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const orders = useSelector(state => state.orders.order)
  const latestOrder = orders && orders.length > 0 ? orders[0] : null
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FaTimesCircle className="text-4xl text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Order Cancelled
            </h1>
            <p className="text-red-100">Your order has been cancelled</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Info Message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-yellow-600 text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">What happened?</h3>
                  <p className="text-sm text-yellow-700">
                    Your order was cancelled. If this was unintentional, please contact our support team for assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Number */}
            {latestOrder && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                <h3 className="font-semibold text-gray-800 mb-1">Order Number</h3>
                <p className="text-xl font-bold text-red-600 font-mono">
                  {latestOrder.orderId || `ORD-${Date.now().toString().slice(-8)}`}
                </p>
              </div>
            )}

            {/* Order Details */}
            {latestOrder && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaShoppingBag className="text-red-600" />
                  Order Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{latestOrder.product_details?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
                      {latestOrder.order_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{DisplayPriceInRupees(latestOrder.totalAmt)}</span>
                  </div>
                  {latestOrder.cancellation_reason && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-600 text-xs">Cancellation Reason:</span>
                      <p className="text-sm text-gray-800 font-medium mt-1">
                        {latestOrder.cancellation_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <Link 
                to="/" 
                className="w-full bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white font-semibold py-3 px-4 rounded-xl hover:from-[#EF4444] hover:to-[#DC2626] transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <FaHome />
                Go to Home
                <FaArrowRight className="text-xs" />
              </Link>
              
              <Link 
                to="/dashboard/myorders" 
                className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <FaUser />
                View Orders
              </Link>
            </div>

            {/* Contact */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2">Need help with your order?</p>
              <div className="flex justify-center gap-4 text-xs">
                <a href="mailto:tradeoxford123@gmail.com" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                  <FaEnvelope />
                  Email
                </a>
                <a href="tel:+917439001746" className="flex items-center gap-1 text-red-600 hover:text-red-700">
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

export default Cancel
