// const router = require("express").Router();
// const passport = require('passport');
// require('dotenv').config();

// router.get('/login/success',(req,res) => {
//     if(req.user) {
//         res.status(200).json({
//             error : false,
//             message : "Successfully Loged In",
//             user : req.user
//         });
//     }else{
//         res.status(403).json({
//             error : true,
//             message : "Not Authorized"
//         })
//     }
// });

// router.get('/login/failed',(req,res) => {
//     res.status(401).json({
//         error : true,
//         message : "Log in Failure"
//     })
// });

// router.get('/google',passport.authenticate('google',{
//     scope : ['email','profile']
// }));

// router.get("/google/callback",passport.authenticate('google',{
//     successRedirect : process.env.CLIENT_URL,
//     failureRedirect : "/login/failed"
// }));

// router.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );

// router.get("/logout",(req,res) => {
//     req.logout();
//     res.redirect(process.env.CLIENT_URL);
// })

// module.exports = router;




// const express = require('express');
// const passport = require('passport');
// const router = express.Router();

// // Auth with Google
// router.get('/google', passport.authenticate('google'));

// // Callback route for Google to redirect to
// router.get('/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/' }), 
//   (req, res) => {
//     res.redirect('/profile');
//   }
// );

// module.exports = router;








const router = require("express").Router();
const passport = require('passport');
require('dotenv').config();

// Route for successful login
router.get('/login/success', (req, res) => {
    if (req.user) {
        res.status(200).json({
            error: false,
            message: "Successfully Logged In",
            user: req.user
        });
    } else {
        res.status(403).json({
            error: true,
            message: "Not Authorized"
        });
    }
});

// Route for failed login
router.get('/login/failed', (req, res) => {
    res.status(401).json({
        error: true,
        message: "Login Failure"
    });
});

// Route to initiate Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// Callback route for Google OAuth
router.get("/google/callback",
    passport.authenticate('google', {
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: "/login/failed"
    })
);

// Route to logout
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
});

module.exports = router;
