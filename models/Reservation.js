const mongoose = require('mongoose')
const Schema = mongoose.Schema
var Parking_Reservation = new Schema({
    Username: {
        type: String
    },
    spot: {
        type: Number
    },
    address: {
        type: String
    },
    date: {
        type: String
    },
    Entry_time: {
        type: String
    },
    Exit_time: {
        type: String
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Parking_Reservation', Parking_Reservation)