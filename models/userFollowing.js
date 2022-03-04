const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    viewId: {
      type: String,
    },
    creatorId: {
        type: String,
    },
    status: {
        type: Boolean,
    },
});

module.exports = mongoose.model('UserFollowing', UserSchema);
