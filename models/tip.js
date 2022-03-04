const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
      // type: mongoose.Types.ObjectId,
      type: String,
      // ref: 'user'
  },
  tipPrice: {
    type: String,
  },
  tipMessage: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('tip', UserSchema);
