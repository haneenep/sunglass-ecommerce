const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({

    name : {
        type : String,
        required : true,
        unique : true
    },
    isActive : {
        type : Boolean,
        required : true
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
})

const brand = mongoose.model('brands',brandSchema);

module.exports = brand;