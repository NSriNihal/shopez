import mongoose from "mongoose"

const dispatchSchema = new mongoose.Schema({
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    deliveryBoy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    pickupLocation:{
        latitude:{
            type:Number,
            required:true
        },
        longitude:{
            type:Number,
            required:true
        }
    },
    dropLocation:{
        latitude:{
            type:Number,
            required:true
        },
        longitude:{
            type:Number,
            required:true
        }
    },
    distanceInKm:{
        type:Number,
        default:0
    },
    status: {
        type: String,
        enum: ["assigned", "picked", "dispatched", "delivered", "cancelled"],
        default: "assigned"
    }
},{timestamp:true})

const Dispatch = mongoose.model("Dispatch", dispatchSchema)

export default Dispatch