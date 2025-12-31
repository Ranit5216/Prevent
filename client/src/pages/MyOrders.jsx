import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useGlobalContext } from '../provider/GlobalProvider'
import { FaBox, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaCheckCircle, FaClock, FaTruck, FaTimes, FaSpinner, FaInfoCircle, FaStar } from 'react-icons/fa'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import CancellationReasonModal from '../components/CancellationReasonModal'
import ReviewModal from '../components/ReviewModal'

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order)
  const user = useSelector(state => state.user)
  const { fetchOrder } = useGlobalContext()
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [cancellationModal, setCancellationModal] = useState({
    isOpen: false,
    orderId: '',
    productName: ''
  })
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    productId: '',
    productName: '',
    productImage: '',
    orderId: ''
  })
  
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())
  const [notificationCount, setNotificationCount] = useState(0)

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getAllOrders
      })
      const { data: responseData } = response

      if (responseData.success) {
        // Debug: Log cancelled orders to verify cancelled_by field
        const cancelledOrders = responseData.data.filter(order => order.order_status === 'CANCELLED')
        if (cancelledOrders.length > 0) {
          console.log('🔍 Frontend Admin - Cancelled orders received:', cancelledOrders.map(o => ({
            orderId: o.orderId,
            cancelled_by: o.cancelled_by,
            hasCancelledBy: 'cancelled_by' in o
          })))
        }
        setAllOrders(responseData.data)
        setLastUpdateTime(new Date())
        // Clear notification count when orders are refreshed
        setNotificationCount(0)
      }
    } catch (error) {
      // Error handled by AxiosToastError if needed
    } finally {
      setLoading(false)
    }
  }

  const refreshOrders = async () => {
    try {
      setLoading(true)
      if (user.role === "ADMIN") {
        await fetchAllOrders()
      } else {
        // For regular users, fetch their orders
        await fetchOrder()
        setLastUpdateTime(new Date())
        setNotificationCount(0)
      }
    } catch (error) {
      toast.error('Failed to refresh orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, status, cancellation_reason = '') => {
    try {
      const response = await Axios({
        ...SummaryApi.updateOrderStatus,
        data: {
          orderId,
          status,
          ...(cancellation_reason && { cancellation_reason })
        }
      })
      const { data: responseData } = response

              if (responseData.success) {
          // Show success toast with order details
          const order = user.role === "ADMIN" ? allOrders.find(o => o.orderId === orderId) : orders.find(o => o.orderId === orderId)
          const productName = order?.product_details?.name || 'Order'
          
          if (status === 'CANCELLED') {
            toast.success(`${productName} has been cancelled.`, {
              duration: 5000,
              icon: '❌'
            })
          } else if (status === 'ACCEPTED') {
            toast.success(`${productName} has been accepted and is being processed!`, {
              duration: 4000,
              icon: '✅'
            })
          } else if (status === 'DELIVERED') {
            toast.success(`${productName} has been marked as service done! The customer can now leave a review.`, {
              duration: 5000,
              icon: '🎉'
            })
          } else {
            toast.success(responseData.message)
          }
          
          // Increment notification count for real-time feedback
          setNotificationCount(prev => prev + 1)
          
          fetchAllOrders()
          fetchOrder()
        }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order status")
    }
  }

  const handleCancelOrder = async (orderId, cancellation_reason) => {
    try {
      const response = await Axios({
        ...SummaryApi.cancelOrder,
        data: { orderId, cancellation_reason }
      })
      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        // Force refresh orders to get updated status
        await fetchOrder()
        // Also refresh all orders if admin
        if (user.role === "ADMIN") {
          await fetchAllOrders()
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order")
    }
  }

  const openCancellationModal = (orderId, productName) => {
    setCancellationModal({
      isOpen: true,
      orderId,
      productName
    })
  }

  const closeCancellationModal = () => {
    setCancellationModal({
      isOpen: false,
      orderId: '',
      productName: ''
    })
  }

  const openReviewModal = (order) => {
    setReviewModal({
      isOpen: true,
      productId: order.productId,
      productName: order.product_details?.name || 'Product',
      productImage: order.product_details?.image?.[0] || '',
      orderId: order.orderId
    })
  }

  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      productId: '',
      productName: '',
      productImage: '',
      orderId: ''
    })
  }

  const handleReviewSubmitted = () => {
    // Refresh orders after review is submitted
    if (user.role === "ADMIN") {
      fetchAllOrders()
    } else {
      fetchOrder()
    }
  }

  const handleCancellationConfirm = async (orderId, status, cancellation_reason) => {
    try {
      // Validate cancellation reason
      if (!cancellation_reason || !cancellation_reason.trim()) {
        toast.error('Cancellation reason is required')
        return
      }
      
      if (user.role === "ADMIN") {
        await handleUpdateStatus(orderId, status, cancellation_reason)
        closeCancellationModal()
        // Refresh orders
        if (user.role === "ADMIN") {
          await fetchAllOrders()
        } else {
          await fetchOrder()
        }
      } else {
        await handleCancelOrder(orderId, cancellation_reason)
        closeCancellationModal()
        // Refresh orders after cancellation
        await fetchOrder()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order. Please try again.')
    }
  }

  useEffect(() => {
    if (user.role === "ADMIN") {
      fetchAllOrders()
    }
  }, [user.role])

  // Auto-refresh orders every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (user.role === "ADMIN") {
        fetchAllOrders()
      } else {
        fetchOrder()
        setLastUpdateTime(new Date())
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user.role, fetchOrder])



  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <FaClock className="text-yellow-600" />
      case 'ACCEPTED':
        return <FaCheckCircle className="text-green-600" />
      case 'CANCELLED':
        return <FaTimes className="text-red-600" />
      case 'DELIVERED':
        return <FaTruck className="text-blue-600" />
      default:
        return <FaClock className="text-gray-600" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pending'
      case 'ACCEPTED':
        return 'Accepted'
      case 'CANCELLED':
        return 'Cancelled'
      case 'DELIVERED':
        return 'Service Done'
      default:
        return status
    }
  }

  const getProgressSteps = (order) => {
    // Debug: Log cancelled orders to see if cancelled_by field exists
    if (order.order_status === 'CANCELLED') {
      console.log('🔍 Cancelled order data:', {
        orderId: order.orderId,
        cancelled_by: order.cancelled_by,
        cancellation_reason: order.cancellation_reason,
        fullOrder: order
      })
    }
    const steps = [
      {
        id: 'placed',
        title: 'Order Placed',
        subtitle: 'Order confirmed',
        icon: <FaCheckCircle />,
        completed: true,
        active: false
      },
      {
        id: 'processing',
        title: order.order_status === 'PENDING' ? 'Processing' : 
              order.order_status === 'ACCEPTED' ? 'Order Accepted' : 
              order.order_status === 'CANCELLED' ? 'Order Cancelled' : 'Processing',
        subtitle: order.order_status === 'PENDING' ? 'Admin reviewing your order' : 
                 order.order_status === 'ACCEPTED' ? 'Processing started' : 
                 order.order_status === 'CANCELLED' 
                   ? (() => {
                       const whoCancelled = order.cancelled_by === 'USER' 
                         ? 'by User' 
                         : order.cancelled_by === 'ADMIN'
                         ? 'by Admin'
                         : '';
                       return `Booking cancelled${whoCancelled ? ` ${whoCancelled}` : ''}. Reason: ${order.cancellation_reason || 'No reason provided'}`;
                     })()
                   : 'Admin reviewing your order',
        icon: order.order_status === 'PENDING' ? <FaSpinner /> : 
              order.order_status === 'ACCEPTED' ? <FaCheckCircle /> : 
              order.order_status === 'CANCELLED' ? <FaTimes /> : <FaSpinner />,
        completed: order.order_status === 'ACCEPTED' || order.order_status === 'DELIVERED',
        active: order.order_status === 'PENDING',
        cancelled: order.order_status === 'CANCELLED'
      }
    ]

    return steps
  }

  const renderProgressSteps = (steps, order) => {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            {/* Progress Line */}
            {index < steps.length - 1 && (
              <div className="flex flex-col items-center mt-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.cancelled
                    ? 'bg-red-500 text-white'
                    : step.active
                    ? 'bg-yellow-500 text-white animate-pulse'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.active && step.id === 'processing' ? <FaSpinner className="animate-spin" /> : step.icon}
                </div>
                <div className={`w-0.5 h-8 mt-2 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
            )}
            
            {/* Last step without line */}
            {index === steps.length - 1 && (
              <div className="flex flex-col items-center mt-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.cancelled
                    ? 'bg-red-500 text-white'
                    : step.active
                    ? 'bg-yellow-500 text-white animate-pulse'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.active && step.id === 'processing' ? <FaSpinner className="animate-spin" /> : step.icon}
                </div>
              </div>
            )}

            {/* Step Content */}
            <div className="flex-1 pt-6">
              <div className={`p-4 rounded-xl border ${
                step.completed 
                  ? 'bg-green-50 border-green-200' 
                  : step.cancelled
                  ? 'bg-red-50 border-red-200'
                  : step.active
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${
                    step.completed 
                      ? 'text-green-800' 
                      : step.cancelled
                      ? 'text-red-800'
                      : step.active
                      ? 'text-yellow-800'
                      : 'text-gray-600'
                  }`}>
                    {step.title}
                  </h4>
                  {step.active && (
                    <div className="flex items-center gap-1 text-yellow-600 text-sm">
                      <FaSpinner className="animate-spin" />
                      <span>Processing</span>
                    </div>
                  )}
                </div>
                <p className={`text-sm ${
                  step.completed 
                    ? 'text-green-600' 
                    : step.cancelled
                    ? 'text-red-600'
                    : step.active
                    ? 'text-yellow-600'
                    : 'text-gray-500'
                }`}>
                  {step.subtitle}
                </p>
                {step.cancelled && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-red-50 to-red-100/50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <FaTimes className="text-red-600 text-sm" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-bold text-red-800 mb-2">Cancellation Details</h5>
                          <div className="bg-red-100 px-3 py-2 rounded-md border border-red-300">
                            <p className="text-sm font-bold text-red-800">
                              {order.cancelled_by === 'USER' 
                                ? 'Booking cancelled by User' 
                                : order.cancelled_by === 'ADMIN'
                                ? 'Booking cancelled by Admin'
                                : 'Booking cancelled (Cancelled by information not available)'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      {order.cancellation_reason && (
                        <div className="pl-10 border-t border-red-200 pt-3">
                          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1.5">Reason</p>
                          <p className="text-sm text-red-800 leading-relaxed bg-white/60 px-3 py-2 rounded-md border border-red-200">
                            {order.cancellation_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderOrderCard = (order) => {
    const progressSteps = getProgressSteps(order)
    
    return (
      <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
        {/* Order Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Product Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                <img
                  src={order.product_details?.image?.[0]}
                  alt={order.product_details?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/64x64?text=No+Image'
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {order.product_details?.name}
                </h3>
                <p className="text-sm text-gray-600">Order ID: {order.orderId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.order_status)}`}>
                  {getStatusIcon(order.order_status)}
                  <span className="ml-1">{getStatusText(order.order_status)}</span>
                </span>

              </div>
              <span className="text-lg font-bold text-green-600">
                {DisplayPriceInRupees(order.totalAmt)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBox className="text-green-600" />
            Order Progress
          </h4>
          {renderProgressSteps(progressSteps, order)}
        </div>



        {/* Order Details */}
        <div className="bg-gray-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <span className="text-gray-600">Booking Date:</span>
              <span className="font-medium">{new Date(order.delivery_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-500" />
              <span className="text-gray-600">Payment:</span>
              <span className="font-medium">
                {order.payment_status === "CASH ON DELIVERY" ? "CASH ON BOOKING" : order.payment_status}
              </span>
            </div>
            {order.admin_mobile && (
              <div className="flex items-center gap-2">
                <FaPhone className="text-gray-500" />
                <span className="text-gray-600">Admin Contact:</span>
                <a href={`tel:${order.admin_mobile}`} className="font-medium text-blue-600 hover:underline">
                  {order.admin_mobile}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Admin Actions */}
        {user.role === "ADMIN" && (
          <div className="p-6 bg-blue-50 border-t border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-3">Admin Actions</h5>
            <div className="flex flex-wrap gap-3">
              {order.order_status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(order.orderId, 'ACCEPTED')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FaCheckCircle />
                    Accept Order
                  </button>
                  <button
                    onClick={() => openCancellationModal(order.orderId, order.product_details?.name)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <FaTimes />
                    Reject Order
                  </button>
                </>
              )}
              {order.order_status === 'ACCEPTED' && (
                <button
                  onClick={() => handleUpdateStatus(order.orderId, 'DELIVERED')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaTruck />
                  Mark as Service Done
                </button>
              )}
            </div>
          </div>
        )}

        {/* User Actions */}
        {user.role !== "ADMIN" && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              {/* Only show cancel button if order is PENDING */}
              {order.order_status === 'PENDING' && (
                <button
                  onClick={() => openCancellationModal(order.orderId, order.product_details?.name)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FaTimes />
                  Cancel Order
                </button>
              )}
              {/* Show cancelled status badge if order is cancelled */}
              {order.order_status === 'CANCELLED' && (
                <div className="w-full p-4 bg-gradient-to-br from-red-50 via-red-50/80 to-red-100/50 border-l-4 border-red-500 rounded-r-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <FaTimes className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <h5 className="text-sm font-bold text-red-800 mb-2">Order Cancelled</h5>
                        <div className="bg-red-100 px-3 py-2 rounded-md border border-red-300">
                          <p className="text-sm font-bold text-red-800">
                            {order.cancelled_by === 'USER' 
                              ? 'Booking cancelled by User' 
                              : order.cancelled_by === 'ADMIN'
                              ? 'Booking cancelled by Admin'
                              : 'Booking cancelled (Cancelled by information not available)'
                            }
                          </p>
                        </div>
                      </div>
                      {order.cancellation_reason && (
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1.5">Reason</p>
                          <p className="text-sm text-red-800 bg-white/70 px-3 py-2 rounded-md border border-red-200 leading-relaxed">
                            {order.cancellation_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {order.order_status === 'DELIVERED' && (
                <button
                  onClick={() => openReviewModal(order)}
                  className="px-4 py-2 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FaStar />
                  Write a Review
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  const displayOrders = user.role === "ADMIN" ? allOrders : orders

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaBox className="text-3xl text-green-600" />
                {notificationCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user.role === "ADMIN" ? "All Orders" : "My Booking"}
                </h1>
                <p className="text-gray-600">
                  {user.role === "ADMIN" 
                    ? "Manage and track all customer orders" 
                    : "Track your order progress and status"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
                          <div className="text-xs text-gray-500 text-right">
              <div>Auto-refresh every 30s</div>
              <div className="text-gray-400">
                Last updated: {lastUpdateTime.toLocaleTimeString()}
              </div>
              {loading && (
                <div className="text-green-600 font-medium">
                  Refreshing...
                </div>
              )}
            </div>

              <button
                onClick={refreshOrders}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaSpinner className={`${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {displayOrders.length === 0 ? (
          <NoData />
        ) : (
          <div className="space-y-6">
            {displayOrders.map(renderOrderCard)}
          </div>
        )}
      </div>
      {/* Cancellation Reason Modal */}
      <CancellationReasonModal
        isOpen={cancellationModal.isOpen}
        onClose={closeCancellationModal}
        onConfirm={handleCancellationConfirm}
        orderId={cancellationModal.orderId}
        productName={cancellationModal.productName}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        productId={reviewModal.productId}
        productName={reviewModal.productName}
        productImage={reviewModal.productImage}
        orderId={reviewModal.orderId}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  )
}

export default MyOrders