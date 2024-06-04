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
    },
    googleId : {
        type : String,
    },
    profilePicture : {
        type : String,
    },
    createdAt : {
        type : Date,
        default : Date.now,
    }

})

const User = new mongoose.model("users",userSchema)

module.exports = User;