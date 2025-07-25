import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useGlobalContext } from '../provider/GlobalProvider'
import { FaBox, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa'

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order)
  const user = useSelector(state => state.user)
  const { fetchOrder } = useGlobalContext()
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getAllOrders
      })
      const { data: responseData } = response

      if (responseData.success) {
        setAllOrders(responseData.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateOrderStatus,
        data: {
          orderId,
          status
        }
      })
      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        fetchAllOrders()
        fetchOrder()
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to update order status")
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await Axios({
        ...SummaryApi.cancelOrder,
        data: { orderId }
      })
      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        fetchOrder()
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to cancel order")
    }
  }

  useEffect(() => {
    if (user.role === "ADMIN") {
      fetchAllOrders()
    }
  }, [user.role])

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* My Orders Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FaBox className="text-2xl text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          </div>

          {!orders[0] ? (
            <NoData />
          ) : (
            <div className="grid gap-6">
              {orders.map((order, index) => (
                <div key={order._id + index + "order"} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <img
                        src={order.product_details.image[0]}
                        className="w-20 h-20 object-cover rounded-lg"
                        alt={order.product_details.name}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{order.product_details.name}</h3>
                        <p className="text-sm text-gray-500">Order No: {order?.orderId}</p>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </div>
                        {order.order_status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelOrder(order.orderId)}
                            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                    {order.order_status === 'ACCEPTED' && order.admin_mobile && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaPhone className="text-green-600" />
                        <span>Contact Admin: {order.admin_mobile}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders