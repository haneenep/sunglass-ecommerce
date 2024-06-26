const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');


const ITEM_PER_PAGE = 10;
    

module.exports = {

    productAddGet : async (req,res) => {

        try {
            
            const brand = await Brand.find({ isDeleted : false , isActive : true });
            const category = await Category.find({isDeleted : false , isActive : true});
            res.render('admin/addProduct',{ category,brand })
            
        } catch (error) {
            console.error("Error fetching category",error);
            res.render('500');
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
                brand,
                stockQuantity,
                // isActive
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
                brand,
                stockQuantity,
                // isActive
            })

            await newProduct.save();
            res.redirect('/admin/products')
        } catch (error) {
            console.error("error adding product : ",error);
            res.render('500');
        }
    },

    getAllProducts : async (req,res) => {

        const page = req.query.page || 1;
        const searchQuery = req.query.search || ""
        
        try {

            const query = {
                productName : { $regex : searchQuery , $options : 'i' }
            }

            const totalProducts = await Product.countDocuments(query);

            const products = await Product.find(query)
            .populate('category')
            .populate('brand')
            .skip((page - 1) * ITEM_PER_PAGE)
            .limit(ITEM_PER_PAGE);

            res.render('admin/products',{
                products,
                currentPage : page,
                hasNextPage : ITEM_PER_PAGE * page < totalProducts,
                hasPreviousPage : page > 1,
                nextPage : +page +1,
                previousPage : page - 1,
                lastPage : Math.ceil(totalProducts/ITEM_PER_PAGE),
                searchQuery
            })
        } catch (error) {
            console.error("error fetching products",error);
            res.render('500');
        }
    },

    editProductGet : async (req,res) => {

        try {
            const productId = req.params.id;
            const product = await Product.findById(productId)
            const brand = await Brand.find({isDeleted : false ,isActive : true });
            const category = await Category.find({isDeleted : false ,isActive : true});

            if(!product){
                return res.render('404');
            }

            res.render('admin/editProduct',{product,category,brand})
        } catch (error) {
            console.error("Error Fetching Product for Edit",error);
            res.render('500');
        }
    },

    editProduct : async (req,res) => {

        try {
            const productId = req.params.id;
            const {
                productName,
                price,
                description,
                category,
                brand,
                stockQuantity,
                // isActive

            } = req.body;

            const files = req.files;
            const image = Object.values(files)
            .flat()
            .map((file) => `/uploads/products/${file.filename}`);

            const updatedData = {
                productName,
                price,
                description,
                category,
                brand,
                stockQuantity,
                // isActive : isActive === 'true'
            }

            if(image.length > 0) {
                updatedData.images = image;
            }
            
            const updateProduct = await Product.findByIdAndUpdate(
                productId,
                updatedData,
                {new : true}
            );

            if(!updateProduct) {
                return res.render('404');
            }

            res.redirect('/admin/products')
        } catch (error) {
            console.error("error updating product",error);
            return res.render('500')
        }
    },

    deleteProduct : async (req,res) => {

        try {
            const productId = req.params.id;
            const deletedProduct = await Product.findByIdAndDelete(productId);

            if(!deletedProduct){
                return res.render('404');
            }

            res.redirect('/admin/products')
        } catch(error) {
            console.error("Error deleting Product" , error);
            res.status(500).json({error : true , message : "internal Server Error"})
        }
    }
}