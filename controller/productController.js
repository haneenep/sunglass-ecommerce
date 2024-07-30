const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const path = require('path');
const fs = require('fs');


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
        try {
            const {
                productName ,
                price ,
                description,
                category,
                brand,
                stockQuantity,
                discountAmount,
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
                discountAmount
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
    editProduct: async (req, res) => {
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).render('404');
            }
    
            const { productName, price, description, category, brand, discountAmount, stockQuantity, deletedImages, editedImages } = req.body;
    
            product.productName = productName;
            product.price = price;
            product.description = description;
            product.category = category;
            product.brand = brand;
            product.discountAmount = discountAmount;
            product.stockQuantity = stockQuantity;
    
            // Create a new array to store updated images
            let updatedImages = [...product.images];
    
            // Handle deleted images
            if (deletedImages) {
                const deletedIndices = JSON.parse(deletedImages);
                const imagesToDelete = product.images.filter((_, index) => deletedIndices.includes(index));
    
                // Delete files from the server
                imagesToDelete.forEach(imagePath => {
                    const fullPath = path.join(__dirname, '..', 'public', imagePath);
                    fs.unlink(fullPath, (err) => {
                        if (err) console.error("Error deleting image file:", err);
                    });
                });
    
                // Remove deleted images from the array
                updatedImages = updatedImages.filter((_, index) => !deletedIndices.includes(index));
            }
    
            // Handle edited images
            if (editedImages) {
                const editedImageData = JSON.parse(editedImages);
                editedImageData.forEach(item => {
                    if (item.index < updatedImages.length) {
                        if (updatedImages[item.index] !== item.path) {
                            const oldImagePath = updatedImages[item.index];
                            const fullPath = path.join(__dirname, '..', 'public', oldImagePath);
                            fs.unlink(fullPath, (err) => {
                                if (err) console.error("Error deleting old edited image file:", err);
                            });
    
                            updatedImages[item.index] = item.path;
                        }
                    }
                });
            }
    
            if (req.files && req.files.newImages) {
                const newImagePaths = req.files.newImages.map(file => `/uploads/products/${file.filename}`);
                updatedImages = updatedImages.concat(newImagePaths);
            }
    
            product.images = updatedImages;
    
            await product.save();
            res.redirect('/admin/products');
        } catch (error) {
            console.error("Error updating product", error);
            return res.status(500).render('500');
        }
    },
    
    cropImage: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }
        const croppedImagePath = `/uploads/products/${req.file.filename}`;
        res.json({ success: true, croppedImagePath });
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
    },
};
