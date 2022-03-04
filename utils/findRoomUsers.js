const { Rooms, User } = require('../models/message');

const findRoomUsers = async (room) => {
  const roomInfo = await Rooms.findOne({ room });
  const roomUsers = await User.find({ _id: { $in: roomInfo.users } });
  const usersInfo = roomUsers.map(({ username }) => username);
  return usersInfo;
};

module.exports = findRoomUsers;
