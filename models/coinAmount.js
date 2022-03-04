const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.Promise = global.Promise;
const CoinAmountsSchema = new Schema({
    viewId: {
        type: String,
      },
      coinAmount: {
        type: Number,
      },
      date: {
        type: Date,
        default: Date.now
      }
});

module.exports = mongoose.models.CoinAmount || mongoose.model('CoinAmount', CoinAmountsSchema);

