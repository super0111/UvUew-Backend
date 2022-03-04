const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
    userId: {
      type: String,
    },
    country: {
        type: String,
    },
    cardName: {
        type: String,
    },
    cardNumber: {
        type: String,
    },
    expirationDate: {
        type: String,
    },
    cecurityCode: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('paymentMethod', PaymentMethodSchema);
