const Order = require('../models/orderModel');
const Returns = require('../models/returnModel');
const Product = require('../models/productModel');

module.exports = {

    orderManageGet : async (req,res) => {

        try {

            const orders = await Order.find().sort({createdAt : -1}).populate('products.productId');
            
            const ordersWithReturnData = await Promise.all(orders.map(async (order) => {
                const returnData = await Returns.find({ orderId: order._id });
                return {
                    ...order.toObject(),
                    returnData: returnData
                };
            }));

            console.log(orders," order");
            console.log(ordersWithReturnData," order");

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
            
            console.log(orderr,"llllrrrr");

            // if(status === "Order Confirmed"){
            //     console.log('goooes hre');
            //     await Order.updateOne(
            //         { _id : id.trim()},
            //         {$set : {status : status.trim()}}
            //     )
            //     orderr.products.forEach(async (data, index) => {
            //         if(data.status !== "canceled"){
            //             await Order.updateOne(
            //                 { _id : id.trim()},
            //                 { $set : {[`products.${index}.status`]: 'Order Confirmed'}}
            //             )
            //         }
            //     });
            // }else if(status === "Order Shipped"){
            //     await Order.updateOne(
            //         { _id : id.trim()},
            //         {$set : {status : status.trim()}}
            //     )
            //     orderr.products.forEach(async (data, index) => {
            //         if(data.status !== "canceled"){
            //             await Order.updateOne(
            //                 { _id : id.trim()},
            //                 { $set : {[`products.${index}.status`]: "Order Shipped"}}
            //             )
            //         }
            //     });
            // } else if (status === "Order Delivered"){
            //     await Order.updateOne(
            //         { _id : id.trim()},
            //         {$set : {status : status.trim()}}
            //     )
            //     orderr.products.forEach(async (data, index) => {
            //         if(data.status !== "canceled"){
            //             await Order.updateOne(
            //                 { _id : id.trim()},
            //                 { $set : {[`products.${index}.status`]: "Order Delivered"}}
            //             )
            //         }
            //     });
            // }

        orderr.products[productIndex].status = status;

        const allSameStatus = orderr.products.every(product => product.status === status);

        if (allSameStatus) {
            orderr.status = status;
        } else {
            orderr.status = 'Mixed';
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
  
            console.log(returnData,"daaaataaa");
            console.log(order,"the order");

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

            console.log(updatedReturn,"ppppp");

            const order = await Order.findById(updatedReturn.orderId);

            const product = order.products.find(p => p._id.equals(updatedReturn.productId));

            if (status === 'Return Approved') {

                await Product.updateOne(
                    {_id : updatedReturn.productId},
                    {$inc : {stockQuantity : product.quantity}}
                )

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

            console.log("changed the order status");

            res.json({ success: true, message: 'Return status updated successfully' });
            
        } catch(error){
            console.error("Error while changing the return status",error);
            res.render('404');
        }
    }

}