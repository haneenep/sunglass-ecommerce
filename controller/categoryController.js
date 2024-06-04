const Category = require('../models/categoryModel');

module.exports = {

    getAllCategory : async (req,res) => {

        try {
            const categorys = await Category.find({isDeleted : false});
            res.render('admin/categorys',{categorys})
        } catch(error) {
            res.status(500).send('server Error')
        }
        // res.render('admin/category',{categorys})

    },

    addCategoryGet : async (req, res) => {

        res.render('admin/add-categorys'); 

    },

    addCategory : async (req,res) => {

        try {
            const {name , isActive} = req.body;
            const newCategory = new Category({name,isActive})
            await newCategory.save()
            res.redirect('/admin/categorys')
        } catch(error) {
            res.status(500).send('Server Error')
        }
    },


    editCategoryGet : async (req,res) => {

        try {
            const category = await Category.findById(req.params.id);
            if(!category) {
                return res.status(400).send('Category not found')
            }
            res.render('admin/edit-categorys',{category});
        } catch(error) {
            res.status(500).send("Server Error")
        }
    },

    editCategory : async (req,res) => {

        const {id,name,isActive} = req.body;

        console.log(`recieved ${id},and ${name},and also ${isActive}`);

        try {
            const category = await Category.findByIdAndUpdate(id,
                {
                    name,
                    isActive : isActive === 'true'
                },
                {
                    new : true
                });
                console.log('category: ',category);
            if(!category) {
                return res.status(400).send('Category Not Found')
            }
            res.redirect('/admin/categorys')
        } catch(error) {
            res.status(500).send("Server Error")
        }
    },

    deleteCategorys : async (req,res) => {

        try {
            const {id} = req.body;
            const category = await Category.findByIdAndDelete(id);
            if(!category){
                return res.status(400).send('Category Not Found')
            }
            res.redirect('/admin/categorys')
        } catch(error) {
            res.status(500).send('Server Error')
        }
    }
}