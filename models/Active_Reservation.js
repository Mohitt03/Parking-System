const mongoose = require('mongoose')
const Schema = mongoose.Schema
var Parking_Reservation = new Schema({
    Username: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    spot: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    Arriving: {
        type: String,
        required: true
    },
    Leaving: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Time: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Parking_Reservation', Parking_Reservation)