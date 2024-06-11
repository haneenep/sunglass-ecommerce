    const router = require('express').Router();
    const adminController = require('../controller/adminController');
    const productController = require('../controller/productController');
    const upload = require('../config/multer');
    const categoryController = require('../controller/categoryController');
    const userManageController = require('../controller/userManageController');

    // middlewear
    const adminAuth = require('../middleware/adminAuth');


    // authenticate route
    router.get('/login', adminController.adminGet);
    router.post('/login',adminAuth.isAdminAuthenticated,adminController.adminPost);
    router.get('/logout',adminController.adminLogout);
    // dashboard
    router.get('/dashboard',adminAuth.ensureAdmin,adminController.adminDash);


    // display addProduct form
    router.get('/add-product',adminAuth.ensureAdmin,productController.productAddGet);
    // handle addProduct form submission
    router.post('/add-product',adminAuth.ensureAdmin,upload.array('images',5),productController.addProduct);
    // displaying all products
    router.get('/products',adminAuth.ensureAdmin,productController.getAllProducts);
    // edit rendering 
    router.get('/edit-product/:id',adminAuth.ensureAdmin,productController.editProductGet);
    // edting
    router.post('/edit-Product/:id',upload.array('images'),productController.editProduct);
    // delete product
    router.post('/delete-product/:id',productController.deleteProduct);


    // category 
    router.get('/categorys',adminAuth.ensureAdmin,categoryController.getAllCategory);
    // Render the add
    router.get('/add-categorys',adminAuth.ensureAdmin,categoryController.addCategoryGet);
    // adding 
    router.post('/add-categorys',categoryController.addCategory);
    // edit geting 
    router.get('/edit-categorys/:id',adminAuth.ensureAdmin,categoryController.editCategoryGet);
    // editing
    router.post('/categorys/edit',categoryController.editCategory);
    // deleting
    router.post('/categorys/delete',categoryController.deleteCategorys);


    // userManageget
    router.get('/userManageGet',adminAuth.ensureAdmin,userManageController.userManageGet);
    // blockorUnblock
    router.post('/updateAccess/:id',userManageController.updateAccess);


    module.exports = router;    
