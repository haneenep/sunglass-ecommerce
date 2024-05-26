const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
        email : {
            type : String,
     },
        otp : {
            type : String,
        }
    },{
        timestamps : true
})

const OTP = mongoose.model("OTP",otpSchema)
module.exports = OTP