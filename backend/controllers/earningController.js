import User from "../models/userModel.js"
import Order from "../models/orderModel.js"
import Earning from "../models/earningModel.js"

// Get logged-in delivery boy earnings
export const getMyEarnings = async (req, res) => {
    try {
        const deliveryBoy = await User.findById(req.userId).select("-password")

        if (!deliveryBoy) {
            return res.status(404).json({ message: "Delivery boy not found" })
        }

        if (deliveryBoy.role !== "deliveryBoy") {
            return res.status(403).json({ message: "Access denied. Delivery boy only" })
        }

        const earnings = await Earning.find({ deliveryBoy: req.userId })
            .populate("order")
            .sort({ createdAt: -1 })

        const totalEarnings = earnings.reduce((total, earning) => {
            return total + earning.amount
        }, 0)

        const paidEarnings = earnings
            .filter((earning) => earning.status === "paid")
            .reduce((total, earning) => {
                return total + earning.amount
            }, 0)

        const pendingEarnings = earnings
            .filter((earning) => earning.status === "pending")
            .reduce((total, earning) => {
                return total + earning.amount
            }, 0)

        const totalDeliveries = await Order.countDocuments({
            deliveryBoy: req.userId,
            status: "delivered"
        })

        return res.status(200).json({
            totalEarnings,
            paidEarnings,
            pendingEarnings,
            totalDeliveries,
            earnings
        })
    } catch (error) {
        return res.status(500).json({ message: "getMyEarnings error", error })
    }
}

// Get earnings of all delivery boys
export const getAllEarnings = async (req, res) => {
    try {
        const earnings = await Earning.find()
            .populate("deliveryBoy", "fullName email mobile")
            .populate("order")
            .sort({ createdAt: -1 })

        const totalEarnings = earnings.reduce((total, earning) => {
            return total + earning.amount
        }, 0)

        const paidEarnings = earnings
            .filter((earning) => earning.status === "paid")
            .reduce((total, earning) => {
                return total + earning.amount
            }, 0)

        const pendingEarnings = earnings
            .filter((earning) => earning.status === "pending")
            .reduce((total, earning) => {
                return total + earning.amount
            }, 0)

        return res.status(200).json({
            totalEarnings,
            paidEarnings,
            pendingEarnings,
            count: earnings.length,
            earnings
        })
    } catch (error) {
        return res.status(500).json({ message: "getAllEarnings error", error })
    }
}

// Get earnings by delivery boy id
export const getEarningsByDeliveryBoy = async (req, res) => {
    try {
        const { deliveryBoyId } = req.params

        const deliveryBoy = await User.findById(deliveryBoyId).select("-password")

        if (!deliveryBoy) {
            return res.status(404).json({ message: "Delivery boy not found" })
        }

        if (deliveryBoy.role !== "deliveryBoy") {
            return res.status(400).json({ message: "Selected user is not a delivery boy" })
        }

        const earnings = await Earning.find({ deliveryBoy: deliveryBoyId })
            .populate("order")
            .sort({ createdAt: -1 })

        const totalEarnings = earnings.reduce((total, earning) => {
            return total + earning.amount
        }, 0)

        const paidEarnings = earnings
            .filter((earning) => earning.status === "paid")
            .reduce((total, earning) => {
                return total + earning.amount
            }, 0)

        const pendingEarnings = earnings
            .filter((earning) => earning.status === "pending")
            .reduce((total, earning) => {
                return total + earning.amount
            }, 0)

        const totalDeliveries = await Order.countDocuments({
            deliveryBoy: deliveryBoyId,
            status: "delivered"
        })

        return res.status(200).json({
            deliveryBoy,
            totalEarnings,
            paidEarnings,
            pendingEarnings,
            totalDeliveries,
            earnings
        })
    } catch (error) {
        return res.status(500).json({ message: "getEarningsByDeliveryBoy error", error })
    }
}

// Mark earning as paid
export const markEarningAsPaid = async (req, res) => {
    try {
        const { earningId } = req.params

        const earning = await Earning.findById(earningId)

        if (!earning) {
            return res.status(404).json({ message: "Earning record not found" })
        }

        earning.status = "paid"
        earning.paidAt = new Date()

        await earning.save()

        return res.status(200).json({
            message: "Earning marked as paid successfully",
            earning
        })
    } catch (error) {
        return res.status(500).json({ message: "markEarningAsPaid error", error })
    }
}

// Get today's earnings for logged-in delivery boy
export const getTodayEarnings = async (req, res) => {
    try {
        const deliveryBoy = await User.findById(req.userId)

        if (!deliveryBoy || deliveryBoy.role !== "deliveryBoy") {
            return res.status(403).json({ message: "Access denied. Delivery boy only" })
        }

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const earnings = await Earning.find({
            deliveryBoy: req.userId,
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate("order")

        const todayEarnings = earnings.reduce((total, earning) => {
            return total + earning.amount
        }, 0)

        return res.status(200).json({
            todayEarnings,
            count: earnings.length,
            earnings
        })
    } catch (error) {
        return res.status(500).json({ message: "getTodayEarnings error", error })
    }
}