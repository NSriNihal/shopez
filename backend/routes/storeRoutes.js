import express from "express"
import {
    getAllStores,
    getAllStoresAdmin,
    getStoreById,
    getStoreProducts,
    getStoresByCategory,
    searchStores,
    deleteStore
} from "../controllers/storeController.js"

import { isAdmin } from "../middlewares/isAuth.js"

const storeRouter = express.Router()

storeRouter.get("/", getAllStores)
storeRouter.get("/admin/all", isAdmin, getAllStoresAdmin)
storeRouter.get("/search", searchStores)
storeRouter.get("/category/:category", getStoresByCategory)
storeRouter.get("/:storeId/products", getStoreProducts)
storeRouter.get("/:storeId", getStoreById)

storeRouter.delete("/:storeId", isAdmin, deleteStore)

export default storeRouter