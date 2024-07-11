const mongoose = require('mongoose');
const User = require('../models/userModel');
const Counter = require('../models/counterModel');
const Product = require('../models/productModel');
const Coupon = require('./couponModel');
const { ObjectId } = require('mongodb');

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String
        // Consider adding validation for phone number format
    },
    address: {
        type: String,
        required: true
    },
    locality: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
        // Consider adding validation for pincode format
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    addressType: {
        type: String,
        enum: ['HOME', 'WORK', 'OTHER'] // Consider adding 'OTHER' as an option
    },
});

const productSchema = new mongoose.Schema({
    productId: {
        type: ObjectId,
        ref: Product,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: [
            "pending",
            "Order Confirmed",
            "Order Shipped",
            "Order Delivered",
            "Order Rejected",
            "canceled",
            "Return Requested",
            "Return Approved",
            "Return Rejected",
            "Returned",
        ],
        default: 'pending'
    },
});

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: addressSchema,
    deliveryDate: {
        type: Date,
        default: () => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 7); // Set to 7 days from now
            return currentDate;
        }
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    products: [productSchema],
    paymentMethod: {
        type: String,
        required: true,
        enum: ["COD", "razorPay", "myWallet"],
    },
    coupon : {
        type : mongoose.Schema.Types.ObjectId,
        ref : Coupon
    },
    couponDiscount : {
        type : Number
    },
    discount : {
        type : Number
    },
    status : {
        type : String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });   

// Order ID generation
OrderSchema.pre("save", async function (next) {
    if (!this.isNew) {
        return next();
    }

    try {
        const counter = await Counter.findOneAndUpdate(
            { model: "Order", field: "orderId" },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        this.orderId = counter.count + 1000; // Start from 1001

        return next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('Order', OrderSchema);