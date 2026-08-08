const mongoose = require("mongoose")


    const messageSchema = new mongoose.Schema({
       
        from : {
            type:String,
            required:true
        },
        to : {
            type:String,
            required:true
        },
        message : {
            type:String,
            required:true
        },
        status : {
            type:String,
            enum:["pending", "in-transit", "delivered", "buffered"],
            default:"pending"
        },
        path:{
            type:Array,
            default:[]
        },
        createdAt : {
            type:Date,
            default:Date.now
        }
    })


    const messageModel = mongoose.model("message",messageSchema)

    module.exports = messageModel
