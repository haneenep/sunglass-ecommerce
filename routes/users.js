const router = require('express').Router();
const userAuth = require('../middleware/userAuth');
const userController = require('../controller/userController');
const cartController = require('../controller/cartController');
const forgotController = require('../controller/forgotController');


// home page
router.get('/',userAuth.blockUser,userController.homepage);


// user login and signup
router.get('/login',userAuth.userExist,userController.login);
router.get('/loginandsignup',userAuth.userExist,userController.signup);


// otp routes
router.post('/signup',userController.generateAndSendOtp);
router.get('/verify-otp', userController.renderVerifyOtpPage);
router.post('/verify-otp',userAuth.userExist,userController.verifyOTP);
router.post('/loginAccess',userAuth.blockUser,userController.loginUser)
router.get('/resend-otp', userController.resendOTP);
  

// product route
router.get('/products',userAuth.blockUser,userController.productPage);
router.get('/products/:id',userAuth.blockUser,userController.productDetails);


// forgotpassword geting
router.get('/forgotPassword',forgotController.forgot);
router.post('/forgot',forgotController.forgotPassword);
router.get('/otp-forgot',forgotController.forgotOtpren);
router.post('/otp-forgot',forgotController.forgotOtp);
router.post('/resetpass',forgotController.resetPassword);


// GET cart page 
router.get('/cart',userAuth.userCart,cartController.cartGet);
router.post('/addToCart',userAuth.userCart,cartController.addToCart);


router.get('/logout', userController.logout);


module.exports = router;
