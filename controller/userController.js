  const bcrypt = require('bcrypt');
  const User = require('../models/userModel');
  const sendEmail = require('../auth/nodemailer');
  const OTP = require('../models/otpModel');
  const generateOtp = require('../utils/generateOtp');
  


    module.exports = {

      homepage : (req,res) => {
        const user = req.session.user;
        const email = req.session.curUser;
        res.render('user/user_home',{user,email});
      },

      login : (req,res) => {
        res.render('user/user_login');
      },

      signup : (req,res) => {
        res.render('user/user_signup');
      },

      // Generate and send OTP 
      generateAndSendOtp : async (req,res) => {
        const {name,email,password} = req.body;

        try{

          console.log('Start generating OTP');

          // checking if user is already registered
          let user = await User.findOne({email});
          console.log(user);
          if(user){
            console.log("user already registered");
            return res.render('user/user_signup', { error: "User already exists" });
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
          console.log('OTP saved to database');

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
          res.status(500).send("Error generating OTP")
        }
      },

      renderVerifyOtpPage: (req, res) => {
        const email = req.query.email;
        if (!email) {
          return res.status(400).send('Email is required');
        }
        res.render('user/otp', { email });
      },

      // verify OTP
      verifyOTP : async (req,res) => {
        const { email,otp } = req.body;
        // const {email} = req.session.tempUser;
        console.log("egamil",email);
        console.log('Session tempUser:', req.session.tempUser);
        try {

          const otpRecord = await OTP.findOne({ email });

          if(!otpRecord){
            return res.status(400).send("Invalid Email or OTP");
          }

          // checking if OTP is valid
          if(otpRecord.otp !== otp || Date.now() > otpRecord.otpExpires) {
            return res.status(400).send("Invalid or Expired OTP")
          }

          if(!req.session.tempUser) {
            return res.status(400).send("session expired.please start registration process aggain")
          }

          // OTP is valid and complete registration
          const {name,password} = req.session.tempUser;
          const newUser = new User ({
            name,
            email,
            password
          });

          await newUser.save();
          await OTP.deleteOne({email});
          req.session.tempUser = null

          res.redirect('/login');
        } catch(err) {
          console.log(err);
          res.status(500).send("Error verifying OTP")
        }
      },

      // user signinde;
      loginUser : async (req,res) => {
        const { email, password} = req.body;
        // console.log(req.body);
        try {
          const user = await User.findOne({ email })

          if(!user) {
            console.log("User not found : ",email);
            
            return res.render('user/user_login',{error : "Invalid Email / Password"});
          }else{
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(!isPasswordValid){
              console.log("Invalid password for user : ",email);
              res.locals.err = "Invalid Email or Password";
             
             return res.render('user/user_login',{error : "Invalid Email / Password"});
            }
  
            // User is Authenticated
            req.session.user = user;
            req.session.curUser = email;
            res.redirect('/');
          }
         
        } catch(err) {
          console.error("Error logging in : ",err);
          
        }
      },

      resendOTP: async (req, res) => {
        const { email } = req.query;
    
        try {
          // Generate new OTP
          const otp = generateOtp();
          console.log(otp);
          const otpExpires = Date.now() + 3 * 60 * 1000; // OTP valid for 3 minutes
    
          // Update OTP record for the user
          await OTP.findOneAndUpdate(
            { email },
            { otp, otpExpires },
            { upsert: true, new: true }
          );
    
          // Send OTP to user's email
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
          res.status(500).send('Error resending OTP');
        }
      },

      logout : (req, res) => {
        // Destroy user session
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Internal Server Error');
            } else {
                // Redirect to login page
                res.redirect('/login');
            }
        });
    }
      
    };
