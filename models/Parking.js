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
    },
    Opening_Times: {
        type: String,
        required: true
    },
    Closing_Times: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Reservation_Price: {
        type: Number,
        required: true
    },
    Features: {
        type: String,
        default: "No height restrictions",
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Parking', Parking)
