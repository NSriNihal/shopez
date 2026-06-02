import express from "express"
import {
    getCurrentUser,
    addAddress,
    deleteAddress
} from "../controllers/userControllers.js"
import isAuth from "../middlewares/isAuth.js"

const userRouter = express.Router()

userRouter.get("/current", isAuth, getCurrentUser)
userRouter.post("/address", isAuth, addAddress)
userRouter.delete("/address/:addressId", isAuth, deleteAddress)

export default userRouter