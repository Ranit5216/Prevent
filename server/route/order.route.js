import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, getOrderDetailsController, getAllOrdersController, updateOrderStatusController, cancelOrderController } from '../controllers/order.controller.js'
import { isAdmin } from '../middleware/isAdmin.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController)
orderRouter.get("/order-list", auth, getOrderDetailsController)
orderRouter.get("/my-orders", auth, getOrderDetailsController)
orderRouter.post("/cancel", auth, cancelOrderController)

// Admin routes
orderRouter.get("/admin/all-orders", auth, isAdmin, getAllOrdersController)
orderRouter.put("/admin/update-status", auth, isAdmin, updateOrderStatusController)

export default orderRouter