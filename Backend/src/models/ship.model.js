const mongoose = require("mongoose")

const shipSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
     x : {
        type: Number,
        required: true
     },
     y : {
        type: Number,
        required: true
     },

     speed : {
        type: Number,
        default : 0
     },
     status : {
        type: String,
        enum : ["idle" , "moving" , "stopped"],
        default : "idle"
     },
     heading : {
        type: Number,
        default : 0
     },
     buffer: {
        type: Array,
        default : []
       
     },
     
})

const shipModel = mongoose.model("ship", shipSchema)

module.exports = shipModel