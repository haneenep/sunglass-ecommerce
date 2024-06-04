const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
    

module.exports = {

    productAddGet : async (req,res) => {

        try {
            
            const category = await Category.find({isDeleted : false , isActive : true})
            res.render('admin/addProduct',{category})
        } catch (error) {
            console.error("Error fetching category",error);
            res.status(500).json({error : true , message : 'Internal Server Error'})
        }
    },

    addProduct : async (req,res) => {
        console.log(req.body);
        try {
            const {
                productName ,
                price ,
                description,
                category,
                stockQuantity
            } = req.body;

            const files = req.files;

    const images = Object.values(files)
      .flat()
      .map((file) => `/uploads/products/${file.filename}`);

            const newProduct = new Product({
                productName,
                price,
                description,
                images,
                category,
                stockQuantity,
            })

            await newProduct.save();
            res.redirect('/admin/products')
        } catch (error) {
            console.error("error adding product : ",error);
            res.status(500).json({
                error : true,
                message : "internal server error"
            });
        }
    },

    getAllProducts : async (req,res) => {
        
        try {
            const products = await Product.find().populate('category')
            res.render('admin/products',{products})
        } catch (error) {
            console.error("error fetching products",error);
            res.status(500).json({
                error : true,
                message : "internal server error"
            });
        }
    }
}