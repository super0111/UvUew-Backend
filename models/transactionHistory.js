const mongoose = require('mongoose');

const TransactionHistorySchema = new mongoose.Schema({
    viewId: {
      type: String,
    },
    creatorId: {
        type: String,
    },
    subscribePrice: {
        type: Number,
    },
    tips: [
        { type : mongoose.Schema.Types.ObjectId, ref: 'tip' }
    ],
    coinAmounts: [
        { type : mongoose.Schema.Types.ObjectId, ref: 'coinAmount' }
    ],
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('transactionHistory', TransactionHistorySchema);
