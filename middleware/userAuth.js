    const User = require("../models/userModel")

    module.exports = {

        authentication : (req,res,next) => {
            if(req.session.user){
                next()
            }else{
                return res.redirect('/login')
            }
        },
        
        userExist : (req,res,next) => {
            if(req.session.user){
                console.log("existss");
                return res.redirect('/')
            }else{
                next()
            }
        }
    }

