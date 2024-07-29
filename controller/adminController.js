    const passport = require("passport")
    const bcrypt = require('bcrypt');

    module.exports = {
        
        // displaying admin
        adminGet : (req,res) => {
            res.render("admin/adminLogin",{ error_msg: req.flash('error_msg') })

        },

        // handling admin
        adminPost : (req,res) => {
            res.redirect('/admin/dashboard')
        },
        

        adminLogout : (req,res) => {
            req.session.destroy((err) => {
                if(err) {
                    return res.redirect('/admin/dashboard')
                }
                console.log("admin login");
                res.redirect('/admin/login')
            });
        },
    }