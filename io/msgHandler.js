const { Chats } = require('../models/message');

const msgHandler = (io) => async ({ msg, room, username, price }) => {
  try {
    const date = Date.now();
    const newChat = await Chats.create({
      msg,
      author: username,
      price,
      room,
      date,
    });

    io.to(room).emit('msg', [
      {
        _id: newChat._id,
        msg: newChat.msg,
        author: username,
        price: newChat.price,
        date: newChat.date,
      },
    ]);
  } catch (err) {
    console.log(err);
  }
};

module.exports = msgHandler;
