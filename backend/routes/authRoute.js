import express from "express"
import { signIn, signOut, signUp, checkAuth } from "../controllers/authController.js"
import verifyToken from "../middlewares/verifyToken.js"

const authRouter = express.Router()

//signUp route

authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.post("/signout",signOut)
authRouter.get("/check", verifyToken, checkAuth)


export default authRouter