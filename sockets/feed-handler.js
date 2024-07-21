const { saveChats, cacheChats, deleteMessage } = require('../utils/chats-offloader');
const Chat = require('../schematics/chats');
const profiler = require('../schematics/profile');

module.exports = async (io) => {
  let chatId;
  let globId;
  io.on('connection', (socket) => {
    // we can use this for online/offline status
  });
};