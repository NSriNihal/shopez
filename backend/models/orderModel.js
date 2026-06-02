import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        default:1
    },
    price:{
        type:Number,
        required:true
    }
},{_id:false})

const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    store:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Store",
        required:true
    },
    deliveryBoy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    items:[orderItemSchema],
    deliveryAddress:{
        type:String,
        required:true
    },
    deliveryLocation:{
        latitude:{
            type:Number,
            required:true
        },
        longitude:{
            type:Number,
            required:true
        }
    },
    totalAmount:{
        type:Number,
        required:true
    },
    deliveryCharge:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:["pending", "accepted", "assigned", "dispatched", "delivered", "cancelled"],
        default:"pending"
    },
    dispatchedAt:{
        type:Date
    },
    deliveredAt:{
        type:Date
    }
},{timestamps:true})
const Order = mongoose.model("Order", orderSchema)

export default Order