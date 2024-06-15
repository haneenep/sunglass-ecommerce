const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const sendEmail = require('../auth/nodemailer');
const OTP = require('../models/otpModel');
const generateOtp = require('../utils/generateOtp');


module.exports = {

    forgot : (req,res) => {
        let err = req.session.errMssg || null;
        req.session.errMssg = null;

        res.render('user/forgotPassword', { err });

      },

      forgotOtpren : (req,res) => {
        const errMssg = req.session.errMssg || null;
        req.session.errMssg = null;
        if(!email){
            return res.redirect('/forgotPassword')
        }
        res.render('user/otpforgot',{ errMssg })
      },

    forgotPassword : async (req,res) => {

        const {email} = req.body

        try {
            let user = await User.findOne({ email })

            if(!user){
                req.session.errMssg = "Not an existing email";
                return res.redirect('/forgotPassword')
            }

            const otp = generateOtp()
            console.log(`generated forgot otp is : ${otp}`);
            const otpExpires = Date.now() + 3 * 60 * 1000;

            await OTP.findOneAndUpdate(
                {email},
                {otp,otpExpires},
                {upsert : true , new : true}
            );

            const mailOptions = {
                from : process.env.AUTH_EMAIL,
                to : email,
                subject : "vistaVogue registration OTP",
                text : `your OTP code is ${otp}. It is valid for only 3 minutes.`
            }

            await sendEmail(mailOptions);

            res.render('user/otpforgot',{email})
        }catch (error){
            console.log(error);
            res.render('500');
        }
    },

    forgotOtp : async (req,res) => {

        const { email,otp } = req.body;

        try {
            const otpRec = await OTP.findOne({ email });

            if(!otpRec){
                req.session.errMssg = "Invalid Email or Otp";
                return res.redirect(`/otp-forgot?email=${email}`);
            }

            if(otpRec.otp !== otp || Date.now() > otpRec.otpExpires){
                req.session.errMssg = "Invalid or Expired OTP";
                return res.redirect(`/otp-forgot?email=${email}`);
            }

            req.session.email = email;
            
            await OTP.deleteOne({email});
            return res.render('user/resetPassword');

        }catch(error){
            console.log(error);
            res.render('500')
        }
    },

    resetPassword : async (req,res) => {
        const email = req.session.email;
        const {password} = req.body;

        try{

            const user = await User.findOne({ email });
            if(!user) {
                req.session.errMssg = "Invalid Email";
                return res.redirect('/forgotPassword');
            }

            const salt = await bcrypt.genSalt(10);

            const hashedPassword = await bcrypt.hash(password,salt);
            
            await User.findOneAndUpdate(
                {email},
                {password : hashedPassword}
            )

            req.session.success = "Password is successfully changed";
            return res.redirect('/login');

        }catch(error){
            console.log(error);
            res.render('500');
        }
    },

    resendForgotOtp : async (req,res) => {

        const {email} = req.query;

        try {
            const otp = generateOtp();
            console.log(`resend otp is ${otp}`);
            const otpExpires = Date.now() + 3 * 60 * 1000;

            await OTP.findOneAndUpdate(
                {email},
                {otp,otpExpires},
                {upsert : true,new : true}
            );

            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: 'Your New OTP Code',
                text: `Your new OTP code is ${otp}. It is valid for 3 minutes.`
            }

            await sendEmail(mailOptions);

            res.redirect(`otp-forgot?email=${email}`)

        }catch(error){
            console.log(error);
            res.render('500')
        }
    }
}

