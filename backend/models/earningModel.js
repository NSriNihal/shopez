import mongoose from "mongoose"

const earningSchema = new mongoose.Schema({
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    paidAt: {
        type: Date
    }
}, { timestamps: true })

const Earning = mongoose.model("Earning", earningSchema)

export default Earning