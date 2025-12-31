import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaHome, FaArrowLeft, FaSearch, FaExclamationTriangle } from 'react-icons/fa'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6">
            <FaExclamationTriangle className="text-6xl text-red-600" />
          </div>
          <h1 className="text-8xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
            404
          </h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FaArrowLeft />
            Go Back
          </button>
          
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white font-semibold rounded-xl hover:from-[#EF4444] hover:to-[#DC2626] transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FaHome />
            Go to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Popular Pages</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              to="/"
              className="p-3 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/search"
              className="p-3 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <FaSearch className="text-xs" />
              Search
            </Link>
            <Link
              to="/support"
              className="p-3 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
            >
              Support
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please <Link to="/support" className="text-red-600 hover:underline font-medium">contact our support team</Link>.</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound

