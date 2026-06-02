import express from "express"
import {
    getSellerProfile,
    createStore,
    getMyStore,
    updateMyStore,
    addProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
    getSellerOrders,
    getSellerDashboard
} from "../controllers/sellerController.js"

import isAuth from "../middlewares/isAuth.js"

const sellerRouter = express.Router()

sellerRouter.get("/profile", isAuth, getSellerProfile)

sellerRouter.post("/store", isAuth, createStore)
sellerRouter.get("/store", isAuth, getMyStore)
sellerRouter.put("/store", isAuth, updateMyStore)

sellerRouter.post("/products", isAuth, addProduct)
sellerRouter.get("/products", isAuth, getMyProducts)
sellerRouter.put("/products/:productId", isAuth, updateProduct)
sellerRouter.delete("/products/:productId", isAuth, deleteProduct)

sellerRouter.get("/orders", isAuth, getSellerOrders)
sellerRouter.get("/dashboard", isAuth, getSellerDashboard)

export default sellerRouter