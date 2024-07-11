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

    addressGet : async (req,res) => {

        try {

            const user = req.session.user;
            const id = user._id
            
            const address = await Address.findOne({ userId : id })
            
            res.render('user/shippingAddress',{ user, address : address?.address });

        } catch(error){
            console.error("Error",error);
            res.render('500');
        }
    },

    addAddress : async (req,res) => {

        console.log(req.body,"uygjhb");

        try {

            const userId = req.session.user;

              const addressData = {
                name : req.body.name,
                phoneNumber : req.body.phoneNumber,
                pincode : req.body.pincode,
                locality : req.body.locality,
                address : req.body.address,
                city : req.body.city,
                state : req.body.state,
                addressType : req.body.addressType
              }

              const userAddress = await Address.findOne({ userId })

              if(userAddress){
                userAddress.address.push(addressData);
                await userAddress.save();
                res.status(200).json({message : "Address Added Successfully"})
                console.log('successfylly created');
              }else{
                await Address.create({userId, address : [addressData] })
                res.status(200).json({message : "New Address Added Successfully"})
                console.log('successfylly created new one');
              }
            
        } catch(error){
            console.error("Error while creating address",error);
            res.status(500).json({message : "something happened when adding address"})
        }
    },

    editAddress : async (req,res) => {

        console.log(req.body,"fghjkfhgf");
        try {

            const { _id , ...addressData} = req.body;

            const updateAddress = await Address.findOneAndUpdate(
                {'address._id' : _id},
                {
                    $set : {'address.$' : addressData}
                },
                {new : true}
            );

            if(!updateAddress){
                return res.status(404).send('Address not found');
            }
            res.status(200).send(updateAddress);

        } catch (error){
            console.error("Something happened while edit the address",error);
            res.status(400).send(error)
        }
    },

    deleteAddresses : async (req,res) => {
        try {
            
            const id = req.params.id;
            const user = req.session.user._id;

            const addresses = await Address.findOne({ 'address._id' : id , userId : user});

            if(!addresses){
                return res.status(404).json({ message : "Address Not found "});
            }

            await Address.updateOne(
                { userId : user },
                {$pull : {
                    address : { _id :id }
                }}
            )
            res.status(200).json({success: true ,message : "Successfully deleted address "});

        } catch(error){
            console.error("An Error occured while deleting the address",error);
            res.status(500).send(error);
        }
    }
 
}