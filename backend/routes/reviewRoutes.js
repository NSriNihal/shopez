import express from "express"
import { submitReview, getProductReviews } from "../controllers/reviewController.js"
import isAuth from "../middlewares/isAuth.js"

const reviewRouter = express.Router()

reviewRouter.post("/", isAuth, submitReview)
reviewRouter.get("/product/:productId", getProductReviews)

export default reviewRouter
