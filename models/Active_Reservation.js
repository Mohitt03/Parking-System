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
    },
    Payment: {
        status: {
            type: String,
            required: true
        },
        Payment_Method: {
            type: String,
            required: true
        },
        Card: {
            card_number: {
                type: Number
            },
            card_expiry: {
                type: Number
            },
            cvc: {
                type: Number
            },
            card_name: {
                type: String
            }
        },
        upi_payment: {
            upi_id: {
                type: String
            }
        }

    }

},

    {
        timestamps: true
    }
)
// Define function to check if reservation has expired
// Parking_Reservation.methods.isExpired = function() {
//     const now = moment();
//     const reservationEnd = moment(this.reservationTime).add(this.reservationDuration, 'minutes');
//     return now.isAfter(reservationEnd);
//   };
module.exports = mongoose.model('Parking_Reservation', Parking_Reservation)