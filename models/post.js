const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userID: {
    type: String,
  },
  contentImg: {
    type: String,
  },
  description: {
    type: String,
    // required: true
  },
  price: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
  },
  comments: [
    { type : mongoose.Schema.Types.ObjectId, ref: 'comments' }
  ],
  tips: [
    { type : mongoose.Schema.Types.ObjectId, ref: 'tip' }
  ],
  likes: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'like'}
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('post', UserSchema);
