const mongoose = require('mongoose');

const { Schema } = mongoose;
mongoose.Promise = global.Promise;
const likeSchema = new Schema({
  userID: {
    type: String,
  },
  postID: {
    type:String,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// module.exports = mongoose.model('likes', UserSchema);
module.exports = mongoose.models.Likes || mongoose.model('Likes', likeSchema);
