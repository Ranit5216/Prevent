import React, { useEffect, useState } from 'react';
import NoData from '../components/NoData';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { FaBox, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import CancellationReasonModal from '../components/CancellationReasonModal';

const BookingOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellationModal, setCancellationModal] = useState({
    isOpen: false,
    orderId: '',
    productName: ''
  });

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getAllOrders
      });
      const { data: responseData } = response;
      if (responseData.success) {
        setAllOrders(responseData.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status, cancellation_reason = '') => {
    try {
      const response = await Axios({
        ...SummaryApi.updateOrderStatus,
        data: {
          orderId,
          status,
          ...(cancellation_reason && { cancellation_reason })
        }
      });
      const { data: responseData } = response;
      if (responseData.success) {
        // Show success toast with order details
        const order = allOrders.find(o => o.orderId === orderId);
        const productName = order?.product_details?.name || 'Order';
        
        if (status === 'CANCELLED') {
          toast.success(`${productName} has been cancelled. Reason: ${cancellation_reason}`, {
            duration: 5000,
            icon: '❌'
          });
        } else if (status === 'ACCEPTED') {
          toast.success(`${productName} has been accepted and is being processed!`, {
            duration: 4000,
            icon: '✅'
          });
        } else {
          toast.success(responseData.message);
        }
        
        fetchAllOrders();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    }
  };

  const openCancellationModal = (orderId, productName) => {
    setCancellationModal({
      isOpen: true,
      orderId,
      productName
    });
  };

  const closeCancellationModal = () => {
    setCancellationModal({
      isOpen: false,
      orderId: '',
      productName: ''
    });
  };

  const handleCancellationConfirm = async (orderId, status, cancellation_reason) => {
    try {
      await handleUpdateStatus(orderId, status, cancellation_reason);
    } catch (error) {
      console.error('Error in cancellation confirmation:', error);
      toast.error('Failed to cancel order. Please try again.');
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaBox className="text-2xl text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">Booking Orders</h1>
          </div>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : allOrders.length === 0 ? (
            <NoData />
          ) : (
            <div className="grid gap-6">
              {allOrders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md">
                  <div className="flex flex-col gap-4">
                    {/* Customer Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaUser className="text-blue-600" />
                        <span>{order.user_details?.name || order.userId?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaEnvelope className="text-blue-600" />
                        <span>{order.user_details?.email || order.userId?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaPhone className="text-blue-600" />
                        <span>{order.user_details?.mobile || order.userId?.mobile}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-purple-600" />
                        <span>Booking Date: {new Date(order.delivery_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {/* Address Info */}
                    {order.delivery_address && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">Delivery Address</h4>
                        <div className="text-sm text-gray-600">
                          <p>{order.delivery_address.address_line}</p>
                          <p>{order.delivery_address.city}, {order.delivery_address.state}</p>
                          <p>{order.delivery_address.country} - {order.delivery_address.pincode}</p>
                          <p>Contact: {order.delivery_address.mobile}</p>
                        </div>
                      </div>
                    )}
                    {/* Product Info */}
                    <div className="flex gap-4 items-start">
                      <img
                        src={order.product_details.image[0]}
                        className="w-20 h-20 object-cover rounded-lg"
                        alt={order.product_details.name}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{order.product_details.name}</h3>
                        <p className="text-sm text-gray-600">Amount: ₹{order.totalAmt}</p>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    
                    {/* Action Buttons */}
                    {order.order_status === 'PENDING' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleUpdateStatus(order.orderId, 'ACCEPTED')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => openCancellationModal(order.orderId, order.product_details.name)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CancellationReasonModal
        isOpen={cancellationModal.isOpen}
        onClose={closeCancellationModal}
        onConfirm={handleCancellationConfirm}
        orderId={cancellationModal.orderId}
        productName={cancellationModal.productName}
      />
    </div>
  );
};

export default BookingOrders; 