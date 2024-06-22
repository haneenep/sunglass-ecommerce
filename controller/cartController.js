const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

module.exports = {

    cartGet : async (req, res) => {
        try {
            const id = req.session.user;
            const user = req.session.user;
            console.log(id, "cart");

            const cart = await Cart.findOne({ userId: id._id }).populate('products.productid');
            
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
    }
}
