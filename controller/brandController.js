const Brand = require('../models/brandModel');

module.exports = {

    getAllBrands : async (req,res) => {

        try {
            const brands = await Brand.find({ isDeleted : false });

            const success = req.session.successMssg || null;
            const delet = req.session.delete || null;
            const done = req.session.success || null; 
            const err = req.session.err || null;

            req.session.err = null;
            req.session.delete = null;
            req.session.success = null;
            req.session.successMssg = null;

            res.render('admin/brand',{brands,success,done,delet,err})
        }catch (error){
            res.render('500');
        }
    },

    addBrandGet : (req,res) => {
        const err = req.session.errMssg || null;
        req.session.errMssg = null;
        res.render('admin/add-brands',{err})
    },

    addBrand : async (req,res) => {

        const {name,isActive} = req.body;

        try{

            const names = name.toLowerCase();

            const existBrand = await Brand.findOne({ name : names })
            if(existBrand){
                req.session.errMssg = "Brand is allready inserted";
                return res.redirect('/admin/add-brands')
            }
            const newBrand = new Brand({ name : names,isActive });
            await newBrand.save();

            req.session.success = "New Brand is Added";
            res.redirect('/admin/brands')

        }catch (error) {
            res.render('500');
        }
    },

    editBrandGet : async (req,res) => {

        try {
            const brand = await Brand.findById(req.params.id);

            const error = req.session.errMssg || null;
            req.session.errMssg = null;

            if(!brand) {
                req.session.err = "Brand Not found";
                return res.redirect('/admin/brands');
            }
            res.render('admin/edit-brands',{brand,error});
        }catch(error){
            res.render('500');
        }
    },

    editBrand : async (req,res) => {
        const {id,name,isActive} = req.body;

        try {
            const names = name.toLowerCase();

            const existBrand = await Brand.findOne({ name : names });
            if(existBrand && existBrand._id.toString() !== id) {
                req.session.errMssg = "Brand is Allready registered";
                return res.redirect(`/admin/edit-brands/${id}`);
            }
            const brand = await Brand.findByIdAndUpdate(id, {
                name : names, isActive : isActive === 'true'
            },{
                new : true
            }
        );
        if(!brand) {
            req.session.err = "Brand Not found";
            return res.redirect('/admin/brands')
        }
        req.session.successMssg = "Brand Edited Success";
        return res.redirect('/admin/brands')
        } catch(error){
            res.render('500'); 
        }
    },

    deleteBrand : async (req,res) => {

        try {
            const {id} = req.body;
            const brand = await Brand.findByIdAndDelete(id);

            if(!brand){
                req.session.err = "Brand Not Found";
                return res.redirect('/admin/brands');
            }

            req.session.delete = "Deleted Successfully";
            res.redirect('/admin/brands');
        }catch(error){
            console.error(error);
            res.render('500');
        }
    }
}

