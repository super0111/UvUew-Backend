const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.Promise = global.Promise;

const UserSchema = new Schema({

// const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
  },
  setupUsername: {
    type: String,
  },
  birth: {
    type: Date,
  },
  viewerAge: {
    type:String,
  },
  IDType: {
    type: String,
  },
  IDFront: {
    type: String,
  },
  IDBack: {
    type: String,
  },
  CategoryType: {
    type: String,
  },
  subscriberPrice: {
    type: Number,
    default: "0",
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// module.exports = mongoose.model('user', UserSchema);
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
