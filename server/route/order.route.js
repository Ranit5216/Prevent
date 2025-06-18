import { Router } from 'express'
import auth from '../middleware/auth.js'
<<<<<<< HEAD
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe, getAllOrdersController, updateOrderStatusController, cancelOrderController } from '../controllers/order.controller.js'
=======
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe, getAllOrdersController, updateOrderStatusController } from '../controllers/order.controller.js'
>>>>>>> 3dc8716a5f1b9afee4f3f4c58afce981c5e6691c
import { isAdmin } from '../middleware/isAdmin.js'

const orderRouter = Router()

<<<<<<< HEAD
orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController)
orderRouter.post('/checkout', auth, paymentController)
orderRouter.post('/webhook', webhookStripe)
orderRouter.get("/order-list", auth, getOrderDetailsController)
orderRouter.get("/my-orders", auth, getOrderDetailsController)
orderRouter.post("/cancel", auth, cancelOrderController)
=======
orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)
>>>>>>> 3dc8716a5f1b9afee4f3f4c58afce981c5e6691c

// Admin routes
orderRouter.get("/admin/all-orders", auth, isAdmin, getAllOrdersController)
orderRouter.put("/admin/update-status", auth, isAdmin, updateOrderStatusController)

export default orderRouter