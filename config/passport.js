const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
require('dotenv').config()

passport.use(   
    new GoogleStrategy(
        {
            clientID : process.env.CLIENT_ID,
            clientSecret : process.env.CLIENT_SECRET,
            callbackURL : "http://localhost:4000/auth/google/callback",
            scope : ["profile","email"],
            promp : "select account",
        },
        (accessToken , refreshToken , profile , callback) => {
            callback(null,profile);
        }
    )
);


passport.serializeUser((user,done) => {
    done(null , user);
});

passport.deserializeUser((user,done) => {
    done(null , user);
});