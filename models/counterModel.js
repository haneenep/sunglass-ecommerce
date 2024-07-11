const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema(
    {

    model : {
        type : String,
        required : true,
        unique : true
    },
    field : String,
    count : {
        type : Number,
        default : 1000,
        required : true
    }
}
)

module.exports = mongoose.model("counter",CounterSchema);