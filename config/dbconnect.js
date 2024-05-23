const mongoose=require('mongoose')
require("dotenv").config()


function connect(){
    
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("database successfully connected");
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports={connect}