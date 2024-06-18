const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId
        },
        products : [
            {
                productid : {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "productDetails"
                },
                quantity : {
                    type : Number,
                },
                price : {
                    type : Number
                }
            }
        ]
    }
)

module.exports = mongoose.model('cart',cartSchema);