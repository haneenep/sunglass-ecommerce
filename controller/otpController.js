const sendEmail = require('../auth/nodemailer');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const {createError} = require('../utils/error');
const {AUTH_EMAIL} = process.env;
const generateOtp = require('../utils/generateOtp');
const { name } = require('ejs');

module.exports = {

    
    // send otp and to store user data
    sendOtp : async (req,res,next) => {
        const {name,email,password} = req.body;

        try {

            const existingUser = await User.findone({email});
            if(existingUser) return next(createError(401,`Email '${email}' is already registered`))

                // generate a new otp
                const generatedOtp = generateOtp();
                console.log("Generated OTP :",generatedOtp);

                // email options
                const mailOptions = {
                    from : AUTH_EMAIL,
                    to : email,
                    subject : "vistaVogue registration OTP",
                    html : `<p>Hello ${name}, use this OTP to verify your email:</p>
                    <h2>${generatedOtp}</h2>
                    <p>OTP will expire in 3 minutes.</p>`
                };

                // send the otp through email
                await sendEmail(mailOptions)

                // hash the password and otp
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                const hashedOtp = await bcrypt.hash(generatedOtp, salt);

                // create a new user with the hashed password and OTP
                const newUser = new User ({
                    name,
                    email,
                    password : hashedPassword,
                    otp : hashedOtp,
                });

                // save the user to the database
                await newUser.save()

                // set the session variables for OTP verification 
                req.session.otpVerififcation = true
                req.session.userEmail = email;

                // deleting the user document if OTP is not entered in 3 min
                setTimeout(async () => {
                    try {
                        const user = await User.findOne({email});
                        if(user&&user.otp) {
                            await User.deleteOne({email});
                            req.session.userEmail = null;
                            delete req.session.otpVerififcation;
                        }
                    } catch (error) {
                        console.error("Error deleting user document :",error);
                    }
                },3*60*1000);

                return res.status(200).json({message : "OTP sent successfully",name});
        } catch(err) {
            next(createError())
        }
    },


    //render otp page
    renderOtp : async (req,res) => {
        const email = req.session.userEmail;
        res.render("otp",{email});
    },


    //verify OTP
    verifyOtp : async (req,res,next) => {
        const {otp} = req.body;
        const email = req.session.userEmail;

        try{
            const user = await user.findOne({email});
            if(!user) return next(createError(401,"Invalid Email"))

                const isMatch = await bcrypt.compare(otp,user.otp);
                if(!isMatch) return next(createError(401,"Invalid OTP"))

                    // remove the otp from the user document
                    await User.updateOne({email}, {$unset:{otp: "" }})

                    // clear the session variables
                    req.session.userEmail = null;
                    req.session.user = user.name;

                    return res.status(200).json({message : "OTP verified successfully",name: user.name});
        }catch (error) {
            next(createError());
        }
    },


    // resend otp
    resendOtp : async (req,res) => {
        try {
            const generatedOtp = generateOtp();
            const email = req.session.userEmail;

            const mailOptions = {
                from : AUTH_EMAIL,
                to : email,
                subject : "vistaVogue registration OTP",
                html :  `<p>Hello new user, use this OTP to verify your email and continue:</p>
                <p style="color:tomato;font-size:25px;letter-spacing:2px;">
                <b>${generatedOtp}</b></p>`,
            };

            const salt = await bcrypt.genSalt(10);
            const hashedOtp = await bcrypt.hash(generateOtp, salt);

            await User.updateOne({email},{otp : hashedOtp});

            await sendEmail(mailOptions);

            res.status(200).json({message: "OTP resent successfully"})
        }catch (error) {
            res.status(500).json({message: "Error resending OTP "})
        }
    },
}   