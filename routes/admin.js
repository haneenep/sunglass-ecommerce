    const router = require('express').Router();
    const upload = require('../config/multer');
    const brandController = require('../controller/brandController');
    const adminController = require('../controller/adminController');
    const offerController = require('../controller/offerController');
    const couponController = require('../controller/couponController');
    const productController = require('../controller/productController');
    const categoryController = require('../controller/categoryController');
    const dashboardController = require('../controller/dashboardController');
    const userManageController = require('../controller/userManageController');
    const orderMangementController = require('../controller/orderManageController');


    // middlewear
    const adminAuth = require('../middleware/adminAuth');


    // authenticate route
    router.get('/login', adminController.adminGet);
    router.post('/login',adminAuth.isAdminAuthenticated,adminController.adminPost);
    router.get('/logout',adminController.adminLogout);
    // dashboard
    router.get('/dashboard',adminAuth.ensureAdmin,dashboardController.adminDash);


    // display addProduct form
    router.get('/add-product',adminAuth.ensureAdmin,productController.productAddGet);
    // addProduct form submission
    router.post('/add-product',adminAuth.ensureAdmin,upload.array('images',6),productController.addProduct);
    // displaying all products
    router.get('/products',adminAuth.ensureAdmin,productController.getAllProducts);
    // edit rendering 
    router.get('/edit-product/:id',adminAuth.ensureAdmin,productController.editProductGet);
    // editing
    router.post('/edit-product/:id', upload.fields([{ name: 'newImages', maxCount: 10 }]), productController.editProduct);
    router.post('/crop-image', upload.single('croppedImage'), productController.cropImage);
    // delete product
    router.post('/delete-product/:id',adminAuth.ensureAdmin,productController.deleteProduct);


    // category 
    router.get('/categorys',adminAuth.ensureAdmin,categoryController.getAllCategory);
    // Render the add
    router.get('/add-categorys',adminAuth.ensureAdmin,categoryController.addCategoryGet);
    // adding 
    router.post('/add-categorys',adminAuth.ensureAdmin,categoryController.addCategory);
    // edit geting 
    router.get('/edit-categorys/:id',adminAuth.ensureAdmin,categoryController.editCategoryGet);
    // editing
    router.post('/categorys/edit',adminAuth.ensureAdmin,categoryController.editCategory);
    // deleting
    router.post('/categorys/delete',adminAuth.ensureAdmin,categoryController.deleteCategorys);


    // brands
    router.get('/brands',adminAuth.ensureAdmin,brandController.getAllBrands);
    // brand add getting
    router.get('/add-brands',adminAuth.ensureAdmin,brandController.addBrandGet);
    // brand adding
    router.post('/add-brands',adminAuth.ensureAdmin,brandController.addBrand);
    // brand editing getting
    router.get('/edit-brands/:id',adminAuth.ensureAdmin,brandController.editBrandGet);
    // brand editting 
    router.post('/brands/edit',adminAuth.ensureAdmin,brandController.editBrand);
    // deleting brand
    router.post('/brands/delete',adminAuth.ensureAdmin,brandController.deleteBrand);
    

    // userManageget
    router.get('/userManageGet',adminAuth.ensureAdmin,userManageController.userManageGet);
    // blockorUnblock
    router.post('/updateAccess/:id',adminAuth.ensureAdmin,userManageController.updateAccess);


    // orderMangementget
    router.get('/orderManageGet',adminAuth.ensureAdmin,orderMangementController.orderManageGet);
    // orderStatusChanging
    router.put('/updateOrderStatus',orderMangementController.updateOrderStatus);
    // orderManagementDetails
    router.get('/orderDetails/:id',adminAuth.ensureAdmin,orderMangementController.orderManageDetails);
    //  orderReturnStatus
    router.post('/update-returnStatus',orderMangementController.updateReturnStatus);


    // coupon
    router.get('/coupons',adminAuth.ensureAdmin,couponController.couponGet);  
    // addCoupon
    router.post('/addCoupon',couponController.addCoupon);
    // viewCoupon
    router.get('/getCoupon/:id',adminAuth.ensureAdmin,couponController.getCoupon);
    // editgetting
    router.get('/editCoupon/:id',couponController.editCouponGet);
    // editing 
    router.put('/updateCoupon/:id',couponController.updateCoupon);
    // deleting
    router.delete('/deleteCoupon/:id',couponController.deleteCoupon);


    // offer
    router.get('/offers',adminAuth.ensureAdmin,offerController.offerGet);
    // add offer
    router.post('/add-offer',offerController.addOffer);
    // edit offer
    router.post('/edit-offer/:id',offerController.editOffer);
    // deleting offer
    router.delete('/delete-offer/:id',offerController.deleteOffer);

    
    // salesreport
    router.post('/salesreport',dashboardController.salesReport);
    

    module.exports = router;    
