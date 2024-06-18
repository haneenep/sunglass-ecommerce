const Cart = require('../models/cartModel');

module.exports = {

    cartGet : async (req,res) => {

        try {

            const id = req.session.user;
            console.log(id,"cart");

            const cart = await Cart.findOne({ userId : id._id }).populate('products.productId');
            
            console.log(cart,"caaaaaaaaaaaart");
            res.render('user/cart' ,{cart});
        } catch(err){
            console.log(err,"cartError");
            res.render('500');
        }
    }

}