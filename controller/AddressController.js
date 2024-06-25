const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Address = require('../models/addressModel');

module.exports = {

    profileGet : async (req,res) => {

        try {

            const id = req.session.user;
            const user = await User.findOne({ _id : id });
            res.render('user/userProfile',{user ,userId : id});

        } catch (error){
            console.error("some error when rendering the userProfile",error);
            res.redirect('500');
        }
    },

    updateUserName : async (req,res) => {

        try {
            const {name} = req.body;
            const userId = req.session.user;

            await User.findByIdAndUpdate(userId,{name});
            res.status(200).json({message : "Name updated Successfully"});

        } catch(error){
            console.error("Error updating Name",error);
            res.status(500).json({message : "Some Problem while updating Name"});
        }

    },

    updateUserPassword : async (req,res) => {
        
        try{

            const { currentPassword,newPassword } = req.body;

            const userId = req.session.user;
            const id = userId._id;

            const user = await User.findById(id);
            const Match = await bcrypt.compare( currentPassword,user.password );

            if(!Match){
                return res.status(404).json({message : "Current password is not correct"});
            }

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword,salt);

            await User.findByIdAndUpdate(user._id,{ password : hashedNewPassword });

            res.status(200).json({message : "password Changed successfully"});

        } catch (error){
            console.error("Error updating password",error);
            res.status(500).json({message : "Some Issues while updating the password"});
        }
    },
    addressGet : (req,res) => {
        res.render('user/shippingAddress')
    }
}