//import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import sendEmail from '../config/sendEmail.js';
import { sendWhatsApp } from '../utils/sendWhatsApp.js';

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

        const payload = await Promise.all(list_items.map(async el => {
            if (!el.productId || !el.productId._id) {
                throw new Error("Invalid product data")
            }

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
                payment_status: "CASH ON DELIVERY",
                delivery_address: addressId,
                subTotalAmt: subTotalAmt,
                totalAmt: totalAmt,
                admin_id: (await ProductModel.findById(el.productId._id)).admin_id,
                delivery_date: new Date(delivery_date)
            }
        }))

        const generatedOrder = await OrderModel.insertMany(payload)

        // Send email to admin for each order
        for (const order of generatedOrder) {
            try {
                // Fetch admin user
                const adminUser = await UserModel.findById(order.admin_id)
                if (adminUser && adminUser.email) {
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
                    await sendEmail({
                        sendTo: adminUser.email,
                        subject: emailSubject,
                        html: emailHtml
                    });
                }
                // WhatsApp notification to admin
                if (adminUser && adminUser.mobile) {
                    const whatsappMessage = `🛒 New Order Received!\nOrder ID: ${order.orderId}\nProduct: ${order.product_details.name}\nTotal: ₹${order.totalAmt}\nCustomer: ${order.user_details.name} (${order.user_details.mobile})`;
                    sendWhatsApp(adminUser.mobile, whatsappMessage);
                }
            } catch (emailError) {
                console.error('Failed to send order notification email or WhatsApp to admin:', emailError);
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
        const { orderId, status } = request.body
        const admin_id = request.userId

        // Get admin details to get mobile number
        const admin = await UserModel.findById(admin_id)
        if (!admin) {
            throw new Error("Admin not found")
        }

        const order = await OrderModel.findOneAndUpdate(
            { orderId, admin_id },
            { 
                order_status: status,
                admin_mobile: status === 'ACCEPTED' ? admin.mobile : ""
            },
            { new: true }
        )

        if (!order) {
            throw new Error("Order not found")
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