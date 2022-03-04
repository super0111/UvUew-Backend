const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // content: {
  //   type: String,
  // },
  comments: {
    type: String,
  },
  userId: {
      // type: mongoose.Types.ObjectId,
      type: String,
      // ref: 'user'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('comments', UserSchema);
