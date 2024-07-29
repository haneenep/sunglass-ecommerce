const User = require('../models/userModel');
const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');


module.exports = {

    getWishlist : async (req,res) => {
        
        try{
            const user = req.session.user
            const userId = user._id;

            const wishlist = await Wishlist.findOne({user : userId}).populate('items.product');

            if(!wishlist){
                return res.render('user/wishlist', { wishlist: [], user: req.session.user });
            } 
    
            res.render('user/wishlist',{wishlist : wishlist.items,user});

        }catch(error){
            console.error("Error while getting the wishlist",error);
            res.status(500).json({message : "Something wrong with getting wishlist"})
        }
    },

    addWishlist : async (req,res) => {

        try{
            const userId = req.session.user._id;
            const {productId} = req.body;

            const product = await Product.findById(productId);

            if(!product){
                return res.status(404).json({success : false ,message : "Product Not found"});
            }

            let wishlist = await Wishlist.findOne({user : userId});

            if(!wishlist){
                wishlist = new Wishlist({ user : userId , items : []});
            }

            const isProductInWishlist = wishlist.items.some(item => item.product.toString() === productId);

            if(isProductInWishlist){
                return res.status(200).json({ success: false, message: "Product is already in the wishlist" });
            }          

            wishlist.items.push({ product : productId});
            await wishlist.save();
            return res.status(200).json({success : true ,message : "Product Successfully added to the wishlist"});
            
        } catch(error){
            console.error("Error while adding to the wishlist",error);
            res.status(500).json({message : "something went wrong"});
        }
    },

    checkWishlistStatus : async (req, res) => {

        try {

          const userId = req.session.user._id;
          const productId = req.params.productId;

          const wishlist = await Wishlist.findOne({user:userId});

          const isInWishlist = wishlist ? wishlist.items.some(item => item.product.toString() === productId) : false;
          res.json({success: true,isInWishlist});

        } catch (error) {
          console.error("Error checking wishlist status", error);
          res.status(500).json({ success: false, message: "Something went wrong" });
        }
      },

      removeWishlist : async (req,res) => {

        try{

            const userId = req.session.user._id;
            const {productId} = req.params;

            const wishlist = await Wishlist.findOne({user : userId,});

            if(!wishlist){
                return res.status(404).json({success : false , message : "Product Not found in the wishlist"})
            }
            const updatedItems = wishlist.items.filter(item => item.product.toString() !== productId);

            if (wishlist.items.length === updatedItems.length) {
                return res.status(404).json({ success: false, message: "Product not found in wishlist" });
            }

            wishlist.items = updatedItems;
            await wishlist.save()

            res.status(200).json({success : true , message : "product removed from the wishlist"})
            
        } catch(error){
            console.error("Erroe while removing the product from wishlist",error);
            res.status(500).json({success : false ,message : "something went wrong while removing the product"})
        }

      }
}