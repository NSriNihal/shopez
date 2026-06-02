import User from "../models/userModel.js"
import Store from "../models/storeModel.js"
import Order from "../models/orderModel.js"

// Create new order by user
export const createOrder = async (req, res) => {
    try {
        const {
            storeId,
            items,
            deliveryAddress,
            deliveryLocation,
            totalAmount,
            deliveryCharge
        } = req.body

        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (user.role !== "user") {
            return res.status(403).json({ message: "Only users can create orders" })
        }

        const store = await Store.findById(storeId)

        if (!store) {
            return res.status(404).json({ message: "Store not found" })
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order items are required" })
        }

        const order = await Order.create({
            user: req.userId,
            seller: store.seller,
            store: store._id,
            items,
            deliveryAddress,
            deliveryLocation,
            totalAmount,
            deliveryCharge: deliveryCharge || 0,
            status: "pending"
        })

        return res.status(201).json({
            message: "Order created successfully",
            order
        })
    } catch (error) {
        return res.status(500).json({ message: "createOrder error", error })
    }
}

// Get logged-in user's orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .populate("store", "name address location")
            .populate("seller", "fullName mobile")
            .populate("deliveryBoy", "fullName mobile liveLocation")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: orders.length,
            orders
        })
    } catch (error) {
        return res.status(500).json({ message: "getMyOrders error", error })
    }
}

// Get seller's store orders
export const getSellerOrders = async (req, res) => {
    try {
        const seller = await User.findById(req.userId)

        if (!seller || (seller.role !== "seller" && seller.role !== "owner")) {
            return res.status(403).json({ message: "Access denied. Seller only" })
        }

        const orders = await Order.find({ seller: req.userId })
            .populate("user", "fullName mobile email")
            .populate("store", "name address location")
            .populate("deliveryBoy", "fullName mobile liveLocation")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: orders.length,
            orders
        })
    } catch (error) {
        return res.status(500).json({ message: "getSellerOrders error", error })
    }
}

// Get all orders for admin
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "fullName mobile email")
            .populate("seller", "fullName mobile email")
            .populate("store", "name address location")
            .populate("deliveryBoy", "fullName mobile liveLocation")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: orders.length,
            orders
        })
    } catch (error) {
        return res.status(500).json({ message: "getAllOrders error", error })
    }
}

// Get single order by id
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params

        const order = await Order.findById(orderId)
            .populate("user", "fullName mobile email")
            .populate("seller", "fullName mobile email")
            .populate("store", "name address location")
            .populate("deliveryBoy", "fullName mobile liveLocation")

        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: "getOrderById error", error })
    }
}

// Seller accepts order
export const acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.params

        const seller = await User.findById(req.userId)

        if (!seller || (seller.role !== "seller" && seller.role !== "owner")) {
            return res.status(403).json({ message: "Access denied. Seller only" })
        }

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        if (order.seller.toString() !== req.userId) {
            return res.status(403).json({ message: "You can only accept your own store orders" })
        }

        if (order.status !== "pending") {
            return res.status(400).json({ message: "Only pending orders can be accepted" })
        }

        order.status = "accepted"
        await order.save()

        return res.status(200).json({
            message: "Order accepted successfully",
            order
        })
    } catch (error) {
        return res.status(500).json({ message: "acceptOrder error", error })
    }
}

// Seller cancels order
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params

        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        const isOwnerUser = order.user.toString() === req.userId
        const isSeller = order.seller.toString() === req.userId
        const isAdmin = user.role === "admin"

        if (!isOwnerUser && !isSeller && !isAdmin) {
            return res.status(403).json({ message: "You cannot cancel this order" })
        }

        if (order.status === "delivered") {
            return res.status(400).json({ message: "Delivered order cannot be cancelled" })
        }

        order.status = "cancelled"
        await order.save()

        return res.status(200).json({
            message: "Order cancelled successfully",
            order
        })
    } catch (error) {
        return res.status(500).json({ message: "cancelOrder error", error })
    }
}

// Get orders by status
export const getOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.params

        const allowedStatus = ["pending", "accepted", "assigned", "dispatched", "delivered", "cancelled"]

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid order status" })
        }

        const orders = await Order.find({ status })
            .populate("user", "fullName mobile email")
            .populate("seller", "fullName mobile email")
            .populate("store", "name address location")
            .populate("deliveryBoy", "fullName mobile liveLocation")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: orders.length,
            orders
        })
    } catch (error) {
        return res.status(500).json({ message: "getOrdersByStatus error", error })
    }
}