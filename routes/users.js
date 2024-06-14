const router = require('express').Router();
const userController = require('../controller/userController');
const userAuth = require('../middleware/userAuth');


// home page
router.get('/',userAuth.blockUser,userController.homepage);


// user login and signup
router.get('/login',userAuth.userExist,userController.login);
router.get('/loginandsignup',userAuth.userExist,userController.signup);


// otp routes
router.post('/signup',userController.generateAndSendOtp);
router.get('/verify-otp', userController.renderVerifyOtpPage);
router.post('/verify-otp',userController.verifyOTP);
router.post('/loginAccess',userAuth.blockUser,userController.loginUser)
router.get('/resend-otp', userController.resendOTP);
  
// router.post('/forgot-password',)

// product route
router.get('/products',userAuth.blockUser,userController.productPage);
router.get('/products/:id',userAuth.blockUser,userController.productDetails);


// forgotpassword
// router.get('/forgotPassword')
// GET cart page 
// router.get('/cart',cartController.cartPage);


router.get('/logout', userController.logout);


module.exports = router;
