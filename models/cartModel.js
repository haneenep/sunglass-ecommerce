const mongoose = require('mongoose');
const Coupon = require('./couponModel');
const Products = require('../models/productModel');

const cartSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId
        },
        products : [
            {
                productid : {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: Products
                },
                quantity : {
                    type : Number,
                },
                price : {
                    type : Number
                },
                discountAmount : {
                    type : Number
                }
            }
        ],
        subTotal : {
            type : Number,
            default : 0
        },
        total : {
            type : Number,
            default : 0
        },
        discount : {
            type : Number,
            default : 0
        }
    }
)

module.exports = mongoose.model('cart',cartSchema);