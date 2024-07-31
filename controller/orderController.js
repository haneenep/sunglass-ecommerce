const uuid = require('uuid');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Wallet = require('../models/walletModel');
const Returns = require('../models/returnModel');
const Address = require('../models/addressModel');
const Products = require('../models/productModel');
const {generateInvoice} = require('../utils/invoiceGen');


const razorpayInstance = new Razorpay({
    key_id : process.env.KEY_ID,
    key_secret : process.env.KEY_SECRET
})

module.exports = {
   checkOutGet : async (req,res) => {

        try {

            const user = req.session.user
            const userId = user._id;

            const [wallet, userAddress, cart] = await Promise.all([
                Wallet.findOne({ user : userId }),
                Address.findOne({ userId }),
                Cart.findOne({ userId }).populate(
                    {
                        path : 'products.productid',
                        model : Products
                    }
                )
            ])

            if(!cart || cart.products.length == 0){
                res.render('user/emptyCart');
            }

            cart.subTotal = 0;
            cart.discount = 0;
            cart.total = 0;

            for(let item of cart.products){
                const product = item.productid;
                let itemOriginalPrice = product.price * item.quantity;
                let itemDiscount = 0;

                if(product.inCategoryOffer){
                    itemDiscount = (product.price - product.discountedPrice) * item.quantity;
                }else if(product.discountAmount > 0){
                    itemDiscount = product.discountAmount * item.quantity;
                }

                cart.subTotal += itemOriginalPrice;
                cart.discount += itemDiscount;

            }

            cart.total = cart.subTotal - cart.discount;

            cart.subTotal = Number(cart.subTotal.toFixed(2));
            cart.discount = Number(cart.discount.toFixed(2));
            cart.total = Number(cart.total.toFixed(2));

            let couponDiscount = 0;
            let finalTotal = cart.total;

            if (req.session.appliedCoupon) {
                couponDiscount = req.session.appliedCoupon.discountAmount;
                finalTotal = Number((cart.total - couponDiscount).toFixed(2));
            }

            const coupons = await Coupon.find(
                {minPurchaseAmount : {$lte : cart.total}}
            )

            console.log(cart,"jljljlj");

            if(!cart || cart.products.length == 0){
                res.render('user/emptyCart');
            }else{
                res.render('user/checkout',{
                    user,
                    addresses : userAddress?.address ,
                    cart,
                    coupons,
                    couponDiscount,
                    finalTotal,
                    appliedCoupon : req.session.appliedCoupon,
                    razorpayKeyId : process.env.KEY_ID,
                    wallet
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
            
            let addressData;

            if(data.selectedAddressId){
                let userAddress = await Address.findOne({userId})

                addressData = userAddress.address.find(addr => addr._id.toString() === data.selectedAddressId);

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
                    return res.status(404).json({ message: "Incomplete address details.", success: false });
                }

                await Address.findOneAndUpdate(
                    {userId},
                    { $push : {address : addressData}},
                    {upsert : true}
                );
            }else{
                return res.status(404).json({ message: "Address is not provided.", success: false });
            }

            if (!data.paymentMethod) {
                return res.status(404).json({ message: "Payment method is not selected.", success: false});
            }

            const cart = await Cart.findOne({userId}).populate('products.productid')

            let products = cart.products.map((item) => (
                {
                    productId : item.productid,
                    quantity : item.quantity,
                    price : item.price,
                    totalPrice : item.quantity * item.price
                }
            ))

        let totalAmount = cart.total;
        let discount = cart.discount;

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

            if(data.paymentMethod === 'razorpay'){
                const options = {
                    amount : totalAmount * 100,
                    currency : "INR",
                    receipt : `order_rcptid_${Date.now()}`
                };

                const orderResponse = await razorpayInstance.orders.create(options);

                res.json({ 
                    success: true,
                    razorpayOrderId: orderResponse.id,
                    amount: options.amount,
                    currency: options.currency,
                    key: process.env.KEY_ID,
                    products: products,
                    address: addressData,
                    coupon: appliedCoupon,
                    couponDiscount: couponDiscount,
                    discount : discount
                });
            }else if(data.paymentMethod === 'COD'){

                if(totalAmount > 1000){
                    return res.status(400).json({message : "above 1000 should'nt be allowed for COD ",success : false});
                }

                    const order = new Order({
                        userId: userId,
                        products: products,
                        address: addressData,
                        paymentMethod: 'COD',
                        totalAmount,
                        discount,
                        coupon: appliedCoupon,
                        couponDiscount,
                        status: 'Order Confirmed',
                        paymentStatus: 'pending'
                    });
                    
                    const savedOrder = await order.save();
                
                
                    for (const item of cart.products) {
                        await Products.findByIdAndUpdate(
                            item.productid,
                            { $inc: {stockQuantity: -item.quantity} },
                            { new: true }
                        );
                    }

                    await Cart.deleteOne({userId : userId})

                    delete req.session.appliedCoupon;

                    res.json({ success: true, orderId: savedOrder._id });
                }else if(data.paymentMethod === 'wallet'){
                    const wallet = await Wallet.findOne({user : userId});

                    if(!wallet){
                        res.status(404).json({message : "Insufficient balance in wallet",success : false})
                    }else{

                        if(wallet.balance >= totalAmount){
                            await Wallet.findByIdAndUpdate(
                                wallet._id,
                                {$inc : {balance : -totalAmount},
                                $push : {
                                    transactions : {
                                        transaction_id : `myWallet${uuid.v4()}`,
                                        amount : totalAmount,
                                        type : 'debit',
                                        description : 'Product Ordered'
                                    }
                                }
                            }
                        );

                            const order = new Order({
                                userId : userId,
                                products : products,
                                address : addressData,
                                paymentMethod : 'wallet',
                                totalAmount,
                                discount,
                                coupon : appliedCoupon,
                                couponDiscount,
                                status : 'Order Confirmed',
                                paymentStatus : 'Paid'
                            });

                            const saveOrder = await order.save();

                            for(const item of cart.products){
                                await Products.findByIdAndUpdate(
                                    item.productid,
                                    {$inc : {stockQuantity : -item.quantity}},
                                    {new : true}
                                );
                            }

                            await Cart.deleteOne({userId : userId});

                            delete req.session.appliedCoupon;

                            res.json({success : true , orderId : saveOrder._id });
                            
                        }else{
                            res.status(404).json({message : "Insufficient balance in wallet",success : false});
                        }
                    }

                } else {
                    res.status(400).json({success: false, message:"Invalid payment method"});
                }
            } catch (error) {
                console.error("Error while placing the order:", error);
                res.status(500).json({ message: "Your Order is Not Placed", success: false});
        }
    },

    createOrder : async (req,res) => {

        try{
            const userId = req.session.user._id;
            const {
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                products,
                address,
                coupon,
                couponDiscount,
                amount,
                discount,
                payment
            } = req.body;


            const sign = razorpayOrderId + "|" + razorpayPaymentId;

            const expectedSign = crypto.createHmac("sha256",process.env.KEY_SECRET)
                .update(sign.toString())
                .digest("hex");


                if(payment === true){

                    if(razorpaySignature !== expectedSign){
                        return res.status(404).json({success : false , message : "Invalid Signature"});
                    }

                    var order = new Order({
                        userId : userId,
                        products: products,
                        address: address,
                        paymentMethod: 'razorpay',
                        totalAmount: amount / 100,
                        discount : discount,
                        coupon: coupon,
                        couponDiscount: couponDiscount,
                        status: 'Order Confirmed',
                        paymentStatus: 'Paid',
                        paymentDetails: {
                            razorpayOrderId: razorpayOrderId,
                            razorpayPaymentId: razorpayPaymentId,
                            razorpaySignature: razorpaySignature
                        }
                    });
                }else{
                    var order = new Order({
                        userId : userId,
                        products : products,
                        address : address,
                        paymentMethod : 'razorpay',
                        totalAmount : amount / 100,
                        discount : discount,
                        coupon : coupon,
                        couponDiscount : couponDiscount,
                        status : 'Order Confirmed',
                        paymentStatus : 'failed',
                        paymentDetails : {
                            razorpayOrderId : razorpayOrderId
                        }
                    })
                }

                const savedOrder = await order.save();

                for(const item of products){
                    await Products.findByIdAndUpdate(
                        item.productid,
                        {$inc : {stockQuantity : -item.quantity}},
                        {new : true}
                    )
                }

                await Cart.deleteOne({userId : userId})

                delete req.session.appliedCoupon;

                res.status(200).json({ success: true, orderId: savedOrder._id, message: "Order created successfully" });
                
            } catch (error) {
                console.error("Error while creating the order", error);
                res.status(500).json({ success: false, message: "Something went wrong while creating the order" });
            }
    },

    initiateRepayment : async (req,res) => {

        try{

            const orderId = req.params.orderId;

            const order = await Order.findById(orderId);

            if(order.paymentStatus !== 'failed'){
                return res.status(404).json({message : "Cant initiate with this order" , success : false})
            }

            const options = {
                amount : order.totalAmount * 100,
                currency : 'INR',
                receipt : `order_rcptid_${Date.now()}`
            }

            const razorpayOrder = await razorpayInstance.orders.create(options);

            res.json({
                success : true,
                razorpayOrderId : razorpayOrder.id,
                amount : options.amount,
                currency : options.currency,
                key : process.env.KEY_ID,
                orderId : order._id
            })

        }catch(error){
            console.error("Error while repaymenting",error);
            res.status(500).json({message : "Error while repaymenting" , success : false})
        }
    },

    createRepayment : async (req,res) => {

        try{

            const userId = req.session.user._id;

            const {
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                orderId,
                payment
            } = req.body;

            const sign = razorpayOrderId + '|' + razorpayPaymentId;

            const expectedSign = crypto.createHmac("sha256", process.env.KEY_SECRET)
                .update(sign.toString())
                .digest('hex')

            if(payment === true){
                if(razorpaySignature !== expectedSign){
                    return res.status(404).json({success : false , message : 'order not found'});
                }

                let order;

                if(orderId){
                    order = await Order.findById(orderId);

                    order.paymentStatus = 'Paid';
                    order.paymentDetails = {
                        razorpayOrderId : razorpayOrderId,
                        razorpayPaymentId : razorpayPaymentId,
                        razorpaySignature : razorpaySignature
                    };
                }

                const saveOrder = await order.save();
                res.status(200).json({success : true , message : "Payment Successfull",orderId : saveOrder._id})
            }

        }catch(error){
            console.error("Error while creating the repayment",error);
            res.status(500).json({message : "Error while creating the payment",success : false})
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
                deliveredDate : order.deliveryDate,
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

            const userId = req.session.user;

            const {orderId,productId} = req.params;

            const order = await Order.findOne({ _id : orderId});
            const product = order.products.find( p => p._id.toString() === productId);

            await Order.updateOne(
                { _id : orderId , "products._id" : productId},
                {
                    $set : {
                        "products.$.status" : "canceled",
                        'status' : 'canceled'
                    }
            }
            )

            await Products.updateOne(
                {_id : product.productId},
                {$inc : {stockQuantity : product.quantity}}
            )

            if(order.paymentMethod !== 'COD'){

                const userExists = await Wallet.findOne({user : userId})

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
                        user : userId,
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

            res.status(200).json({success : true , message : "successfully canceled the order+"});

        } catch(error){
            console.error(error,"error while canceling the order");
            res.status(500).json({success : false , error : "some error while canceling the order"})
        }
    },

    getInvoices : async (req,res) => {

        try{

            const {orderId,index} = req.params;

            const orderDetails = await Order.findOne({ _id : orderId}).populate('products.productId')
            const deliveredProducts = orderDetails.products.filter(product => product.status === 'Order Delivered');
            
            console.log(deliveredProducts,"ddd");
            if(orderDetails){
                const invoice = await generateInvoice(orderDetails,index,deliveredProducts);
                res.json({ success : true , message : "Invoice generated Successfully",invoice});
            }else{
                res.status(500).json({success : false , message : 'Invoice generation Failed'});
            }
        }catch(error){
            console.error("Error while generating the invoice",error);
            res.status(500).json({success : false , message : 'Error in generating Invoice'});
        }
    },

    downloadInvoice : async (req,res) => {

        try{

            const id = req.params.orderId;

            const filePath = `public/infoPdf/${id}.pdf`;

            res.download(filePath,`invoice_${id}.pdf`);
                
        }catch(error){
            console.error("Error while downloading the invoice",error);
            res.status(500).json({success : false , message : 'Error in downloading Invoice'});
        }
    }
    
}
