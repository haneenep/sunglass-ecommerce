const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
        email : {
            type : String,
            unique : true
        },
        otp : {
            type : String,
            required : true
        },
        otpExpires: {
            type: Number, 
            required: true
        }
});

const OTP = mongoose.model('OTP',otpSchema)

module.exports = OTP