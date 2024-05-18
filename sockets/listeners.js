const { saveChats, cacheChats } = require('../utils/chats-offloader');

module.exports = async (io) => {
  let chats = [];
  let chatId;
  let globId;
  io.on('connection', (socket) => {
    socket.on('joinRoom', load => {
      if (load && load._id) {
        socket.join(load._id);
        globId = load._id;
      } else {
        console.log('Error: load object is undefined or missing _id');
      }
    });
    socket.on('message', async message => {
      if (message && message.content && message.author) {
        chats.push(message);
        chatId = message.chat.chat_id;
      }
      io.to(globId).emit('messageCreate', message);
      cacheChats(chatId, chats);
    });
    socket.on('messageTyping', payload => {
      socket.broadcast.to(globId).emit('typing', payload);
    });
    socket.on('disconnect', () => {
      saveChats(chatId);
    })
  });
};