import express from "express"
import {
    getDeliveryBoyProfile,
    updateAvailability,
    updateLiveLocation,
    getAssignedOrders,
    updateDeliveryStatus,
    getDeliveryBoyEarnings
} from "../controllers/deliveryBoyController.js"

import isAuth from "../middlewares/isAuth.js"

const deliveryBoyRouter = express.Router()

deliveryBoyRouter.get("/profile", isAuth, getDeliveryBoyProfile)
deliveryBoyRouter.put("/availability", isAuth, updateAvailability)
deliveryBoyRouter.put("/location", isAuth, updateLiveLocation)
deliveryBoyRouter.get("/orders", isAuth, getAssignedOrders)
deliveryBoyRouter.put("/orders/:orderId/status", isAuth, updateDeliveryStatus)
deliveryBoyRouter.get("/earnings", isAuth, getDeliveryBoyEarnings)

export default deliveryBoyRouter