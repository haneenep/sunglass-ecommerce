    const router = require('express').Router();
    const adminController = require('../controller/adminController');
    const productController = require('../controller/productController');
    const upload = require('../config/multer');
    const categoryController = require('../controller/categoryController');
    const brandController = require('../controller/brandController');
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
    router.post('/add-product',adminAuth.ensureAdmin,upload.array('images',6),productController.addProduct);
    // displaying all products
    router.get('/products',adminAuth.ensureAdmin,productController.getAllProducts);
    // edit rendering 
    router.get('/edit-product/:id',adminAuth.ensureAdmin,productController.editProductGet);
    // edting
    router.post('/edit-Product/:id',adminAuth.ensureAdmin,upload.array('images'),productController.editProduct);
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


    module.exports = router;    
