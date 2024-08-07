const router = require("express").Router();
const userAuth = require("../middleware/userAuth");
const userController = require("../controller/userController");
const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController");
const forgotController = require("../controller/forgotController");
const couponController = require("../controller/couponController");
const walletController = require('../controller/walletController');
const addressController = require("../controller/AddressController");
const wishlistController = require('../controller/wishlistController');

// home page
router.get("/", userAuth.blockUser, userController.homepage);

// user login and signup
router.get("/login", userAuth.userExist, userController.login);
router.get("/loginandsignup", userAuth.userExist, userController.signup);

// otp routes
router.post("/signup", userController.generateAndSendOtp);
router.get("/verify-otp", userController.renderVerifyOtpPage);
router.post("/verify-otp", userAuth.userExist, userController.verifyOTP);
router.post("/loginAccess", userAuth.blockUser, userController.loginUser);
router.get("/resend-otp", userController.resendOTP);

// product route
router.get("/products", userAuth.blockUser, userController.productPage);
router.get("/products/:id", userAuth.blockUser, userController.productDetails);

// forgotpassword geting
router.get("/forgotPassword", forgotController.forgot);
router.post("/forgot", forgotController.forgotPassword);
router.get("/otp-forgot", forgotController.forgotOtpren);
router.post("/otp-forgot", forgotController.forgotOtp);
router.post("/resetpass", forgotController.resetPassword);

// GET cart page
router.get("/cart", userAuth.userLogged, cartController.cartGet);
router.post("/addToCart", userAuth.userLogged, cartController.addToCart);
router.post("/updateCart", userAuth.userLogged, cartController.updateCart);
router.post("/removeFromCart/:productId",userAuth.userLogged,cartController.removeFromCart);
router.get("/emptyCart",userAuth.userLogged,cartController.emptyCart);

// userProfile
router.get("/userProfile",userAuth.userLogged,addressController.profileGet);
router.post("/updateName",userAuth.userLogged,addressController.updateUserName);
router.post("/updatePassword",userAuth.userLogged,addressController.updateUserPassword);
router.get("/shipAddress",userAuth.userLogged,addressController.addressGet);
router.post("/addAddress",userAuth.userLogged,addressController.addAddress);
router.put("/editAddress",userAuth.userLogged,addressController.editAddress);
router.delete("/deleteAddress/:id",addressController.deleteAddresses);

// checkOut
router.get("/checkOut",userAuth.userLogged,orderController.checkOutGet);

// placing order
router.post("/placeOrder",userAuth.userLogged,orderController.placeOrders);
router.get("/order-confirmation/:orderId",userAuth.userLogged,orderController.orderConfirmation);
router.post("/createOrder",userAuth.userLogged,orderController.createOrder);

// orders
router.get("/orders",userAuth.userLogged,orderController.orderGet);
router.get("/orderDetails/:id",userAuth.userLogged,orderController.orderDetails);
router.post('/return/:Oid/:Pid',orderController.returnReq);
router.post('/cancel-order/:orderId/:productId',orderController.cancelOrder);
router.post('/repayment/:orderId',orderController.initiateRepayment);
router.post('/create-repayment',orderController.createRepayment);

// coupons
router.post('/applycoupon',couponController.applyingCoupon);
router.post('/removecoupon',couponController.removeCoupon);

// wishlist
router.get('/wishlist',userAuth.userLogged,wishlistController.getWishlist);
router.post('/wishlist/add',userAuth.userLogged,wishlistController.addWishlist);
router.get('/wishlist/check/:productId',userAuth.userLogged,wishlistController.checkWishlistStatus);
router.delete('/wishlist/remove/:productId',userAuth.userLogged,wishlistController.removeWishlist);

// wallet
router.get('/wallet',userAuth.userLogged,walletController.walletGet);

// invoice
router.get('/generateInvoice/:orderId/:index',orderController.getInvoices);

// download invoice
router.get('/downloadInvoice/:orderId',orderController.downloadInvoice);

// contact
router.get('/contact',userController.contact);


router.get("/logout", userController.logout);

module.exports = router;
