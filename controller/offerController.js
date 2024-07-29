const Offer = require('../models/offerModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

module.exports = {

    offerGet : async (req,res) => {

        try{
            
            const success = req.session.success;
            const errorMssg = req.session.errorMssg;

            delete req.session.success;
            delete req.session.errorMssg;

            const [offers,category] = await Promise.all([
                Offer.find().populate('categoryId'),
                Category.find({isActive : true})
            ])

            res.render('admin/admin-offers',{offers,success,errorMssg,category});

        }catch(error){

            console.error('Error while getting offer',error);
            res.render('500');
        }
    },

    addOffer : async (req,res) => {

        try{

            const {categoryId,offerPercentage,expiryDate} = req.body;

            const existOffer = await Offer.findOne({categoryId : categoryId});

            if(!existOffer){
                await Offer.create(req.body);

                const productCat = await Product.find({category : categoryId});
                const offerApplying = offerPercentage/100;

                for(const product of productCat){
                    if(product.discountAmount === 0){
                        const originalPrice = product.price;
                        const newPrice = Math.floor(originalPrice * (1 - offerApplying));

                        await Product.updateOne(
                            {_id: product._id},
                            {$set : {inCategoryOffer : true , beforeOffer : originalPrice , discountedPrice : newPrice}}
                        )

                        const updatedProduct = await Product.findById(product._id);
                        console.log('Updated product', updatedProduct);
                    }
                }

                req.session.success = "Added the new Category";
                res.redirect('/admin/offers');

            }else{
                req.session.errorMssg = "This category allready added to the offer";
                res.redirect('/admin/offers')
            }

        }catch(error){
            console.error('Error adding the offer',error);
            return res.render('500')
        }
    },

    editOffer : async (req,res) => {

        try{

            const offerId = req.params.id;
            const {categoryId,offerPercentage,expiryDate} = req.body;

            const existOffer = await Offer.findById(offerId).populate('categoryId');

            if(!existOffer){
                res.status(404).json({message : "offer Not found", success : false});
            }

            const oldCategory = existOffer.categoryId._id.toString();


            if (categoryId !== oldCategory) {
                const offerExist = await Offer.findOne({categoryId: categoryId});
                if (offerExist) {
                    return res.status(400).json({ success: false, message: 'Offer on this category already exists' });
                }
            }

                const updatedOffer = await Offer.findByIdAndUpdate(
                    offerId,
                    {categoryId,offerPercentage,expiryDate},
                    {new : true}
                )

            if(categoryId !== oldCategory){
                const oldProduct = await Product.find({category : oldCategory , inCategoryOffer : true})
                for(const product of oldProduct){
                    await Product.findByIdAndUpdate(
                        product._id,
                        {$set : {
                            discountedPrice : product.beforeOffer,
                            beforeOffer : 0,
                            inCategoryOffer : false
                        }},
                        {new : true}
                    )
                }
            }

            const newProduct = await Product.find({category : categoryId});
            const offer = 1 - offerPercentage / 100;

            for (const product of newProduct){
                if(product.discountAmount === 0){
                const originalPrice = product.price;
                const newPrice = Math.floor(offer * originalPrice);

                const updatedProduct = await Product.findByIdAndUpdate(
                    product._id,
                    {$set : {inCategoryOffer : true , beforeOffer : originalPrice , discountedPrice : newPrice}},
                    {new : true}
                )

                console.log(updatedProduct,"edited Product");
            }
        }

            res.status(200).json({success: true, message: 'Offer updated successfully',offers:updatedOffer});

        }catch(error){
            console.error("Error while updating the offer",error);
            res.render('500');
        }
    },

    deleteOffer : async (req,res) => {

        try{

            const offerId = req.params.id;

            const offerData = await Offer.findById(offerId);

            const products = await Product.find({category : offerData.categoryId });

            for(const product of products){
                if(product.inCategoryOffer === true){
                    await Product.updateOne(
                        {_id : product._id},
                        {
                            $set : {discountedPrice : product.beforeOffer , beforeOffer : 0 , inCategoryOffer : false}
                        },
                        {new : true}
                    )
                }
            }

            await Offer.findByIdAndDelete(offerId)
            res.status(200).json({message : 'Offer Deleted Successfully' , success : true});
        }catch(error){
            console.error("Error while deleting the offer",error);
            res.render('500');
        }
    }
}

