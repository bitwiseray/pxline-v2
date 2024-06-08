const { saveChats, cacheChats, deleteMessage } = require('../utils/chats-offloader');
const Chat = require('../schematics/chats');

module.exports = async (io) => {
  let chatId;
  let globId;
  io.on('connection', (socket) => {
    socket.on('joinRoom', load => {
      if (load && load._id) {
        socket.join(load._id);
        globId = load._id;
        chatId = load.chatLoad;
      } else {
        console.log('Error: load object is undefined or missing _id');
      }
    });
    socket.on('message', async message => {
      if (message && message.content && message.author) {
        chatId = message.chat.chat_id;
      }
      io.to(globId).emit('messageCreate', message);
      cacheChats(chatId, message);
    });
    socket.on('delete', async obj => {
      let code = deleteMessage(obj.id, obj.by, chatId);
      if (code === 'MESSAGE_DELETED') {
        io.to(globId).emit('messageDelete', obj);
      }
    });
    socket.on('typing', payload => {
      socket.broadcast.to(globId).emit('typing', payload);
    });
    socket.on('disconnect', () => {
      saveChats(chatId);
    });
  });
};