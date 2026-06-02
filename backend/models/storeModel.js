import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        enum:["grocery","pharmacy","restaurant","other"],
        default:"other"

    },
    address:{
        type:String,
        required:true
    },
    location:{
        latitude:{
            type:Number,
            required:true
        },
        longitude:{
            type:Number,
            required:true
        }
    },
    isOpen:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const Store = mongoose.model("Store",storeSchema)

export default Store