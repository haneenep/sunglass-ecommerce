const mongoose = require('mongoose');
const User = require('./userModel');
const { ObjectId } = require('mongodb');

const addressSchema = new mongoose.Schema({
    
    userId : {
        type : ObjectId,
        ref : User,
        required : true
    },
    address : [
        {
            name : {
                type : String,
                required : true
            },
            phoneNumber : {
                type : String
            },
            address : {
                type : String,
                required : true
            },
            locality : {
                type : String,
                required : true
            },
            pincode : {
                type : Number,
                required : true
            },
            city : {
                type : String,
                required : true
            },
            state : {
                type : String,
                required : true
            },
            addressType : {
                type : String,
                enum : ['home','work','other']
            }
        }
    ],
})

const Address = mongoose.model('address',addressSchema);

module.exports = Address;