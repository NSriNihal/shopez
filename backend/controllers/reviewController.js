import Review from "../models/reviewModel.js"
import Product from "../models/productModel.js"
import Order from "../models/orderModel.js"

export const submitReview = async (req, res) => {
    try {
        const { productId, orderId, rating, comment } = req.body

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Valid rating between 1 and 5 is required" })
        }

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        if (order.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You can only review your own orders" })
        }

        if (order.status !== "delivered") {
            return res.status(400).json({ message: "Can only review delivered orders" })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        // Verify product was actually in the order
        const itemInOrder = order.items.find(
            (item) => item.product && item.product.toString() === productId
        )

        if (!itemInOrder) {
            return res.status(400).json({ message: "This product is not part of the specified order" })
        }

        const review = await Review.create({
            user: req.userId,
            product: productId,
            order: orderId,
            rating,
            comment
        })

        // Recalculate average rating for product
        const allReviews = await Review.find({ product: productId })
        const reviewCount = allReviews.length
        const sumRatings = allReviews.reduce((sum, rev) => sum + rev.rating, 0)
        const averageRating = sumRatings / reviewCount

        product.reviewCount = reviewCount
        product.averageRating = Math.round(averageRating * 10) / 10 // Round to 1 decimal place
        await product.save()

        return res.status(201).json({
            message: "Review submitted successfully",
            review
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already reviewed this product for this order" })
        }
        return res.status(500).json({ message: "submitReview error", error })
    }
}

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params

        const reviews = await Review.find({ product: productId })
            .populate("user", "fullName")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: reviews.length,
            reviews
        })
    } catch (error) {
        return res.status(500).json({ message: "getProductReviews error", error })
    }
}
