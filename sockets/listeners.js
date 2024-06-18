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
        saveChats(chatId);
      } else {
        console.log('Error: load object is undefined or missing _id');
      }
    });
    socket.on('message', async message => {
      if (message && message.content && message.author) {
        chatId = message.room.chat_id;
      }
      io.to(globId).emit('messageCreate', message);
      cacheChats(chatId, message);
    });
    socket.on('delete', async obj => {
      let handle = await deleteMessage(obj.id, obj.by, chatId);
      if (handle.code === 'MESSAGE_DELETED') {
        io.to(globId).emit('messageDelete', obj);
      }
    });
    socket.on('disconnect', () => {
      saveChats(chatId);
    });
  });
};