import express from "express"
import {
    assignDeliveryBoy,
    getAllDispatches,
    getDispatchById,
    getDispatchByOrder,
    updateDispatchStatus,
    getAvailableDeliveryBoys
} from "../controllers/dispatchController.js"

import isAuth from "../middlewares/isAuth.js"

const canManageDispatch = (req, res, next) => {
    if (["seller", "owner", "admin"].includes(req.userRole)) {
        return next()
    }

    return res.status(403).json({ message: "Access denied" })
}

const dispatchRouter = express.Router()

dispatchRouter.get("/", isAuth, canManageDispatch, getAllDispatches)
dispatchRouter.get("/available-delivery-boys", isAuth, canManageDispatch, getAvailableDeliveryBoys)
dispatchRouter.get("/order/:orderId", isAuth, canManageDispatch, getDispatchByOrder)
dispatchRouter.get("/:id", isAuth, canManageDispatch, getDispatchById)

dispatchRouter.post("/assign/:orderId", isAuth, canManageDispatch, assignDeliveryBoy)
dispatchRouter.put("/:id/status", isAuth, canManageDispatch, updateDispatchStatus)

export default dispatchRouter