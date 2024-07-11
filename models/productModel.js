const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');

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
    brand : {
        type :  mongoose.Schema.Types.ObjectId,
        ref : Brand,
        requied : true
    },
    stockQuantity : {
        type : Number,
        required : true
    },
    status : {
        type : Boolean,
        default : true
    },
    discountAmount : {
        type : Number,
        default : 0
    },
    discountedPrice: {
        type: Number,
        default: function() {
          return this.price - this.discountAmount;
        }
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

    productSchema.pre('save', function(next) {
        this.discountedPrice = this.price - this.discountAmount;
        next();
    });

const product = mongoose.model('product',productSchema);

module.exports = product;