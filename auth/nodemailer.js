    const nodemailer = require("nodemailer");
    require("dotenv").config();
    const {AUTH_EMAIL,AUTH_PASS} = process.env;


        // create a transporter
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : AUTH_EMAIL,  
                pass : AUTH_PASS
            }
        });

        // transporter verify
        transporter.verify((err,success) => {
            if(err){
                console.log("error verifying user",err);
            }else
            console.log("ready to send email");
            console.log(success);
        });

        // function to send email
        const sendEmail = async (mailOptions) => {
            try {
                await transporter.sendMail(mailOptions);
                console.log("Email sent successfully");
            } catch (err) {
                console.log("error sending email",err);
            }
        };


        module.exports = sendEmail;