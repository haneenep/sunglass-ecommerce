const mongoose = require('mongoose');
const Category = require('../models/categoryModel')

const productSchema = new mongoose.Schema({

    productName : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    images : {
        type : [String],
        required : true
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : Category,
        required : true
    },
    stockQuantity : {
        type : Number,
        required : true
    },
    status : {
        type : Boolean,
        default : true
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});


const product = mongoose.model('product',productSchema);

module.exports = product;