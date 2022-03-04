const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  name: {
    type:String,
  },
  email: {
      type: String,
  },
  message: {
      type: String,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('likes', UserSchema);
