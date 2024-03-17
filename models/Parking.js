const mongoose = require('mongoose')
const Schema = mongoose.Schema
var Parking = new Schema({
    parking_number: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    iframe_link: {
        type: String,
        required: true
    },
    total_spot: {
        type: Number,
        required: true
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Parking', Parking)
