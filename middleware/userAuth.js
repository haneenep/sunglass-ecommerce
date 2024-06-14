    const User = require("../models/userModel")

    module.exports = {
        
        userExist : (req,res,next) => {
            if(req.session.user){
                console.log("existss");
                return res.redirect('/')
            }else{
                next()  
            }     
        },

        blockUser : async (req,res,next) => {

            try{    

                const users = req.session.curUser;

            const findUser = await User.findOne({ email : users })

            if(findUser && findUser.access === 'status-deactive'){
                req.session.errMssg = "Your Account is blocked";
                req.session.destroy( err => {
                    if(err){
                        console.error("Session destroying err",err);
                        } else {
                            res.render('admin/blocked');
                        }
                })
            }else{
                next()
            }

            } catch(error) {
                console.error("error checking the blocked user",error);
                res.status(500).json({error : "Internal Server Error"})
            }

        }

    }

