const Product = require('../models/productModel');
const Category = require('../models/categoryModel')


const ITEM_PER_PAGE = 10;
    

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

        const page = req.query.page || 1;
        const searchQuery = req.query.search || ""
        
        try {

            const query = {
                productName : { $regex : searchQuery , $options : 'i' }
            }

            const totalProducts = await Product.countDocuments(query);

            const products = await Product.find(query)
            .populate('category')
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
            res.status(500).json({
                error : true,
                message : "internal server error"
            });
        }
    },

    editProductGet : async (req,res) => {

        try {
            const productId = req.params.id;
            const product = await Product.findById(productId).populate('category');
            const category = await Category.find({isDeleted : false ,isActive : true})

            if(!product){
                return res.status(404).json({ error : true ,message : "Product Not Found"})
            }

            res.render('admin/editProduct',{product,category})
        } catch (error) {
            console.error("Error Fetching Product for Edit",error);
            res.status(500).json({error : true , message : "Internal Server Error"})
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
                stockQuantity

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
                stockQuantity
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
                return res.status(404).json({error : true , message : "product not found"})
            }

            res.redirect('/admin/products')
        } catch (error) {
            console.error("error updating product",error);
            return res.status(500).json({error : true , message : "Internal Server error"})
        }
    },

    deleteProduct : async (req,res) => {

        try {
            const productId = req.params.id;
            const deletedProduct = await Product.findByIdAndDelete(productId);

            if(!deletedProduct){
                return res.status(404).json({error : true , message : "product Not found"})
            }

            res.redirect('/admin/products')
        } catch(error) {
            console.error("Error deleting Product" , error);
            res.status(500).json({error : true , message : "internal Server Error"})
        }
    }
}