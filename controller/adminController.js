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

        // route for admindash
        adminDash : (req,res) => {
            res.render('admin/adminDash',{ user : req.session.admin})
        },
        

        adminLogout : (req,res) => {
            req.session.destroy((err) => {
                if(err) {
                    return res.redirect('/admin/dashboard')
                }
                res.redirect('/admin/login')
            });
        },
    }