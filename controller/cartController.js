const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

module.exports = {

    cartGet : async (req, res) => {
        try {
            const id = req.session.user;
            const user = req.session.user;

            const cart = await Cart.findOne({ userId: id._id }).populate('products.productid')

            if(cart && cart.products.length > 0){

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

                console.log('Cart data:', { subtotal: cart.subTotal, discount: cart.discount, total: cart.total });

                res.render('user/cart', {cart, user});

            } else {
                res.render('user/emptyCart', {user});
            }
            
        } catch (err){
            console.log(err, "cartError");
            res.render('500');
        }
    },

    addToCart : async (req, res) => {
        try {
            const userId = req.session.user._id;
            const { productId, quantity, price, discountAmount } = req.body;

            let cart = await Cart.findOne({ userId });

            if(!cart){
                cart = new Cart({ userId, products: []});
            }

            const existingProductIndex = cart.products.findIndex(
                (item) => item.productid.toString() === productId
            )

            if (existingProductIndex > -1) {
                cart.products[existingProductIndex].quantity += parseInt(quantity);
            } else {
                cart.products.push({
                    productid: productId,
                    quantity: parseInt(quantity),
                    price,
                    discountAmount
                });
            }
        
            cart.subTotal = 0;
            cart.discount = 0;
            cart.total = 0;
    
            for(let item of cart.products){
                const productDetails = await Product.findById(item.productid);
                let itemOriginalPrice = productDetails.price * item.quantity;
                let itemDiscount = 0;

                if (productDetails.inCategoryOffer === true) {
                    itemDiscount = (productDetails.price - productDetails.discountedPrice) * item.quantity;
                } else if (productDetails.discountAmount > 0) {
                    itemDiscount = productDetails.discountAmount * item.quantity;
                }

                cart.subTotal += itemOriginalPrice;
                cart.discount += itemDiscount; 

            }

            cart.total = cart.subTotal - cart.discount;
            
            cart.subTotal = Number(cart.subTotal.toFixed(2));
            cart.discount = Number(cart.discount.toFixed(2));
            cart.total = Number(cart.total.toFixed(2)); 

            await cart.save();

            res.json({
                success: true,
                message: 'Product added to cart',
                cartData: {
                    subTotal: cart.subTotal,
                    discount: cart.discount,
                    total: cart.total
                }
            });

        } catch (err) {
            console.log(err);
            res.redirect('500');
        }
    },

    updateCart : async (req, res) => {
        try {
            const user = req.session.user
            const userId = user._id;
            const { productId, quantity } = req.body;
    
            let cart = await Cart.findOne({ userId }).populate('products.productid');
    
            if (!cart) {
                return res.status(404).json({ success: false, message: "Cart not found" });
            }
    
            const productIndex = cart.products.findIndex(p => p.productid._id.toString() === productId);
    
            if (productIndex > -1) {

                const product = await Product.findById(productId);
                const maxQuantity = Math.min(10, product.stockQuantity);
    
                if (quantity > maxQuantity) {
                    return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
                }

                if (quantity < 1) {
                    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
                }
    
                cart.products[productIndex].quantity = parseInt(quantity);
    
            } else {
                return res.status(404).json({ success: false, message: "Product not found in the cart" });
            }
    
            cart.subTotal = 0;
            cart.discount = 0;
            cart.total = 0;

            for(let item of cart.products){
                const productDetails = await Product.findById(item.productid);
                let itemOriginalPrice = productDetails.price * item.quantity;
                let itemDiscount = 0;

                if (productDetails.inCategoryOffer) {
                    itemDiscount = (productDetails.price - productDetails.discountedPrice) * item.quantity;
                } else if (productDetails.discountAmount > 0) {
                    itemDiscount = productDetails.discountAmount * item.quantity;
                }

                cart.subTotal += itemOriginalPrice;
                cart.discount += itemDiscount;
            }

            cart.total = cart.subTotal - cart.discount;
    
            cart.subTotal = Number(cart.subTotal.toFixed(2));
            cart.discount = Number(cart.discount.toFixed(2));
            cart.total = Number(cart.total.toFixed(2));
    
            await cart.save();

            res.json({
                success: true,
                message: "Cart updated successfully",
                subtotal: cart.subTotal,
                discount: cart.discount,
                total: cart.total
            });
    
        } catch (error) {
            console.error('Error updating cart:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },
    

    removeFromCart : async (req, res) => {

        try {

            const userId = req.session.user._id;
            const productId = req.params.productId;
    
            let cart = await Cart.findOne({ userId });
    
            if (!cart) {
                return res.status(404).json({ success: false, message: "Cart not found" });
            }
    
            cart.products = cart.products.filter(item => item.productid.toString() !== productId);

            cart.subTotal = 0;
            cart.discount = 0;
            cart.total = 0;

            for(let item of cart.products){
                const productDetails = await Product.findById(item.productid);
                let itemOriginalPrice = productDetails.price * item.quantity;
                let itemDiscount = 0;

                if (productDetails.inCategoryOffer) {
                    itemDiscount = (productDetails.price - productDetails.discountedPrice) * item.quantity;
                } else if (productDetails.discountAmount > 0) {
                    itemDiscount = productDetails.discountAmount * item.quantity;
                }
    
                cart.subTotal += itemOriginalPrice;
                cart.discount += itemDiscount;
            }
    
            cart.total = cart.subTotal - cart.discount;
    
                cart.subTotal = Number(cart.subTotal.toFixed(2));
                cart.discount = Number(cart.discount.toFixed(2));
                cart.total = Number(cart.total.toFixed(2)); 
    
                await cart.save();
    
                return res.json({ 
                    success: true,
                    message : 'Product Removed from cart',
                    subtotal: cart.subTotal,
                    total: cart.total,
                    isEmpty: cart.products.length === 0
                });

        } catch (err) {

            console.error('Error removing from cart:', err);
            res.status(500).json({success: false, message: 'Internal server error' });

        }
    },

    emptyCart : (req,res) => {
        const user = req.session.user;
        res.render('user/emptyCart',{user})
    },
    
}


// 
