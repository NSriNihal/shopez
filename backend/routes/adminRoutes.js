import express from "express"
import {
    getAdminStats,
    getAllUsers,
    getAllOrders,
    getAllStores,
    getAllDeliveryPartners,
    updateUserRole,
    deleteUser
} from "../controllers/adminController.js"

import { isAdmin } from "../middlewares/isAuth.js"

const adminRouter = express.Router()

adminRouter.get("/stats", isAdmin, getAdminStats)

adminRouter.get("/users", isAdmin, getAllUsers)
adminRouter.put("/users/:id/role", isAdmin, updateUserRole)
adminRouter.delete("/users/:id", isAdmin, deleteUser)

adminRouter.get("/orders", isAdmin, getAllOrders)
adminRouter.get("/stores", isAdmin, getAllStores)
adminRouter.get("/delivery-partners", isAdmin, getAllDeliveryPartners)

export default adminRouter