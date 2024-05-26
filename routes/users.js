const router = require('express').Router();
const userController = require('../controller/userController')



router.get('/', userController.homepage);

module.exports = router;
