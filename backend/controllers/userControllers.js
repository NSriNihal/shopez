import User from "../models/userModel.js"

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId

        if (!userId) {
            return res.status(400).json({ message: "userId not found" })
        }

        const user = await User.findById(userId).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: "getCurrentUser error", error })
    }
}

export const addAddress = async (req, res) => {
    try {
        const { label, address, latitude, longitude } = req.body

        if (!label || !address || !latitude || !longitude) {
            return res.status(400).json({ message: "All address fields are required" })
        }

        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        user.addresses.push({
            label,
            address,
            latitude,
            longitude
        })

        await user.save()

        return res.status(201).json({
            message: "Address added successfully",
            addresses: user.addresses
        })
    } catch (error) {
        return res.status(500).json({ message: "addAddress error", error })
    }
}

export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params

        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        user.addresses = user.addresses.filter((item) => {
            return item._id.toString() !== addressId
        })

        await user.save()

        return res.status(200).json({
            message: "Address deleted successfully",
            addresses: user.addresses
        })
    } catch (error) {
        return res.status(500).json({ message: "deleteAddress error", error })
    }
}