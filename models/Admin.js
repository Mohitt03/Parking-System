const mongoose = require('mongoose')
const Schema = mongoose.Schema
var AdminData = new Schema({


    Customer: {
        name: {
            type: String,
            required: true
        },
        Product_Sold: {
            type: String,
            required: true
        },
        Price: {
            type: Number,
            required: true
        },
        TotalCustomer: {
            type: Number,
            required: true
        }
    },
    Revenue: {
        type: Number,
        required: true
    },
    Sales: {
        Product_name: {
            type: String,
            required: true
        },
        Total_Sales: {
            type: Number,
            required: true
        },
        Product_Sold: {
            type: String,
            required: true
        },
        Price: {
            type: Number,
            required: true
        },
        TotalCustomer: {
            type: Number,
            required: true
        }
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

module.exports = mongoose.model('AdminData', AdminData)
