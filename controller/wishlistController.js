const User = require('../models/userModel');
const Product = require('../models/productModel');


module.exports = {

    getWishlist : (req,res) => {
        
        const user = req.session.user;

        res.render('user/wishlist',{user});
    }
}