const router = require("express").Router();
const passport = require('passport');
const User = require("../models/userModel");
require('dotenv').config();

// Route for successful login
router.get('/login/success', async (req,res) => {
    if(req.user) {

        const { id, _json: { name, email, picture } } = req.user;

        console.log( name, email,);
        try {
            let existUser = await User.findOne({ email });
            
         if(existUser && existUser.password) {
          return res.send("user allready exists")
         }
          if(existUser && existUser.googleId){
            req.session.user = req.user.displayName;
            return res.redirect('/')
          }
               const user = new User({
                    googleId : id,
                    name : name,
                    email : email,
                    picture : picture
                });

                await user.save()

            console.log("sa ved:",user);
            req.session.user = req.user.displayName;
            res.redirect("/");
        } catch(error) {
            console.error("Error saving user goole :",error);
            res.status(500).json({
                error : true,
                message : 'Internal Server Error'
            });
        }
        }else{
        res.status(403).json({
            error : true,
            message : "Not Authorized"
        })
    }
});

// Route for failed login
router.get('/login/failed',(req,res) => {
    res.status(401).json({
        error : true,
        message : "Log in Failure"
    })
});

router.get('/google',passport.authenticate('google',{
    scope : ['email','profile']
}));

// Callback route for Google OAuth
router.get("/google/callback",passport.authenticate('google',{
    successRedirect : "/auth/login/success",
    failureRedirect : "/auth/login/failed"
}));

// Route to initiate Google OAuth login
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// route to logout
router.get("/logout",(req,res) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
})

module.exports = router;
