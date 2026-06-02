import User from "../models/userModel.js"
import Order from "../models/orderModel.js"
import Location from "../models/locationModel.js"

// Update delivery boy live location
export const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, orderId } = req.body

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude and longitude are required" })
        }

        const deliveryBoy = await User.findById(req.userId)

        if (!deliveryBoy) {
            return res.status(404).json({ message: "Delivery boy not found" })
        }

        if (deliveryBoy.role !== "deliveryBoy") {
            return res.status(403).json({ message: "Access denied. Delivery boy only" })
        }

        deliveryBoy.liveLocation = {
            latitude,
            longitude,
            updatedAt: new Date()
        }

        await deliveryBoy.save()

        await Location.create({
            deliveryBoy: req.userId,
            order: orderId || null,
            latitude,
            longitude
        })

        return res.status(200).json({
            message: "Location updated successfully",
            liveLocation: deliveryBoy.liveLocation
        })
    } catch (error) {
        return res.status(500).json({ message: "updateLocation error", error })
    }
}

// Track live order location
export const trackOrder = async (req, res) => {
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

        if (!order.deliveryBoy) {
            return res.status(400).json({ message: "Delivery boy not assigned yet" })
        }

        const loginUser = await User.findById(req.userId)

        const isCustomer = order.user._id.toString() === req.userId
        const isSeller = order.seller._id.toString() === req.userId
        const isDeliveryBoy = order.deliveryBoy._id.toString() === req.userId
        const isAdmin = loginUser.role === "admin"

        if (!isCustomer && !isSeller && !isDeliveryBoy && !isAdmin) {
            return res.status(403).json({ message: "You cannot track this order" })
        }

        return res.status(200).json({
            orderId: order._id,
            status: order.status,
            store: order.store,
            deliveryAddress: order.deliveryAddress,
            deliveryLocation: order.deliveryLocation,
            deliveryBoy: order.deliveryBoy,
            liveLocation: order.deliveryBoy.liveLocation,
            createdAt: order.createdAt,
            expectedDeliveryAt: new Date(order.createdAt.getTime() + 45 * 60000)
        })
    } catch (error) {
        return res.status(500).json({ message: "trackOrder error", error })
    }
}

// Get location history for an order
export const getOrderLocationHistory = async (req, res) => {
    try {
        const { orderId } = req.params

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        const loginUser = await User.findById(req.userId)

        const isCustomer = order.user.toString() === req.userId
        const isSeller = order.seller.toString() === req.userId
        const isDeliveryBoy = order.deliveryBoy && order.deliveryBoy.toString() === req.userId
        const isAdmin = loginUser.role === "admin"

        if (!isCustomer && !isSeller && !isDeliveryBoy && !isAdmin) {
            return res.status(403).json({ message: "You cannot view this location history" })
        }

        const locations = await Location.find({ order: orderId })
            .populate("deliveryBoy", "fullName mobile")
            .sort({ createdAt: 1 })

        return res.status(200).json({
            count: locations.length,
            locations
        })
    } catch (error) {
        return res.status(500).json({ message: "getOrderLocationHistory error", error })
    }
}

// Get nearest available delivery boys
export const getAvailableDeliveryBoysLocation = async (req, res) => {
    try {
        const deliveryBoys = await User.find({
            role: "deliveryBoy",
            isAvailable: true,
            "liveLocation.latitude": { $exists: true },
            "liveLocation.longitude": { $exists: true }
        }).select("-password")

        return res.status(200).json({
            count: deliveryBoys.length,
            deliveryBoys
        })
    } catch (error) {
        return res.status(500).json({ message: "getAvailableDeliveryBoysLocation error", error })
    }
}