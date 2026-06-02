import express from "express"
import {
    updateLocation,
    trackOrder,
    getOrderLocationHistory,
    getAvailableDeliveryBoysLocation
} from "../controllers/trackingController.js"

import isAuth from "../middlewares/isAuth.js"

const trackingRouter = express.Router()

trackingRouter.put("/location", isAuth, updateLocation)
trackingRouter.get("/available-delivery-boys", isAuth, getAvailableDeliveryBoysLocation)
trackingRouter.get("/order/:orderId", isAuth, trackOrder)
trackingRouter.get("/order/:orderId/history", isAuth, getOrderLocationHistory)

export default trackingRouter