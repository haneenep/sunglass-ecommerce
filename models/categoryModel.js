const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    isActive : {
        type : Boolean,
        required : true
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    
})

const category = mongoose.model('categorys',categorySchema);

module.exports = category;