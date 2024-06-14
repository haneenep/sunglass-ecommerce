const Category = require('../models/categoryModel');

module.exports = {

    getAllCategory : async (req,res) => {

        try {
            const categorys = await Category.find({isDeleted : false});

            const success = req.session.successMssg || null;
            const delet = req.session.delete || null;
            const done = req.session.success || null;
            const err = req.session.err || null;

            req.session.err = null;
            req.session.delete = null;
            req.session.success = null;
            req.session.successMssg = null;

            res.render('admin/categorys',{ categorys,success,done,delet,err })
        } catch(error) {
            res.render('500')
        }

    },

    addCategoryGet : async (req, res) => {
        const err = req.session.errMssg || null;
        req.session.errMssg = null;
        res.render('admin/add-categorys',{ err }); 

    },

    addCategory : async (req,res) => {
        const {name , isActive} = req.body;

        try {
            const names = name.toLowerCase()

            const existCategory = await Category.findOne({ name : names })
            console.log(existCategory);
            if(existCategory){
                req.session.errMssg = "Category is allready registered"
                return res.redirect('/admin/add-categorys')
            }
            const newCategory = new Category({name : names,isActive})
            await newCategory.save()

            req.session.success = "New Category is Added";

            res.redirect('/admin/categorys')
    
        } catch(error) {
            res.render('500');
        }
    },


    editCategoryGet : async (req,res) => {

        try {
            const category = await Category.findById(req.params.id);

            const err = req.session.errMssg || null;
            req.session.errMssg = null;

            if(!category) {
                req.session.err = "Category not found";
                return res.redirect('/admin/categorys')
            }
            res.render('admin/edit-categorys',{ category,err });
        } catch(error) {
            res.render('500');
        }
    },

    editCategory : async (req,res) => {

        const {id,name,isActive} = req.body;

        console.log(`recieved ${id},and ${name},and also ${isActive}`);

        try {
            const names = name.toLowerCase()

            const existCategory = await Category.findOne({ name : names });
            if(existCategory && existCategory._id.toString() !== id){
                req.session.errMssg = "Category is already registered";
                return res.redirect(`/admin/edit-categorys/${id}`)
            }
            const category = await Category.findByIdAndUpdate(id,
                {
                    name : names,
                    isActive : isActive === 'true'
                },
                {
                    new : true
                });
                console.log('category: ',category);
            if(!category) {
                req.session.err = "Category not found";
                return res.redirect('/admin/categorys')
            }
            req.session.successMssg = "Category Edited Successfully"
            return res.redirect('/admin/categorys')
        } catch(error) {
            res.render('500');
        }
    },

    deleteCategorys : async (req,res) => {

        try {

            const {id} = req.body;
            const category = await Category.findByIdAndDelete(id);

            if(!category){
                req.session.err = "Category not found";
                return res.redirect('/admin/categorys');
            }

            req.session.delete = "Deleted Successfully";
            res.redirect('/admin/categorys')

        } catch(error) {
            res.render('500');
        }
    }
}