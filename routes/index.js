const router = require('express').Router();
const collection = require('../models/userModel')

/* GET home page. */
router.get('/',(req,res)=>{
  res.render('user/user_login')
})

router.get('/login',(req,res)=>{
  res.render('user/user_home')
})

// register the user
router.post('/signup',async (req,res)=>{

  const data = {
    name : req.body.name,
    password : req.body.password,
    email : req.body.email
  }

  // checking wheather user is already exist 
  const existingUser = await collection.findOne({email : data.email})

  if(existingUser){
    res.send("this email is already registered , you can login with other one")
  }else{
    const userdata = await collection.insertMany(data)
    console.log(userdata);
  }

  
})
module.exports = router;
