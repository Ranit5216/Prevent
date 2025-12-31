import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { 
  FaChartLine, 
  FaRupeeSign, 
  FaShoppingCart, 
  FaUsers, 
  FaStar, 
  FaBox, 
  FaMoneyBillWave,
  FaChartBar,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaUser,
  FaUserShield,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaSave,
  FaSpinner
} from 'react-icons/fa';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import Loading from '../components/Loading';

const VendorDashboard = () => {
  const user = useSelector((state) => state?.user) || {};
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showOrders, setShowOrders] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  
  // Dashboard Analytics State
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    averageRating: 0,
    totalProducts: 0,
    totalCommission: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    ratingChange: 0
  });

  // Raw Orders Data
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Inventory State
  const [inventory, setInventory] = useState([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [editingStock, setEditingStock] = useState(null); // Track which product is being edited
  const [stockValue, setStockValue] = useState(''); // Temporary stock value while editing
  const [updatingStock, setUpdatingStock] = useState(false); // Loading state for stock update

  // Ratings State
  const [ratings, setRatings] = useState({
    average: 0,
    total: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // Calculate revenue directly from orders - use useMemo for performance
  const revenueData = useMemo(() => {
    if (allOrders.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, activeCustomers: 0 };
    }
    
    const activeOrders = allOrders.filter(order => order.order_status !== 'CANCELLED');
    const totalRevenue = activeOrders.reduce((sum, order) => {
      const amount = order.totalAmt || order.totalAmount || order.subTotalAmt || order.amount || 0;
      const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
      return sum + numAmount;
    }, 0);
    
    const totalOrders = activeOrders.length;
    const uniqueCustomers = new Set(activeOrders.map(order => order.userId?.toString()).filter(Boolean)).size;
    
    return { totalRevenue, totalOrders, activeCustomers: uniqueCustomers };
  }, [allOrders]);

  // Calculate analytics from orders - use useState to ensure re-renders
  const [calculatedAnalytics, setCalculatedAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    revenueChange: 0,
    ordersChange: 0,
    cancelledByUser: 0,
    cancelledByAdmin: 0,
    totalCancelled: 0
  });

  // Recalculate analytics when orders change
  useEffect(() => {
    if (allOrders.length === 0) {
      setCalculatedAnalytics({
        totalRevenue: 0,
        totalOrders: 0,
        activeCustomers: 0,
        revenueChange: 0,
        ordersChange: 0,
        cancelledByUser: 0,
        cancelledByAdmin: 0,
        totalCancelled: 0
  });
      return;
    }

    const activeOrders = allOrders.filter(order => order.order_status !== 'CANCELLED');
    const totalRevenue = activeOrders.reduce((sum, order) => {
      const amount = order.totalAmt || order.totalAmount || order.subTotalAmt || order.amount || 0;
      const numAmount = typeof amount === 'number' ? amount : (parseFloat(String(amount)) || 0);
      return sum + numAmount;
    }, 0);
    
    const totalOrders = activeOrders.length;
    const uniqueCustomers = new Set(activeOrders.map(order => order.userId?.toString()).filter(Boolean)).size;
    
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthOrders = activeOrders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= currentMonthStart;
    });
    const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => {
      const amount = order.totalAmt || order.totalAmount || 0;
      return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
    }, 0);
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthOrders = activeOrders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
    });
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => {
      const amount = order.totalAmt || order.totalAmount || 0;
      return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
    }, 0);
    
    const revenueChange = lastMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : (currentMonthRevenue > 0 ? 100 : 0);
    
    const ordersChange = lastMonthOrders.length > 0
      ? Math.round(((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100)
      : (currentMonthOrders.length > 0 ? 100 : 0);

    const cancelledOrders = allOrders.filter(order => order.order_status === 'CANCELLED');
    const cancelledByUser = cancelledOrders.filter(o => o.cancelled_by === 'USER').length;
    const cancelledByAdmin = cancelledOrders.filter(o => o.cancelled_by === 'ADMIN').length;

    setCalculatedAnalytics({
      totalRevenue,
      totalOrders,
      activeCustomers: uniqueCustomers,
      revenueChange,
      ordersChange,
      cancelledByUser,
      cancelledByAdmin,
      totalCancelled: cancelledOrders.length
    });
  }, [allOrders]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAllOrders(),
        fetchInventory(),
        fetchRatings()
      ]);
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await Axios({ ...SummaryApi.getAllOrders });
      if (response.data.success) {
        setAllOrders(response.data.data || []);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: 1,
          limit: 1000 // Get all products
        }
      });
      if (response.data.success) {
        setInventory(response.data.data || []);
        console.log('📦 Products fetched:', response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      AxiosToastError(error);
    }
  };

  const handleEditStock = (product) => {
    setEditingStock(product._id);
    setStockValue(product.stock || 0);
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setStockValue('');
  };

  const handleSaveStock = async (productId) => {
    const newStock = parseInt(stockValue);
    
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid stock number (0 or greater)');
      return;
    }

    try {
      setUpdatingStock(true);
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data: {
          _id: productId,
          stock: newStock
        }
      });
      
      if (response.data.success) {
        toast.success('Stock updated successfully');
        // Update local inventory state
        setInventory(prevInventory => 
          prevInventory.map(item => 
            item._id === productId 
              ? { ...item, stock: newStock }
              : item
          )
        );
        setEditingStock(null);
        setStockValue('');
      } else {
        toast.error(response.data.message || 'Failed to update stock');
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setUpdatingStock(false);
    }
  };

  const fetchRatings = async () => {
    try {
      // Use dashboard analytics endpoint which already calculates average rating
      const analyticsResponse = await Axios({ ...SummaryApi.getDashboardAnalytics });
      if (analyticsResponse.data.success && analyticsResponse.data.data) {
        const avgRating = analyticsResponse.data.data.averageRating || 0;
        const totalProducts = analyticsResponse.data.data.totalProducts || 0;
        
        setRatings({
          average: parseFloat(avgRating.toFixed(1)),
          total: totalProducts, // Using total products as review count approximation
          breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
        
        console.log('⭐ Ratings fetched from analytics:', { average: avgRating, totalProducts });
      } else {
        // Fallback: Calculate from products if they have rating data
        const productsResponse = await Axios({ 
          ...SummaryApi.getProduct,
          data: {
            page: 1,
            limit: 1000
          }
        });
        
        if (productsResponse.data.success) {
          const products = productsResponse.data.data || [];
          let totalRating = 0;
          let productsWithRatings = 0;
          
          products.forEach(product => {
            if (product.averageRating && product.averageRating > 0) {
              totalRating += product.averageRating;
              productsWithRatings++;
            }
          });
          
          const average = productsWithRatings > 0 ? (totalRating / productsWithRatings).toFixed(1) : 0;
          
          setRatings({
            average: parseFloat(average),
            total: productsWithRatings,
            breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          });
          
          console.log('⭐ Ratings calculated from products:', { average, productsWithRatings });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching ratings:', error);
      // Set default values on error
      setRatings({
        average: 0,
        total: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    }
  };

  useEffect(() => {
      fetchDashboardData();
  }, []);

  const getStockStatus = (stock) => {
    if (stock > 20) return { label: 'In Stock', class: 'bg-green-100 text-green-800' };
    if (stock > 10 && stock <= 20) return { label: 'Good Stock', class: 'bg-blue-100 text-blue-800' };
    if (stock > 5 && stock <= 10) return { label: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
    if (stock > 0 && stock <= 5) return { label: 'Very Low Stock', class: 'bg-orange-100 text-orange-800' };
    return { label: 'Out of Stock', class: 'bg-red-100 text-red-800' };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaClock },
      'ACCEPTED': { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaCheckCircle },
      'DELIVERED': { bg: 'bg-green-100', text: 'text-green-800', icon: FaTruck },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', icon: FaTimes }
    };
    return statusConfig[status] || statusConfig['PENDING'];
  };

  const getStatusDisplayText = (status) => {
    if (status === 'DELIVERED') {
      return 'Service done';
    }
    return status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name || 'Vendor'}</p>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics - Compact Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaRupeeSign className="text-blue-600 text-sm" />
              </div>
              {calculatedAnalytics.revenueChange !== 0 && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  calculatedAnalytics.revenueChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {calculatedAnalytics.revenueChange > 0 ? <FaArrowUp className="inline text-xs" /> : <FaArrowDown className="inline text-xs" />}
                  {Math.abs(calculatedAnalytics.revenueChange)}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-1">Revenue</p>
            <p className="text-lg font-bold text-gray-900">{DisplayPriceInRupees(revenueData.totalRevenue)}</p>
              </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaShoppingCart className="text-purple-600 text-sm" />
              </div>
              {calculatedAnalytics.ordersChange !== 0 && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  calculatedAnalytics.ordersChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {calculatedAnalytics.ordersChange > 0 ? <FaArrowUp className="inline text-xs" /> : <FaArrowDown className="inline text-xs" />}
                  {Math.abs(calculatedAnalytics.ordersChange)}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-1">Orders</p>
            <p className="text-lg font-bold text-gray-900">{revenueData.totalOrders}</p>
              </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaUsers className="text-green-600 text-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Customers</p>
            <p className="text-lg font-bold text-gray-900">{revenueData.activeCustomers}</p>
              </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaStar className="text-yellow-600 text-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Rating</p>
            <p className="text-lg font-bold text-gray-900">{ratings.average.toFixed(1)}</p>
              </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FaBox className="text-indigo-600 text-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Products</p>
            <p className="text-lg font-bold text-gray-900">{inventory.length}</p>
              </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaChartBar className="text-red-600 text-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Cancelled</p>
            <p className="text-lg font-bold text-gray-900">{calculatedAnalytics.totalCancelled}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Orders ({allOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'inventory'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Inventory ({inventory.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Cancellation Stats */}
                {calculatedAnalytics.totalCancelled > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FaChartBar className="text-red-500" />
                      Cancellation Statistics
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <p className="text-xs text-red-600 mb-1">Total</p>
                        <p className="text-xl font-bold text-red-700">{calculatedAnalytics.totalCancelled}</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <p className="text-xs text-blue-600 mb-1">By Users</p>
                        <p className="text-xl font-bold text-blue-700">{calculatedAnalytics.cancelledByUser}</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                        <p className="text-xs text-purple-600 mb-1">By Admin</p>
                        <p className="text-xl font-bold text-purple-700">{calculatedAnalytics.cancelledByAdmin}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 mb-1">Unknown</p>
                        <p className="text-xl font-bold text-gray-700">
                          {calculatedAnalytics.totalCancelled - calculatedAnalytics.cancelledByUser - calculatedAnalytics.cancelledByAdmin}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Orders Summary */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <FaShoppingCart className="text-blue-500" />
                      Recent Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {allOrders.slice(0, 5).map((order, index) => {
                      const statusBadge = getStatusBadge(order.order_status);
                      const StatusIcon = statusBadge.icon;
                      return (
                        <div key={order._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                              <StatusIcon className="text-xs" />
                              {getStatusDisplayText(order.order_status)}
                            </span>
                            <span className="text-xs font-mono text-gray-600 truncate">{order.orderId}</span>
                            <span className="text-xs text-gray-500 truncate hidden sm:inline">{order.user_details?.name || 'N/A'}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{DisplayPriceInRupees(order.totalAmt || order.totalAmount || 0)}</p>
                            <p className="text-xs text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}</p>
                          </div>
                        </div>
                      );
                    })}
                    {allOrders.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
          {ordersLoading ? (
                  <div className="flex justify-center py-12">
              <Loading />
            </div>
                ) : allOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <FaShoppingCart className="mx-auto text-gray-400 text-4xl mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-3">
                      {allOrders.map((order, index) => {
                        const statusBadge = getStatusBadge(order.order_status);
                        const StatusIcon = statusBadge.icon;
                        return (
                          <div key={order._id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                                    <StatusIcon className="text-xs" />
                                    {order.order_status}
                                  </span>
                                </div>
                                <p className="text-xs font-mono text-gray-600 truncate">{order.orderId}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{DisplayPriceInRupees(order.totalAmt || order.totalAmount || 0)}</p>
                              </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Customer:</span>
                                <span className="font-medium text-gray-900">{order.user_details?.name || 'N/A'}</span>
                              </div>
                              {order.user_details?.email && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Email:</span>
                                  <span className="text-gray-700 truncate ml-2">{order.user_details.email}</span>
                                </div>
                              )}
                              {order.order_status === 'CANCELLED' && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Cancelled By:</span>
                                  <span className={`font-medium ${
                                    order.cancelled_by === 'USER' ? 'text-blue-700' : 
                                    order.cancelled_by === 'ADMIN' ? 'text-purple-700' : 
                                    'text-gray-400'
                                  }`}>
                                    {order.cancelled_by === 'USER' ? 'User' : 
                                     order.cancelled_by === 'ADMIN' ? 'Admin' : 'N/A'}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Date:</span>
                                <span className="text-gray-700">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto -mx-6 px-6">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order ID</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Cancelled By</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allOrders.map((order, index) => {
                            const statusBadge = getStatusBadge(order.order_status);
                            const StatusIcon = statusBadge.icon;
                            return (
                              <tr key={order._id || index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-3">
                                  <span className="text-xs sm:text-sm font-mono font-semibold text-gray-900 break-all">{order.orderId}</span>
                      </td>
                                <td className="px-3 py-3">
                                  <div className="text-xs sm:text-sm font-medium text-gray-900">{order.user_details?.name || 'N/A'}</div>
                                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{order.user_details?.email || 'N/A'}</div>
                        </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{DisplayPriceInRupees(order.totalAmt || order.totalAmount || 0)}</span>
                        </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                                    <StatusIcon className="text-xs" />
                            {order.order_status}
                          </span>
                        </td>
                                <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                                  {order.order_status === 'CANCELLED' ? (
                                    order.cancelled_by === 'USER' ? (
                                      <span className="text-xs text-blue-700 font-medium">User</span>
                                    ) : order.cancelled_by === 'ADMIN' ? (
                                      <span className="text-xs text-purple-700 font-medium">Admin</span>
                                    ) : (
                                      <span className="text-xs text-gray-400">N/A</span>
                                    )
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                        </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <span className="text-xs text-gray-600">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                  </span>
                        </td>
                      </tr>
                            );
                          })}
                </tbody>
              </table>
            </div>
                  </>
          )}
        </div>
            )}

            {activeTab === 'inventory' && (
              <div>
                <div className="mb-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search products..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Image</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.filter(item => 
                        item.name?.toLowerCase().includes(inventorySearch.toLowerCase())
                      ).slice(0, 20).map((item, index) => {
                    const stockStatus = getStockStatus(item.stock || 0);
                    return (
                          <tr key={item._id || index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {item.image && item.image.length > 0 && item.image[0] ? (
                                  <img
                                    src={item.image[0]}
                                    alt={item.name || 'Product'}
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 bg-gray-100"
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23F3F4F6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                                    }}
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                                    <FaBox className="text-gray-400 text-lg" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{item.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{item.category?.[0]?.name || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {editingStock === item._id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={stockValue}
                                    onChange={(e) => setStockValue(e.target.value)}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={updatingStock}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveStock(item._id);
                                      } else if (e.key === 'Escape') {
                                        handleCancelEdit();
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSaveStock(item._id)}
                                    disabled={updatingStock}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                    title="Save"
                                  >
                                    {updatingStock ? (
                                      <FaSpinner className="animate-spin text-sm" />
                                    ) : (
                                      <FaSave className="text-sm" />
                                    )}
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={updatingStock}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                    title="Cancel"
                                  >
                                    <FaTimes className="text-sm" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900">{item.stock || 0}</span>
                                  <button
                                    onClick={() => handleEditStock(item)}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit stock"
                                  >
                                    <FaEdit className="text-xs" />
                                  </button>
                                </div>
                              )}
                        </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">{DisplayPriceInRupees(item.price || 0)}</span>
                        </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${stockStatus.class}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                      </tr>
                    );
                      })}
              </tbody>
            </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
