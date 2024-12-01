import mongoose, { Schema } from "mongoose";

const SalesModel = new mongoose.Schema({
    customerName: {
        type:String,
        required:true
    },
    customerMobile:{
        type:Number,
        required:true
    },
    productName:{
        type:String,
        required:true 
    },
    price:{
        type:Number,
        required:true 
    },
    quantity:{
        type:Number,
        required:true  
    },
    total:{
        type:Number,
        required:true  
    },
    Date:{
        type:Date,
    },
    user:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]


},{timestamps:true})
export const SalesSchema = mongoose.model("Sales",SalesModel)