const nodemailer = require("nodemailer");
require('dotenv').config();
const {AUTH_EMAIL,AUTH_PASS} = process.env;

// create a transporter
let mailTransporter = nodemailer.createTransport({
    service : 'Gmail',
    auth : {
        user : AUTH_EMAIL,
        pass : AUTH_PASS,
    },
    tls : {
        rejectUnauthorized : false
    }
});

// verify transport configuration
mailTransporter.verify((error,success) => {
    if(error) {
        console.log("Error verifying transporter : ",error);
    } else {
        console.log("Transporter is ready to send Emails");
        console.log(success);
    }
})

// send the email
const sendEmail = async (mailOptions) => {
    try {
        await mailTransporter.sendMail(mailOptions);
        console.log("Email send successfully");
    } catch (err) {
        console.log("Error sending the email :",err);
    }
}

module.exports = sendEmail