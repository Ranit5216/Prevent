//import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import sendEmail from '../config/sendEmail.js';

export async function CashOnDeliveryOrderController(request, response) {
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId, subTotalAmt, delivery_date } = request.body

        // Validate required fields
        if (!list_items || !Array.isArray(list_items) || list_items.length === 0) {
            return response.status(400).json({
                message: "No items in cart",
                error: true,
                success: false
            })
        }

        if (!addressId) {
            return response.status(400).json({
                message: "Delivery address is required",
                error: true,
                success: false
            })
        }

        if (!delivery_date) {
            return response.status(400).json({
                message: "Delivery date is required",
                error: true,
                success: false
            })
        }

        // Validate address exists
        const user = await UserModel.findById(userId)
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        // Check for duplicate orders within the last 30 seconds
        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
        const recentOrders = await OrderModel.find({
            userId: userId,
            createdAt: { $gte: thirtySecondsAgo },
            order_status: 'PENDING'
        })

        if (recentOrders.length > 0) {
            return response.status(429).json({
                message: "Order is already being processed. Please wait a moment.",
                error: true,
                success: false
            })
        }

        // Check for duplicate orders with same items and delivery date within last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const productIds = list_items.map(item => item.productId._id)
        
        const duplicateOrders = await OrderModel.find({
            userId: userId,
            productId: { $in: productIds },
            delivery_date: new Date(delivery_date),
            createdAt: { $gte: fiveMinutesAgo },
            order_status: 'PENDING'
        })

        if (duplicateOrders.length > 0) {
            return response.status(409).json({
                message: "Similar order already exists. Please check your order history.",
                error: true,
                success: false
            })
        }

        const payload = await Promise.all(list_items.map(async el => {
            if (!el.productId || !el.productId._id) {
                throw new Error("Invalid product data")
            }

            // Get product and admin details
            const product = await ProductModel.findById(el.productId._id)
            const adminUser = await UserModel.findById(product.admin_id)

            return {
                userId: userId,
                user_details: {
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    avatar: user.avatar
                },
                orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                productId: el.productId._id,
                product_details: {
                    name: el.productId.name,
                    image: el.productId.image
                },
                paymentId: "",
                payment_status: "CASH ON BOOKING",
                delivery_address: addressId,
                subTotalAmt: subTotalAmt,
                totalAmt: totalAmt,
                admin_id: product.admin_id,
                admin_mobile: adminUser ? adminUser.mobile : "",
                delivery_date: new Date(delivery_date)
            }
        }))

        const generatedOrder = await OrderModel.insertMany(payload)

        // Send email to admin for each order
        for (const order of generatedOrder) {
            try {
                // Fetch admin user
                const adminUser = await UserModel.findById(order.admin_id)
                
                // Compose professional email content
                const emailSubject = `🛒 New Order Received: ${order.product_details.name}`;
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
                        <div style="background: #0d6efd; color: #fff; padding: 20px 30px;">
                            <h1 style="margin: 0; font-size: 1.7rem;">New Order Notification</h1>
                        </div>
                        <div style="padding: 24px 30px; background: #fafbfc;">
                            <h2 style="margin-top: 0; color: #333;">Order Details</h2>
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
                                    <td style="padding: 8px 0;">${order.orderId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Product:</td>
                                    <td style="padding: 8px 0;">${order.product_details.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
                                    <td style="padding: 8px 0;">₹${order.totalAmt}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Delivery Date:</td>
                                    <td style="padding: 8px 0;">${order.delivery_date.toLocaleDateString()}</td>
                                </tr>
                            </table>
                            <h2 style="margin-bottom: 8px; color: #333;">Customer Information</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Name:</td>
                                    <td style="padding: 8px 0;">${order.user_details.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                                    <td style="padding: 8px 0;">${order.user_details.email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Mobile:</td>
                                    <td style="padding: 8px 0;">${order.user_details.mobile}</td>
                                </tr>
                            </table>
                            <div style="margin-top: 24px;">
                                <a href="https://preevent.in" style="display: inline-block; background: #0d6efd; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">View Order in Admin Panel</a>
                            </div>
                        </div>
                        <div style="background: #f1f1f1; color: #888; text-align: center; padding: 14px 0; font-size: 0.95rem;">
                            This is an automated notification from Prevent. Please do not reply to this email.
                        </div>
                    </div>
                `;
                
                // Send email to the specified admin email (tradeoxford123@gmail.com)
                await sendEmail({
                    sendTo: "tradeoxford123@gmail.com",
                    subject: emailSubject,
                    html: emailHtml
                });
                
                // Also send email to admin user if they have an email address
                if (adminUser && adminUser.email) {
                    await sendEmail({
                        sendTo: adminUser.email,
                        subject: emailSubject,
                        html: emailHtml
                    });
                    
                }
                
                // Send email to user with admin contact information
                if (order.admin_mobile) {
                    const userEmailSubject = `📦 Order Confirmed: ${order.product_details.name}`;
                    const userEmailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
                            <div style="background: #28a745; color: #fff; padding: 20px 30px;">
                                <h1 style="margin: 0; font-size: 1.7rem;">Order Confirmed!</h1>
                            </div>
                            <div style="padding: 24px 30px; background: #fafbfc;">
                                <h2 style="margin-top: 0; color: #333;">Thank you for your order!</h2>
                                <p style="color: #666; margin-bottom: 20px;">Your order has been successfully placed and is being processed.</p>
                                
                                <h3 style="margin-bottom: 8px; color: #333;">Order Details</h3>
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
                                        <td style="padding: 8px 0;">${order.orderId}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold;">Product:</td>
                                        <td style="padding: 8px 0;">${order.product_details.name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
                                        <td style="padding: 8px 0;">₹${order.totalAmt}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold;">Delivery Date:</td>
                                        <td style="padding: 8px 0;">${order.delivery_date.toLocaleDateString()}</td>
                                    </tr>
                                </table>
                                
                                <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 16px; margin: 16px 0;">
                                    <h4 style="margin: 0 0 8px 0; color: #0066cc;">📞 Contact Information</h4>
                                    <p style="margin: 0; color: #333;">For any questions about your order, please contact:</p>
                                    <p style="margin: 8px 0 0 0; font-weight: bold; color: #0066cc;">Admin Mobile: ${order.admin_mobile}</p>
                                </div>
                                
                                <div style="margin-top: 24px;">
                                    <a href="https://preevent.in" style="display: inline-block; background: #28a745; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">View Order Details</a>
                                </div>
                            </div>
                            <div style="background: #f1f1f1; color: #888; text-align: center; padding: 14px 0; font-size: 0.95rem;">
                                This is an automated notification from Prevent. Please do not reply to this email.
                            </div>
                        </div>
                    `;
                    
                    await sendEmail({
                        sendTo: order.user_details.email,
                        subject: userEmailSubject,
                        html: userEmailHtml
                    });
                }
                
            } catch (emailError) {
                console.error('Failed to send order notification email to admin:', emailError);
            }
        }

        // Remove from cart
        await CartProductModel.deleteMany({ userId: userId })
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] })

        return response.json({
            message: "Order placed successfully",
            error: false,
            success: true,
            data: generatedOrder
        })

    } catch (error) {
        console.error("Cash on delivery error:", error)
        return response.status(500).json({
            message: error.message || "Failed to place order",
            error: true,
            success: false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function getAllOrdersController(request, response) {
    const admin_id = request.userId
    try {
        const orders = await OrderModel.find({admin_id})
            .sort({ createdAt: -1 })
            .populate('delivery_address')
            .populate('userId', 'name email mobile')

        return response.json({
            message: "All orders retrieved successfully",
            data: orders,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function updateOrderStatusController(request, response) {
    try {
        const { orderId, status, cancellation_reason } = request.body
        const admin_id = request.userId

        // Get admin details to get mobile number
        const admin = await UserModel.findById(admin_id)
        if (!admin) {
            throw new Error("Admin not found")
        }

        // Validate cancellation reason if status is CANCELLED
        if (status === 'CANCELLED' && !cancellation_reason) {
            return response.status(400).json({
                message: "Cancellation reason is required when cancelling an order",
                error: true,
                success: false
            })
        }

        const updateData = { 
            order_status: status,
            admin_mobile: status === 'ACCEPTED' ? admin.mobile : ""
        }

        // Add cancellation reason if status is CANCELLED
        if (status === 'CANCELLED') {
            updateData.cancellation_reason = cancellation_reason
        }

        const order = await OrderModel.findOneAndUpdate(
            { orderId, admin_id },
            updateData,
            { new: true }
        )

        if (!order) {
            throw new Error("Order not found")
        }

        // Send email notification to user about order status update
        try {
            const statusText = status === 'ACCEPTED' ? 'Accepted' : status === 'CANCELLED' ? 'Cancelled' : status;
            const statusColor = status === 'ACCEPTED' ? '#28a745' : status === 'CANCELLED' ? '#dc3545' : '#ffc107';
            const statusIcon = status === 'ACCEPTED' ? '✅' : status === 'CANCELLED' ? '❌' : '⚠️';
            
            const emailSubject = `${statusIcon} Order ${statusText}: ${order.product_details.name}`;
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
                    <div style="background: ${statusColor}; color: #fff; padding: 20px 30px;">
                        <h1 style="margin: 0; font-size: 1.7rem;">Order ${statusText}</h1>
                    </div>
                    <div style="padding: 24px 30px; background: #fafbfc;">
                        <h2 style="margin-top: 0; color: #333;">Order Status Update</h2>
                        <p style="color: #666; margin-bottom: 20px;">Your Booking has been <strong>${statusText.toLowerCase()}</strong> by our admin team.</p>
                        
                        <h3 style="margin-bottom: 8px; color: #333;">Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
                                <td style="padding: 8px 0;">${order.orderId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Product:</td>
                                <td style="padding: 8px 0;">${order.product_details.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
                                <td style="padding: 8px 0;">₹${order.totalAmt}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                                <td style="padding: 8px 0; color: ${statusColor}; font-weight: bold;">${statusText.toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Updated On:</td>
                                <td style="padding: 8px 0;">${new Date().toLocaleDateString()}</td>
                            </tr>
                            ${status === 'CANCELLED' && order.cancellation_reason ? `
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Cancellation Reason:</td>
                                <td style="padding: 8px 0; color: #dc3545;">${order.cancellation_reason}</td>
                            </tr>
                            ` : ''}
                        </table>
                        
                        ${status === 'ACCEPTED' ? `
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 12px; margin: 16px 0;">
                            <p style="margin: 0; color: #155724;"><strong>Great news!</strong> Your Booking has been accepted and is being processed. You will receive further updates on your delivery.</p>
                        </div>
                        ` : status === 'CANCELLED' ? `
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 12px; margin: 16px 0;">
                            <p style="margin: 0; color: #721c24;"><strong>Order Cancelled:</strong> Your Booking has been cancelled. If you have any questions, please contact our support team.</p>
                            ${order.cancellation_reason ? `
                            <div style="margin-top: 8px; padding: 8px; background: #fff; border-radius: 4px; border-left: 3px solid #dc3545;">
                                <p style="margin: 0; color: #721c24;"><strong>Reason:</strong> ${order.cancellation_reason}</p>
                            </div>
                            ` : ''}
                        </div>
                        ` : ''}
                        
                        <div style="margin-top: 24px;">
                            <a href="https://preevent.in" style="display: inline-block; background: #0d6efd; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">View Booking Details</a>
                        </div>
                    </div>
                    <div style="background: #f1f1f1; color: #888; text-align: center; padding: 14px 0; font-size: 0.95rem;">
                        This is an automated notification from Prevent. Please do not reply to this email.
                    </div>
                </div>
            `;
            
            await sendEmail({
                sendTo: order.user_details.email,
                subject: emailSubject,
                html: emailHtml
            });
            
        } catch (emailError) {
            console.error('Failed to send order status update email to user:', emailError);
        }

        return response.json({
            message: "Order status updated successfully",
            data: order,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function cancelOrderController(request, response) {
    try {
        const userId = request.userId
        const { orderId } = request.body

        if (!orderId) {
            return response.status(400).json({
                message: "Order ID is required",
                error: true,
                success: false
            })
        }

        const order = await OrderModel.findOne({ orderId, userId })

        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            })
        }

        // Only allow cancellation if order is still pending
        if (order.order_status !== 'PENDING') {
            return response.status(400).json({
                message: "Cannot cancel order that is already accepted or cancelled",
                error: true,
                success: false
            })
        }

        // Update order status to cancelled
        order.order_status = 'CANCELLED'
        await order.save()

        return response.json({
            message: "Order cancelled successfully",
            data: order,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

