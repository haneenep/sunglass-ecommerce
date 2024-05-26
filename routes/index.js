const router = require('express').Router();
const User = require('../models/userModel')
const cartController = require('../controller/cartController');
const productController = require('../controller/productController');
const userController = require('../controller/userController');
const otpController = require('../controller/otpController');

/* GET home page. */
router.get('/',userController.homepage);

router.get('/login',userController.login);

// login and signup page
router.get('/loginandsignup',userController.loginAndSignup);

// GET cart page 
router.get('/cart',cartController.cartPage);

// GET product page
router.get('/product',productController.productPage);

// register the user
router.post('/signup',userController.registerUser);

// to send otp
router.post('/send-otp',otpController.sendOtp);

// to render otp 
router.get('/otp',otpController.renderOtp);

// to verify otp
router.post('/verify-otp',otpController.verifyOtp);

// to resend otp
router.post('/resend-otp',otpController.resendOtp)


module.exports = router;
