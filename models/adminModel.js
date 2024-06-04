    const mongoose = require("mongoose");
    const bcrypt = require('bcrypt');

    const adminSchema = new mongoose.Schema({
        email : {
            type : String,
            required : true,
        },
        password : {
            type : String,
            required : true,    
        }
    });

    adminSchema.pre('save' , async (next) => {
        if(this.isModified('password') || this.isNew) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password,salt);
        }
        next()
    })

    adminSchema.methods.comparePassword = async (candidatePassword) => {
        return bcrypt.compare(candidatePassword,this.password)
    };

    const admin = mongoose.model('Admin',adminSchema)

    module.exports = admin;