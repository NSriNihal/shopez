import express from "express"
import {
    createOrder,
    getMyOrders,
    getSellerOrders,
    getAllOrders,
    getOrderById,
    acceptOrder,
    cancelOrder,
    getOrdersByStatus
} from "../controllers/orderController.js"

import isAuth, { isAdmin } from "../middlewares/isAuth.js"

const orderRouter = express.Router()

orderRouter.post("/", isAuth, createOrder)

orderRouter.get("/my", isAuth, getMyOrders)
orderRouter.get("/seller", isAuth, getSellerOrders)
orderRouter.get("/status/:status", isAuth, getOrdersByStatus)
orderRouter.get("/", isAdmin, getAllOrders)
orderRouter.get("/:orderId", isAuth, getOrderById)

orderRouter.put("/:orderId/accept", isAuth, acceptOrder)
orderRouter.put("/:orderId/cancel", isAuth, cancelOrder)

export default orderRouter