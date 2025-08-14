import React, { useState } from 'react'
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa'

const CancellationReasonModal = ({ isOpen, onClose, onConfirm, orderId, productName }) => {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(orderId, 'CANCELLED', reason.trim())
      setReason('')
      onClose()
    } catch (error) {
      console.error('Error cancelling order:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('')
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ position: 'relative', zIndex: 10000 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Cancel Booking</h3>
              <p className="text-sm text-gray-600">Provide a reason for cancellation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Booking Details:</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-800">{productName}</p>
              <p className="text-sm text-gray-600">Order ID: {orderId}</p>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancellation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for cancelling this order..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows="4"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be visible to the customer and sent via email notification.
            </p>
          </div>

          {/* Common Reasons */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Reasons:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Out of stock',
                'Booking area not covered',
                'Customer request',
                'Have not enough time',
                'Technical problem',
                'Other'
              ].map((quickReason) => (
                <button
                  key={quickReason}
                  type="button"
                  onClick={() => setReason(quickReason)}
                  disabled={isSubmitting}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {quickReason}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Cancelling...
              </>
            ) : (
              'Cancel Order'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancellationReasonModal
