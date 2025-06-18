//import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

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

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId, subTotalAmt, delivery_date } = request.body 

        if (!delivery_date) {
            return response.status(400).json({
                message: "Delivery date is required",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'inr',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        metadata : {
                            productId : item.productId._id
                        }
                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100   
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity 
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId,
                delivery_date: delivery_date
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json(session)

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
    delivery_date
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
                delivery_date: new Date(delivery_date)
            }

            productList.push(paylod)
        }
    }

    return productList
}

//http://localhost:8080/api/order/webhook
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
            delivery_date: session.metadata.delivery_date
        })
    
      const order = await OrderModel.insertMany(orderProduct)

        console.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
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