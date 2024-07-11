const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Returns = require('../models/returnModel');
const Address = require('../models/addressModel');
const Products = require('../models/productModel');


module.exports = {
   checkOutGet : async (req,res) => {

        try {

            const user = req.session.user
            const userId = user._id;
            
            const userAddress = await Address.findOne({userId});
            const cart = await Cart.findOne({ userId }).populate(
            {
                path:"products.productid",
                model : Products
            })

            const totalPrice = cart.products.reduce((price,curr) => {
                return price + curr.price * curr.quantity
            },0);

            let discountAmount = 0;
            let newTotal = totalPrice;

            if(req.session.appliedCoupon){
                discountAmount = req.session.appliedCoupon.discountAmount;
                newTotal = req.session.appliedCoupon.newTotal;
            }

            const coupons = await Coupon.find(
                {minPurchaseAmount : {$lte : totalPrice}}
            )

            console.log(cart, "Cart data");
            console.log(coupons, "Available coupons");
            console.log(discountAmount, "Applied discount amount");

            if(!cart || cart.products.length == 0){
                res.render('user/emptyCart');
            }else{
                res.render('user/checkout',{
                    user,
                    addresses : userAddress?.address ,
                    cart,
                    coupons,
                    discountAmount,
                    newTotal,
                    appliedCoupon : req.session.appliedCoupon
                });
            }
            

        } catch(error){
            console.error("some error while rendering the checkout page",error);
            res.render('500');
        }
    },   
  

     placeOrders : async (req, res) => {
        try {
            const userId = req.session.user._id;
            const data = req.body;
            
            console.log(data, "Order Data");

            let addressData;

            if(data.selectedAddressId){
                let userAddress = await Address.findOne({userId})

                addressData = userAddress.address.find(addr => addr._id.toString() === data.selectedAddressId);

                console.log(addressData,"it si finded");

            }else if(data.address){

                const type = data.address.addressType.toUpperCase();

                addressData = {
                    name: data.address.name,
                    phoneNumber: data.address.phoneNumber,
                    address: data.address.address,
                    locality: data.address.locality,
                    city: data.address.city,
                    state: data.address.state,
                    pincode: data.address.pincode,
                    addressType: type
                };

                if (!addressData.name || !addressData.phoneNumber || !addressData.address || !addressData.locality || !addressData.city || !addressData.state || !addressData.pincode) {
                    return res.status(400).json({ message: "Incomplete address details.", success: false });
                }

                console.log(addressData,"is it finded");
                await Address.findOneAndUpdate(
                    {userId},
                    { $push : {address : addressData}},
                    {upsert : true}
                );
            }else{
                return res.status(400).json({ message: "Address is not provided.", success: false });
            }

            if (!data.paymentMethod) {
                return res.status(404).json({ message: "Payment method is not selected.", success: false });
            }

            const cart = await Cart.findOne({userId}).populate('products.productid')
            console.log(cart,"caaaaaaaaaarts");

            let products = cart.products.map((item) => 
                ({
                productId : item.productid,
                quantity : item.quantity,
                price : item.price,
                totalPrice : item.quantity * item.price
            }))

            let totalAmount = products.reduce((acc, product) => acc + product.totalPrice, 0)
            let couponDiscount = 0;
            let appliedCoupon = null;

            if(req.session.appliedCoupon){
                const coupon = await Coupon.findOne({ couponCode : req.session.appliedCoupon.couponCode })
                if(coupon && coupon.minPurchaseAmount <= totalAmount){
                    couponDiscount = Math.min(req.session.appliedCoupon.discountAmount, totalAmount);
                    totalAmount = totalAmount - couponDiscount;
                    appliedCoupon = coupon._id;
                }
            }
            const order = new Order ({
                userId : userId,
                products : products,
                address : addressData,
                paymentMethod : data.paymentMethod,
                totalAmount,
                coupon : appliedCoupon,
                couponDiscount,
            })

            const saveOrder = await order.save()

            for (const item of cart.products) {
                await Products.findByIdAndUpdate(
                    item.productid,
                    { $inc: {stockQuantity: -item.quantity} },
                    { new: true }
                );
            }

            await Cart.findOneAndUpdate({ userId }, { $set: { products: [] } });
            delete req.session.appliedCoupon;

            res.json({ success: true, orderId: saveOrder._id });
            
        } catch (error) {
            console.error("Error while placing the order:", error);
            res.status(400).json({ message: "Your Order is Not Placed" });
        }
    },

    orderConfirmation : (req,res) => {

        const orderId = req.params.orderId;
        res.render('user/orderSuccessfull',{orderId});
        
    },

    orderGet : async (req,res) => {

        try {
            const user = req.session.user;
            const userId = user._id
            const order = await Order.find({ userId }).sort({createdAt : -1})
            .populate('products.productId')
            
            res.render('user/order',{user,order});  
        } catch(error){
            console.error("some error while rendering the order detail page",error);
        }
    },

    orderDetails : async (req,res) => {

        try {
            
            const user = req.session.user;
            const userId = user._id;
            const orderId = req.params.id;
            const productId = req.query.productId;

            const order = await Order.findOne({_id : orderId}).populate('products.productId');

            if(!order){
                return res.render('400');
            }

            const selectedProductId = productId || order.products[0].productId._id.toString();

            const  selectedProduct = order.products.find(p => p.productId._id.toString() === selectedProductId);

            let subtotal = order.products.reduce((price,curr) => {
                return price + curr.price * curr.quantity
            },0);


            const otherItems = order.products
            .filter(p => p.productId._id.toString !== selectedProduct)
            .map(p => ({
                _id : p.productId._id,
                image : p.productId.images[0],
                name : p.productId.productName,
                brand : p.productId.brand || 'N/A',
                quantity : p.quantity,
                price : p.price,
            }))


            const orderDetails = {
                _id: order._id,
                orderId: order.orderId,
                createdAt: order.createdAt,     
                selectedProduct: {
                    ...selectedProduct.toObject(),
                    productId: selectedProduct.productId.toObject()
                },
                otherItems: otherItems,
                address: order.address,
                totalAmount: order.totalAmount,
                couponDiscount : order.couponDiscount,  
                subtotal : subtotal
                
            };


            console.log('order details ',orderDetails);
            res.render('user/orderDetails',{user,userId,order : orderDetails})
        } catch(error){
            console.error(error,"while getting the detailed page");
        }
    },

    returnReq : async (req,res) => {

        try {

            const userId = req.session.user;
            const orderId = req.params.Oid;
            const productId = req.params.Pid;
            const { reason , description } = req.body;

            const returnData = { userId,orderId,productId,reason,description };

            console.log(returnData,"rrrr");
            await Returns.create(returnData);

            await Order.updateOne(
                { _id: orderId, "products._id": productId },
                { $set: { "products.$.status": "Return Requested" } }
            )

            res.status(200).json({success : true , message: 'Successfully created Return request' });

        } catch (error){
            console.error("error",error);
            res.status(500).json({success : false , error: 'An error occurred while creating the return request' });
        }
    },

    cancelOrder : async (req,res) => {

        try{

            const {orderId,productId} = req.params;
            console.log(orderId, productId,"hereeeeeeeeeee is sssss")

            const order = await Order.findOne({ _id : orderId});
            const product = order.products.find( p => p._id.toString() === productId);

            await Order.updateOne(

                { _id : orderId , "products._id" : productId},
                {$set : {"products.$.status" : "canceled"}}
            )

            await Products.updateOne(
                {_id : product.productId},
                {$inc : {stockQuantity : product.quantity}}
            )

            res.status(200).json({success : true , message : "successfully canceled the order+"});

        } catch(error){
            console.error(error,"error while canceling the order");
            res.status(500).json({success : false , error : "some error while canceling the order"})
        }
    }
    
}