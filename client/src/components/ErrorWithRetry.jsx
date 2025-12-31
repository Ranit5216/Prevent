import React from 'react'
import { FaRedo, FaExclamationTriangle } from 'react-icons/fa'

const ErrorWithRetry = ({ 
  message = "Something went wrong. Please try again.", 
  onRetry, 
  retryCount = 0,
  maxRetries = 3 
}) => {
  const canRetry = retryCount < maxRetries

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-red-100">
      <div className="mb-4">
        <FaExclamationTriangle className="text-4xl text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Oops! An Error Occurred</h3>
      <p className="text-sm text-gray-600 text-center mb-6 max-w-md">{message}</p>
      
      {canRetry ? (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <FaRedo className="text-sm" />
            Retry {retryCount > 0 && `(${retryCount}/${maxRetries})`}
          </button>
          {retryCount > 0 && (
            <p className="text-xs text-gray-500">Attempt {retryCount} of {maxRetries}</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Maximum retry attempts reached.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  )
}

export default ErrorWithRetry

