const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

module.exports = {

    cartGet : async (req, res) => {
        try {
            const id = req.session.user;
            const user = req.session.user;
            console.log(id, "cart");

            const cart = await Cart.findOne({ userId: id._id }).populate('products.productid')
            
            if(cart !== null && cart.products.length > 0){
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
            const { productId, quantity, price } = req.body;

            let cart = await Cart.findOne({ userId });

            if(!cart){
                cart = new Cart({ userId, products: []});
            }

            const productIndex = cart.products.findIndex(p => p.productid.toString() === productId);

            if (productIndex > -1) {
                cart.products[productIndex].quantity += parseInt(quantity);
            } else {
                cart.products.push({ productid: productId, quantity: parseInt(quantity), price });
            }

            await cart.save();
            res.json({ success: true, message: 'Product added to cart' });
        } catch (err) {
            console.log(err);
            res.redirect('500');
        }
    },

    updateCart : async (req,res) => {

        try {

            const userId = req.session.user._id;
            const { productId , quantity } = req.body;

            let cart = await Cart.findOne({ userId });

            if(!cart){
                return res.status(404).json({ success : false , message : "cart not fount" })
            }

            const productIndex = cart.products.findIndex(p => p.productid.toString() === productId);

            if(productIndex > -1){

                const product = await Product.findById(productId);
                const maxQuantity = Math.min(10,product.stockQuantity);

                if (quantity > maxQuantity) {
                    return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
                }

                cart.products[productIndex].quantity = Math.min(parseInt(quantity),maxQuantity);
            } else {
                return res.status(404).json({ success : false , message : "product not found in the cart" });
            }
            await cart.save()

            const updateCart = await Cart.findOne({ userId }).populate('products.productid');
            const subtotal  = updateCart.products.reduce((acc,item) => {
                return acc + (item.quantity * item.productid.price);
            },0);

            const total = subtotal;

            res.json({success : true , message : "cart updated successfully !!" , total : total.toFixed(2) , subtotal : subtotal.toFixed(2) });

        } catch(error){
            return res.render('500');
        }
    },

    removeFromCart : async (req,res) => {

        try {
            const userId = req.session.user._id;
            const productId = req.params.productId;

            console.log("Removing product:", productId);

            const result = await Cart.updateOne(
                {userId : userId},
                {$pull : {products : {productid : productId}}}
            );

            if(result.modifiedCount > 0){
                const updatedCart = await Cart.findOne({ userId }).populate('products.productid');
                const subtotal = updatedCart.products.reduce((acc,item) => {
                    return acc + (item.quantity * item.productid.price);
                },0);

                const total = subtotal;

                if(subtotal == 0){
                    return res.json({
                        success : true,
                        message : "Product Removed From the Bag",
                        subtotal : '0.00',
                        total : '0.00',
                        isEmpty : true
                    })
                }

                res.json({
                    success : true,
                    message : "Product Removed From the bag",
                    subtotal : subtotal.toFixed(2),
                    total : total.toFixed(2),
                    isEmpty : false
                });
            }else{
                res.status(404).json({ success : false , message : "Product not found in the cart"});
            }

        } catch(error){
            console.error(error,"err removing product");
            res.status(500).json({ success: false, message: "An error occurred while removing the product" });
        }
    }
}
