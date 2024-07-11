const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Products = require('../models/productModel')

module.exports = {

    couponGet : async (req,res) => {

        try {
            const coupon = await Coupon.find();

            if(!coupon){
                return res.status(404).json({message : "Cannot find the coupon"});
            }
    
            res.render('admin/coupons',{coupon});
        }catch(error){
            console.error("Error geting the coupon",error);
            return res.status(500).json({message : "Some Error while rendering the coupon"})
        }
    },

    addCoupon : async (req,res) => {

        try {

            const {
                couponName,
                couponCode,
                description,
                minPurchaseAmount,
                discountAmount,
                validFrom,
                validTo
            } = req.body;

            const existCoupon = await Coupon.findOne({ couponCode });

            if(existCoupon){
                return res.status(404).json({ message: "Coupon code already exists", success: false });
            }

            const newCoupon = await Coupon.create({
                couponName,
                couponCode,
                description,
                minPurchaseAmount,
                discountAmount,
                validFrom,
                validTo
            });

            res.status(200).json({ message : "coupon Added successfuly" ,success : true , coupon : newCoupon});
        } catch(error){
            console.error("Error while creating coupon",error);
            res.status(500).json({ message : "Error Adding coupon" , success : false});
        }
    },

    getCoupon : async (req,res) => {

        try {

            const couponId = req.params.id;

            const coupon = await Coupon.findById(couponId);

            if(!coupon){
                return res.status(404).json({ message : "Coupon not find",success : false})
            }

            res.status(200).json(coupon);

        }catch(error){
            console.error("Error while render the coupon",error);
            res.status(500).json({message : "Error showing coupon",success : false});
        }
    },

    editCouponGet : async (req,res) => {

        try {
            const couponId = req.params.id;

            const coupon = await Coupon.findById(couponId);
            console.log(coupon,"edit gettttt");

            if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.json({ success: true, coupon });

        } catch(error){
            console.error("Error while getting the edit coupon",error);
            res.status(500).json({message : "Not getting to edit the coupon" ,success : false});
        }
    },

    updateCoupon : async (req,res) => {

        try {
            const couponId = req.params.id;

            const {
                couponName,
                couponCode,
                description,
                minPurchaseAmount,
                discountAmount,
                validFrom,
                validTo
            } = req.body;


            const existingCoupon = await Coupon.findOne({ couponCode, _id: { $ne: couponId } });
            if (existingCoupon) {
                return res.status(404).json({ message: "Coupon code already exists", success: false });
            }


            const coupon = await Coupon.findByIdAndUpdate(
                couponId,
                {
                    couponName,
                    couponCode,
                    description,
                    minPurchaseAmount,
                    discountAmount,
                    validFrom,
                    validTo
                },
                {
                    new : true
                }
            )
            console.log(coupon,"updted successflully");

            if(!coupon){
                res.status(404).json({success : false , message : "Coupon Not Found"});
            }

            res.status(200).json({success : true ,message : "Successfully updated the coupon" ,coupon : coupon});


        } catch(error){
            console.error("Error while updating the coupon",error);
            res.status(500).json({message : "Coupon Not updated",success : false})
        }
    },

    deleteCoupon : async (req,res) => {

        try {
            const couponId = req.params.id

            const deleteCoupon = await Coupon.findByIdAndDelete(couponId);

            if(!deleteCoupon){
                return res.status(404).json({message : "Coupon Not found",success : false});
            }

            res.status(200).json({success : true , message : "Coupon Deleted Successfully"});
        }catch(error){
            res.status(500).json({success : false , message : "Some Error while deleting the error"});
            console.error("Error while deleting",error);
        }
    },

    applyingCoupon: async (req, res) => {
        const { couponCode } = req.body;
        const userId = req.session.user._id;
    
        try {
            const cart = await Cart.findOne({ userId }).populate({
                path: "products.productid",
                model: Products
            });

            if(req.session.appliedCoupon){
                return res.status(404).json({success : false,message : "A Coupon is allready applied"})
            }
    
            const totalPrice = cart.products.reduce((price, curr) => {
                return price + curr.price * curr.quantity;
            }, 0);
    
            const coupon = await Coupon.findOne({ couponCode });
    
            if (!coupon || coupon.minPurchaseAmount > totalPrice) {
                return res.json({ success: false, message: 'Invalid coupon or minimum purchase amount not met' });
            }
    
            const discountAmount = coupon.discountAmount;
            const newTotal = totalPrice - discountAmount;
    
            req.session.appliedCoupon = {
                couponCode,
                discountAmount,
                newTotal
            };
    
            res.json({ success: true, discountAmount, newTotal });
    
        } catch (error) {
            console.error('Error:', error);
            res.json({ success: false, message: 'An error occurred while applying the coupon' });
        }
    },
    

    removeCoupon: async (req, res) => {
        try {
            const userId = req.session.user;
            
            if (!req.session.appliedCoupon) {
                res.status(400).json({ success: false, message: "No coupon is currently applied" });
            }

            const cart = await Cart.findOne({userId}).populate('products.productid');
            
            if(!cart){
                res.status(404).json({success : false , message : "no cart found"});
            }
            const newTotal = cart.products.reduce((total, item) => {
                return total + (item.quantity * item.productid.price);
            }, 0);
            
    
            // Remove the applied coupon from the session
            delete req.session.appliedCoupon;
            
            res.status(200).json({
                 success: true,
                 newTotal : newTotal,
                 message: "Coupon removed successfully" 
                });
        } catch (error) {
            console.error("Error while removing the coupon", error);
            res.status(500).json({ message: "Error while removing the coupon" });
        }
    }
}