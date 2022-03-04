const mongoose = require('mongoose');
// const config = require('config');
// const db = config.get('mongoURI');
// const db = 'mongodb://localhost:27017/database';

const username = "uvuew_user";
const password = "uvuew123";
// const cluster = "cluster0.h5zyb";
const cluster = "cluster0.nw5o3";
const dbname = "database";

// mongodb+srv://uvuew_user:uvuew123@cluster0.h5zyb.mongodb.net/database?retryWrites=true&w=majority
const db = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;

// const db = 'mongosh "mongodb+srv://cluster0.h5zyb.mongodb.net/database" --username <username>';
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('db error', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
