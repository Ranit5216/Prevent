import mongoose, { Mongoose } from "mongoose";

const orderSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : 'User'
    },
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9
    user_details: {
        name: String,
        email: String,
        mobile: String,
        avatar: String
    },
<<<<<<< HEAD
=======
=======
>>>>>>> 3dc8716a5f1b9afee4f3f4c58afce981c5e6691c
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9
    orderId : {
        type : String,
        required : [true, "Provide orderId"],
        unique : true
    },
    productId : {
        type : mongoose.Schema.ObjectId,
        ref : "product"
    },
    product_details : {
        name : String,
        image : Array,
    },
    paymentId : {
        type : String,
        default : ""
    },
    payment_status : {
        type : String,
        default : ""
    },
    delivery_address : {
        type : mongoose.Schema.ObjectId,
        ref : 'address'
    },
    subTotalAmt : {
        type : Number,
        default : 0
    },
    totalAmt : {
        type : Number,
        default : 0
    },
    invoice_receipt : {
        type : String,
        default : ""
    },
    order_status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'CANCELLED'],
        default: 'PENDING'
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9
    },
    admin_id: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: 'Admin'
    },
    admin_mobile: {
        type: String,
        default: ""
    },
    delivery_date: {
        type: Date,
        required: [true, "Delivery date is required"]
<<<<<<< HEAD
=======
=======
>>>>>>> 3dc8716a5f1b9afee4f3f4c58afce981c5e6691c
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9
    }
},{
    timestamps : true
})

const OrderModel = mongoose.model('order',orderSchema)

export default OrderModel