    const router = require('express').Router();
    const adminController = require('../controller/adminController');
    const productController = require('../controller/productController');
    const upload = require('../config/multer');
    const categoryController = require('../controller/categoryController');

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


    // category 
    router.get('/categorys',categoryController.getAllCategory);
    // Render the add
    router.get('/add-categorys', categoryController.addCategoryGet);
    // adding 
    router.post('/add-categorys',categoryController.addCategory);
    // edit geting 
    router.get('/edit-categorys/:id',categoryController.editCategoryGet);
    // editing
    router.post('/categorys/edit',categoryController.editCategory);
    // deleting
    router.post('/categorys/delete',categoryController.deleteCategorys);



    module.exports = router;    
