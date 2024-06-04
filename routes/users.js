const router = require('express').Router();
const userController = require('../controller/userController');
const cartController = require('../controller/cartController');
const productController = require('../controller/productController');
const userAuth = require('../middleware/userAuth');


// home page
router.get('/',userController.homepage);


// user login and signup
router.get('/login',userAuth.userExist,userController.login);
router.get('/loginandsignup',userController.signup);


// otp routes
router.post('/signup',userController.generateAndSendOtp)
router.post('/verify-otp',userController.verifyOTP);
router.get('/verify-otp', userController.renderVerifyOtpPage);
router.post('/loginAccess',userController.loginUser)
router.get('/resend-otp', userController.resendOTP);
  
router.post('/forgot-password',)
// GET cart page 
router.get('/cart',cartController.cartPage);



router.get('/logout', userController.logout);


module.exports = router;
