import OrderModel from '../models/order.model.js';
import ProductModel from '../models/product.model.js';
import ReviewModel from '../models/review.model.js';
import UserModel from '../models/user.model.js';

// Get Dashboard Analytics
export const getDashboardAnalyticsController = async (request, response) => {
    try {
        const adminId = request.userId;

        // Get current date and previous month date
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Total Revenue (all time) - Include all orders except CANCELLED
        const totalRevenueResult = await OrderModel.aggregate([
            { $match: { admin_id: adminId, order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmt' } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Current Month Revenue - Include all orders except CANCELLED
        const currentMonthRevenueResult = await OrderModel.aggregate([
            { 
                $match: { 
                    admin_id: adminId, 
                    order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] },
                    createdAt: { $gte: currentMonthStart }
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalAmt' } } }
        ]);
        const currentMonthRevenue = currentMonthRevenueResult[0]?.total || 0;

        // Last Month Revenue - Include all orders except CANCELLED
        const lastMonthRevenueResult = await OrderModel.aggregate([
            { 
                $match: { 
                    admin_id: adminId, 
                    order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] },
                    createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalAmt' } } }
        ]);
        const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;
        const revenueChange = lastMonthRevenue > 0 
            ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) 
            : 0;

        // Total Orders - Include all orders except CANCELLED
        const totalOrders = await OrderModel.countDocuments({ 
            admin_id: adminId, 
            order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] } 
        });

        // Current Month Orders - Include all orders except CANCELLED
        const currentMonthOrders = await OrderModel.countDocuments({
            admin_id: adminId,
            order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] },
            createdAt: { $gte: currentMonthStart }
        });

        // Last Month Orders - Include all orders except CANCELLED
        const lastMonthOrders = await OrderModel.countDocuments({
            admin_id: adminId,
            order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] },
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });
        const ordersChange = lastMonthOrders > 0 
            ? Math.round(((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100) 
            : 0;

        // Active Customers (unique users who have placed orders) - Include all orders except CANCELLED
        const activeCustomersResult = await OrderModel.distinct('userId', {
            admin_id: adminId,
            order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] }
        });
        const activeCustomers = activeCustomersResult.length;

        // Current Month Active Customers
        const currentMonthCustomersResult = await OrderModel.distinct('userId', {
            admin_id: adminId,
            order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] },
            createdAt: { $gte: currentMonthStart }
        });
        const currentMonthCustomers = currentMonthCustomersResult.length;

        // Last Month Active Customers
        const lastMonthCustomersResult = await OrderModel.distinct('userId', {
            admin_id: adminId,
            order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] },
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });
        const lastMonthCustomers = lastMonthCustomersResult.length;
        const customersChange = lastMonthCustomers > 0 
            ? Math.round(((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100) 
            : 0;

        // Average Rating (from reviews)
        // First get all products by this admin
        const adminProducts = await ProductModel.find({ admin_id: adminId }).select('_id');
        const productIds = adminProducts.map(p => p._id);

        // Then get reviews for those products
        const ratingsResult = await ReviewModel.aggregate([
            {
                $match: {
                    productId: { $in: productIds },
                    status: 'active'
                }
            },
            {
                $group: {
                    _id: null,
                    average: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const averageRating = ratingsResult[0]?.average || 0;

        // Total Products
        const totalProducts = await ProductModel.countDocuments({
            admin_id: adminId,
            public: true
        });

        // Total Earnings (100% commission means admin gets full revenue)
        const commissionRate = 1.0; // 100%
        const totalEarnings = totalRevenue; // Full revenue since 100% commission

        return response.json({
            message: "Dashboard analytics retrieved successfully",
            error: false,
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                activeCustomers,
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                totalProducts,
                totalCommission: Math.round(totalEarnings), // Earnings = Revenue when commission is 0%
                revenueChange,
                ordersChange,
                customersChange,
                ratingChange: 0.2 // This would need historical data to calculate
            }
        });

    } catch (error) {
        console.error("Dashboard analytics error:", error);
        return response.status(500).json({
            message: error.message || "Failed to fetch dashboard analytics",
            error: true,
            success: false
        });
    }
};

// Get Sales Reports
export const getSalesReportsController = async (request, response) => {
    try {
        const adminId = request.userId;
        const { period } = request.body;

        // Calculate date range based on period
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'Today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date();
                break;
            case 'This Week':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                break;
            case 'This Month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date();
                break;
            case 'This Year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date();
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date();
        }

        // Get orders in date range
        const orders = await OrderModel.find({
            admin_id: adminId,
            order_status: { $in: ['ACCEPTED', 'DELIVERED'] },
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const totalSales = orders.reduce((sum, order) => sum + (order.totalAmt || 0), 0);
        const ordersCompleted = orders.length;
        const averageOrderValue = ordersCompleted > 0 ? Math.round(totalSales / ordersCompleted) : 0;

        // Conversion rate (this would need more data - for now using a placeholder)
        const conversionRate = 12.5;

        return response.json({
            message: "Sales reports retrieved successfully",
            error: false,
            success: true,
            data: {
                totalSales,
                ordersCompleted,
                averageOrderValue,
                conversionRate
            }
        });

    } catch (error) {
        console.error("Sales reports error:", error);
        return response.status(500).json({
            message: error.message || "Failed to fetch sales reports",
            error: true,
            success: false
        });
    }
};

// Get Commission Data
export const getCommissionDataController = async (request, response) => {
    try {
        const adminId = request.userId;
        const commissionRate = 1.0; // 100%

        // Get current month dates
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total Earnings (all time) - Since commission is 100%, earnings = full revenue
        const totalRevenueResult = await OrderModel.aggregate([
            { 
                $match: { 
                    admin_id: adminId, 
                    order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] } 
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalAmt' } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;
        const totalEarnings = totalRevenue; // Full revenue since 100% commission

        // This Month Earnings - Include all orders except CANCELLED
        const thisMonthRevenueResult = await OrderModel.aggregate([
            { 
                $match: { 
                    admin_id: adminId, 
                    order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] },
                    createdAt: { $gte: currentMonthStart }
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalAmt' } } }
        ]);
        const thisMonthRevenue = thisMonthRevenueResult[0]?.total || 0;
        const thisMonthEarnings = thisMonthRevenue; // Full revenue since 100% commission

        // Pending Earnings (from orders that are PENDING or ACCEPTED but not yet DELIVERED)
        const pendingOrdersResult = await OrderModel.aggregate([
            { 
                $match: { 
                    admin_id: adminId, 
                    order_status: { $in: ['PENDING', 'ACCEPTED'] } 
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalAmt' } } }
        ]);
        const pendingRevenue = pendingOrdersResult[0]?.total || 0;
        const pendingEarnings = pendingRevenue; // Full revenue since 100% commission

        // Commission History (last 10 orders) - Include all orders except CANCELLED
        const recentOrders = await OrderModel.find({
            admin_id: adminId,
            order_status: { $in: ['PENDING', 'ACCEPTED', 'DELIVERED'] }
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderId createdAt totalAmt order_status')
        .lean();

        const history = recentOrders.map(order => ({
            orderId: order.orderId,
            date: new Date(order.createdAt).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            }),
            amount: order.totalAmt,
            commission: order.totalAmt, // Full amount since commission is 100%
            status: order.order_status === 'DELIVERED' ? 'Paid' : 'Pending'
        }));

        return response.json({
            message: "Commission data retrieved successfully",
            error: false,
            success: true,
            data: {
                commission: {
                    total: totalEarnings,
                    thisMonth: thisMonthEarnings,
                    pending: pendingEarnings,
                    rate: 100 // 100%
                },
                history
            }
        });

    } catch (error) {
        console.error("Commission data error:", error);
        return response.status(500).json({
            message: error.message || "Failed to fetch commission data",
            error: true,
            success: false
        });
    }
};

