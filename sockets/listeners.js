const saveChat = require('../utils/chats-offloader');

module.exports = async function(io) {
  let chats = [];
  let chatId;
  io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('message', message => {
      socket.join(message.chat.id);
      socket.broadcast.to(message.chat.id).emit('chat-message', message);
      chats.push(message);
      chatId = message.chat.chat_id;
    });
    socket.on('disconnect', () => {
      saveChat(chatId, chats);
      console.log('A user disconnected');
    });
  });
};