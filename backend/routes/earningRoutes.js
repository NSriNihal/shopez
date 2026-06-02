import express from "express"
import {
    getMyEarnings,
    getAllEarnings,
    getEarningsByDeliveryBoy,
    markEarningAsPaid,
    getTodayEarnings
} from "../controllers/earningController.js"

import isAuth, { isAdmin } from "../middlewares/isAuth.js"

const earningRouter = express.Router()

earningRouter.get("/my", isAuth, getMyEarnings)
earningRouter.get("/today", isAuth, getTodayEarnings)

earningRouter.get("/", isAdmin, getAllEarnings)
earningRouter.get("/delivery-boy/:deliveryBoyId", isAdmin, getEarningsByDeliveryBoy)
earningRouter.put("/:earningId/paid", isAdmin, markEarningAsPaid)

export default earningRouter