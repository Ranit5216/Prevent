import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useGlobalContext } from '../provider/GlobalProvider'

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
    <div>
      <div className='bg-white shadow-md p-3 font-semibold'>
        <h1>My Orders</h1>
      </div>

      {user.role === "ADMIN" && (
        <div className='mt-4'>
          <div className='bg-white shadow-md p-3 font-semibold'>
            <h1>Booking Orders</h1>
          </div>
          {loading ? (
            <div className='text-center p-4'>Loading...</div>
          ) : allOrders.length === 0 ? (
            <NoData />
          ) : (
            <div className='space-y-4 p-4'>
              {allOrders.map((order) => (
                <div key={order._id} className='bg-white p-4 rounded shadow'>
                  <div className='flex justify-between items-start mb-4'>
                    <div>
                      <p className='font-medium'>Order No: {order.orderId}</p>
                      <p className='text-sm text-gray-600'>Customer: {order.userId?.name}</p>
                      <p className='text-sm text-gray-600'>Email: {order.userId?.email}</p>
                      <p className='text-sm text-gray-600'>Phone: {order.userId?.mobile}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </div>
                  <div className='flex gap-3 mb-4'>
                    <img
                      src={order.product_details.image[0]}
                      className='w-14 h-14 object-cover rounded'
                      alt={order.product_details.name}
                    />
                    <div>
                      <p className='font-medium'>{order.product_details.name}</p>
                      <p className='text-sm text-gray-600'>Amount: ₹{order.totalAmt}</p>
                    </div>
                  </div>
                  {order.order_status === 'PENDING' && (
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleUpdateStatus(order.orderId, 'ACCEPTED')}
                        className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.orderId, 'CANCELLED')}
                        className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className='mt-4'>
        {!orders[0] && <NoData />}
        {orders.map((order, index) => (
          <div key={order._id + index + "order"} className='order rounded p-4 text-sm'>
            <p>Order No: {order?.orderId}</p>
            <div className='flex gap-3'>
              <img
                src={order.product_details.image[0]}
                className='w-14 h-14'
                alt={order.product_details.name}
              />
              <p className='font-medium'>{order.product_details.name}</p>
            </div>
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(order.order_status)}`}>
              {order.order_status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyOrders