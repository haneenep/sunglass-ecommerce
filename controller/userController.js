const generateOtp = require('../utils/generateOtp');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const sendEmail = require('../auth/nodemailer');
const Wallet = require('../models/walletModel');
const Brand = require('../models/brandModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const OTP = require('../models/otpModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
  

    module.exports = {

      homepage : async (req,res) => {

        const user = req.session.user;
        const PRODUCTS_PER_SECTION = 8;
        const LATEST_PRODUCTS_COUNT = 3;
        
        try {

          const [products,latestP] = await Promise.all([
            Product.find().populate('category'),
            Product.find().sort({createdAt : -1})
          ])

          const mensProducts = products.filter(product => product.category.name.toLowerCase() === 'men').slice(0, PRODUCTS_PER_SECTION);
          const womensProducts = products.filter(product => product.category.name.toLowerCase() === 'women').slice(0, PRODUCTS_PER_SECTION);
          const kidsProducts = products.filter(product => product.category.name.toLowerCase() === 'kids').slice(0, PRODUCTS_PER_SECTION);
          
          const latestProducts = latestP.slice(0,LATEST_PRODUCTS_COUNT);

          res.render('user/user_home',{
            user,
            products,
            mensProducts,
            womensProducts,
            kidsProducts,
            latestProducts
          }
        );

        } catch(err){
          console.error('Error Fetching Products :',err);
          res.render('500');
        }
      },

      login : (req,res) => {
        const err = req.session.errMssg || null;
        const success = req.session.success || null;
        
        req.session.success = null
        req.session.errMssg = null;
        res.render('user/user_login',{ err,success });
      },

        signup : (req,res) => {

        const err = req.session.errMssg || null;
        req.session.errMssg = null;
        res.render('user/user_signup',{err});

      },

      // Generate and send OTP 
      generateAndSendOtp : async (req,res) => {
        const {name,email,password,userId} = req.body;
        console.log("ll",req.body);

        if(userId){
          req.session.refLink = req?.body?.userId;
        }

        try{

          console.log('Start generating OTP');

          let user = await User.findOne({email});
          console.log(user);
          if(user){
            console.log("user already registered");
            req.session.errMssg = "User already exists";
            return res.redirect('/loginandsignup');
          }

          // Generate OTP 
          const otp = generateOtp();
          console.log(`Generated OTP is : ${otp}`);
          const otpExpires = Date.now() + 3 * 60 * 1000;

          // Create or Update OTP record 
          await OTP.findOneAndUpdate(
            {email},
            {otp,otpExpires},
            {upsert : true , new : true}
          );

          // Send OTP to user's Email 
          const mailOptions = {
            from : process.env.AUTH_EMAIL,
            to : email,
            subject : "vistaVogue registration OTP",
            text : `your OTP code is ${otp}. It is valid for only 3 minutes.`
          };

          await sendEmail(mailOptions);
          console.log('OTP sent to email');

          // Temporarily store users details in session
          req.session.tempUser = { name, email, password : await bcrypt.hash(password, 10) };
          console.log('User details stored in session temp user',req.session.tempUser);

          res.render('user/otp',{ email });
        } catch (err) {
          console.error('Error generating OTP:', err);
          res.render('500');
        }
      },

      renderVerifyOtpPage: (req, res) => {
        const email = req.query.email || (req.session.tempUser && req.session.tempUser.email);
        const errMssg = req.session.errMssg || null;
        req.session.errMssg = null;
        if (!email) {
          return res.redirect('/loginandsignup')
        }
        res.render('user/otp', { email,errMssg });
      },

      // verify OTP
      verifyOTP : async (req,res) => {
        const { email,otp } = req.body;
        console.log("egamil",email);
        console.log('Session tempUser:', req.session.tempUser);
        try {

          const otpRecord = await OTP.findOne({ email });

          if(!otpRecord){
            req.session.errMssg = "Invalid Emaill or OTP";
            return res.redirect(`/verify-otp?email=${email}`);
          }

          // checking if OTP is valid
          if(otpRecord.otp !== otp || Date.now() > otpRecord.otpExpires) {
            req.session.errMssg = "Invalid or Expired OTP"
            return res.redirect(`/verify-otp?email=${email}`)
          }

          if(!req.session.tempUser) {
            req.session.errMssg = "session expired.please start registration process aggain"
            return redirect(`/verify-otp?email=${email}`)
          }

          // OTP is valid and complete registration
          const {name,password} = req.session.tempUser;
          const newUser = new User ({
            name,
            email,
            password
          });

          const referalLink = `http://localhost:4000/loginandsignup?refId=${newUser._id}`
          
          newUser.referalLink = referalLink
          await newUser.save();

          await OTP.deleteOne({email});

          const refLink = req?.session?.refLink;

          if(mongoose.Types.ObjectId.isValid(refLink)){
            const userRef = req.session.refLink;
            const userExist = await Wallet.findById(userRef)

            if(userExist){
              await Wallet.findByIdAndUpdate(
                {user : userExist},
                {$inc : {balance : 200},
                $push : {
                  transactions : {
                    transaction_id : `myWallet${uuid.v4()}`,
                    amount : 200,
                    type : 'credit',
                    description : 'Referal Amount',
                  }
                }}
              )
            }else{
              await Wallet.create({
                user : userRef,
                balance : 200,
                transactions : {
                  transaction_id : `myWallet${uuid.v4}`,
                  amount : 200,
                  type : 'credit',
                  description : 'Referal Amount'
                }
              })
            }
          }
          
          delete req.session.refLink;
          
          req.session.tempUser = null;
          req.session.success = "Signup Successfully !!";

          res.redirect('/');
        } catch(err) {
          console.log(err);
          res.render('500')
        }
      },

      // user signinde
      loginUser : async (req,res) => {
        const { email, password} = req.body;

        try {
          const user = await User.findOne({ email })

          if(!user) {
            console.log("User not found : ",email);
            req.session.errMssg = "Invalid Email / Password";
            
            return res.redirect('/login');
          }

          else{
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if(!isPasswordValid){
              console.log("Invalid password for user : ",email);
              req.session.errMssg = "Invalid Email or Password";
             
             return res.redirect('/login');
            }
  
            req.session.user = user;
            req.session.curUser = email;
            res.redirect('/');
          }
         
        } catch(err) {
          console.error("Error logging in : ",err);
          res.render('500');
          
        }
      },

      resendOTP: async (req, res) => {
        const { email } = req.query;
    
        try {

          const otp = generateOtp();
          console.log(otp);
          const otpExpires = Date.now() + 3 * 60 * 1000;
    
          await OTP.findOneAndUpdate(
            { email },
            { otp, otpExpires },
            { upsert: true, new: true }
          );
    
          const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Your New OTP Code',
            text: `Your new OTP code is ${otp}. It is valid for 3 minutes.`
          };
          await sendEmail(mailOptions);
    
          res.redirect(`/verify-otp?email=${email}`);
        } catch (err) {
          console.error('Error resending OTP:', err);
          res.render('500');
        }
      },

      
      productPage : async (req,res) => {
        const user = req.session.user;
        const email = req.session.curUser;

        const { page = 1, sort = 'recommended', category, brand, price, search } = req.query;

        const limit = 9;
        const skip = (page - 1) * limit;

        const filterQuery = await buildFilterQuery({ category , brand , price , search});
        const sortOptions = getSortOption(sort);


        try {

          const totalProducts = await Product.countDocuments(filterQuery)
          
          const products = await Product.find(filterQuery)
          .populate('category')
          .populate('brand')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean();
          
          console.log(products,"there is your filter");
          
          const totalPages  = Math.ceil(totalProducts / limit);

          const categories = await Category.find({ isActive: true }).lean();
          const brands = await Brand.find({ isActive: true }).lean(); 

          const noResults = totalProducts === 0;

          res.render('user/product',{ 
            products,
            user,
            email,
            currentPage : parseInt(page),
            totalPages,
            totalProducts,
            sort,
            category,
            brand,
            price,
            search,
            categories,
            brands,
            noResults
          })
          
        } catch(err) {
          console.error('Error Fetching Product',err);
          res.render('500');
        }

        async function buildFilterQuery({ category,brand,price,search }) {
          const filterQuery = {}
  
          if(category){
            const categoryData = await Category.findOne({ name : category });
            if(categoryData) filterQuery.category = categoryData._id;
          }
  
          if(brand){
            const brandData = await Brand.findOne({ name : brand });
            if(brandData) filterQuery.brand = brandData._id;
          }
  
          if(price){
          const [min,max] = price.split('-').map(Number);
          filterQuery.discountedPrice = {$gte : min,$lte : max};
          }
  
          if(search){
            filterQuery.$or = [
              {productName : {$regex : search , $options : 'i'}},
              {description : {$regex : search , $options : 'i'}}
            ];
          }
  
          return filterQuery;
        }

        function getSortOption(sort) {
          const sortOptions = {
              recommended: { createdAt: 1 },
              new: { createdAt: -1 },
              low_to_high: { discountedPrice: 1 },
              high_to_low: { discountedPrice: -1 }
          };
          return sortOptions[sort] || sortOptions.recommended;
      }
      },

      productDetails: async (req, res) => {
    
        try {
          
            const user = req.session.user;
            const email = req.session.curUser;
            const productId = req.params.id;


            const product = await Product.findById(productId)
            .populate('category')
            .populate('brand');

            const category = product.category;
            const brand = product.brand;
            const relatedProducts = await Product.find({ category: category._id, _id: { $ne: productId } });
            let cart = null;
            if(user && user._id){
              cart = await Cart.findOne({ userId: user._id, 'products.productid': productId });
            }
            
            res.render('user/productDetails', { user, email, product, category, brand, relatedProducts, cart });
        } catch (error) {
            console.error('Error Fetching Product Details', error);
            res.render('500');
        }
    },


      contact : (req,res)  => {
        const user = req.session.user;

        res.render('user/contact',{user});
      },

      logout : (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                res.render('500');
            } else {
                res.redirect('/');
            }
        });
    }
      
    };
