const uuid = require('uuid');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Wallet = require('../models/walletModel');
const Returns = require('../models/returnModel');
const Product = require('../models/productModel');

module.exports = {

    orderManageGet : async (req,res) => {

        try {

            const orders = await Order.find({'paymentStatus' : {$in : [ 'pending' , 'Paid']}}).sort({createdAt : -1}).populate('products.productId');
            
            const ordersWithReturnData = await Promise.all(orders.map(async (order) => {
                const returnData = await Returns.find({ orderId: order._id });
                return {
                    ...order.toObject(),
                    returnData: returnData
                };
            }));

            res.render('admin/orderManagement',{orders : ordersWithReturnData});
        } catch(error){
            res.status(500).json({error : "Erro while fetching the order"});
        }
    },

    updateOrderStatus : async (req,res) => {

        try{

            const {id,productIndex ,status} = req.query;

            const orderr = await Order.findOne({_id : id});

            if(!orderr){
                return res.status(404).json({ err : "Order not found"});
            }

            if (productIndex < 0 || productIndex >= orderr.products.length) {
                return res.status(404).json({ err: "Invalid product index" });
            }
            
        orderr.products[productIndex].status = status;

        const allSameStatus = orderr.products.every(product => product.status === status);

        if (allSameStatus) {
            orderr.status = status;
        } else {
            orderr.status = 'Mixed';
        }

        if(orderr.paymentMethod === 'COD' && orderr.status === 'Order Delivered'){
            orderr.paymentStatus = 'Paid';
        }

        await orderr.save();

            res.status(200).json({ msg : "Order Status Updated"});

        } catch(error){
            console.error("Some error while changing the status",error);
        }
    },

    
    orderManageDetails : async (req,res) => {

        try {

            const orderId = req.params.id;
            const order = await Order.findOne({_id :orderId}).populate('products.productId')

            const returnData = await Returns.find({orderId : orderId}).lean();

            if (!order) {
                return res.render('404');
            }

            res.render('admin/orderDetails',{order ,returnData});

        } catch(error){
            console.error("Error while rendering orderDetail page",error);
            res.status(500).json({message : "Error while rendering orderDetail page"})
        }
    },

    updateReturnStatus : async (req,res) => {

        try {

            const {returnId , status} = req.body

            const updatedReturn = await Returns.findByIdAndUpdate(
                returnId,
                { status : status},
                {new : true}
            );
            
            const order = await Order.findById(updatedReturn.orderId);
            
            const product = order.products.find(p => p._id.equals(updatedReturn.productId));

            if (status === 'Return Approved') {

                await Product.updateOne(
                    {_id : updatedReturn.productId},
                    {$inc : {stockQuantity : product.quantity}}
                )

                if(order.paymentMethod !== 'COD'){

                    const userExists = await Wallet.findOne({user : order.userId})

                    if(userExists){
                        await Wallet.findByIdAndUpdate(userExists._id,{
                            $inc : {balance : product.totalPrice},
                            $push : {
                                transactions: {
                                    transaction_Id : `myWallet${uuid.v4()}`,
                                    amount : product.totalPrice,
                                    type : 'credit',
                                    description : 'Order Cancelled Refund',
                                    orderId : order._id,
                                    product : product._id
                                }
                            }
                        })
                    }else{
                        await Wallet.create({
                            user : order.userId,
                            balance : product.totalPrice,
                            transactions : {
                                transaction_Id : `myWallet${uuid.v4()}`,
                                amount : product.totalPrice,
                                type : 'credit',
                                description : 'Order Cancelled Refund',
                                orderId : order._id,
                                product : product._id
                            }
                        })
                    }
                }

                await Order.updateOne(
                    { _id: updatedReturn.orderId, 'products._id': updatedReturn.productId },
                    {
                        $set: { 'products.$.status': status },
                    }
                );

            } else if (status === 'Return Rejected') {
                await Order.updateOne(
                    { _id: updatedReturn.orderId, 'products._id': updatedReturn.productId },
                    {
                        $set: { 'products.$.status': status }
                    }
                );
            }

            res.json({ success: true, message: 'Return status updated successfully' });
            
        } catch(error){
            console.error("Error while changing the return status",error);
            res.render('404');
        }
    }

}