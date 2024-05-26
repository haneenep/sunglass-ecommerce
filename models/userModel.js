const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required : true,
    },
    email:{
        type:String,
        unique:true,
        required : true,
    },
    password:{
        type:String,
        required : true
    },
    otp : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now,
        expires : '3m'
    }

})

const User = new mongoose.model("users",userSchema)

module.exports = User;