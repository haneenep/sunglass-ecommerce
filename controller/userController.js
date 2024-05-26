const userdb = require("../models/userModel")


module.exports = {

    homepage : (req,res) => {
        res.render('user/user_login')
    },

    login : (req,res) => {
        res.render('user/user_home')
    },

    loginAndSignup : (req,res) => { 
        res.redirect('/')
    },

    registerUser: async (req,res) => {

        const {name,password,email} = req.body;
      
        // checking wheather user is already exist 
        const existingUser = await userdb.findOne({email :email})
      
        if(existingUser){
          res.send("this email is already registered , you can login with other one")
        }else{
          const userdata = await userdb.insertMany({name,password,email})
          console.log(userdata);
          res.redirect('/login')
        }
      }

}
