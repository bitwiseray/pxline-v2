const { saveChats, cacheChats } = require('../utils/chats-offloader');
const Chat = require('../schematics/chats');

module.exports = async (io) => {
  let chats = [];
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
        chats.push(message);
        chatId = message.chat.chat_id;
      }
      io.to(globId).emit('messageCreate', message);
      cacheChats(chatId, chats);
    });
    socket.on('delete', async obj => {
      if (obj && obj.id) {
        let thisLocalMessage = chats.find(message => message.author.id == obj.deletedBy);
        let chatsGlob = await Chat.findById(chatId);
        let thisMessage = chatsGlob.svd_chats.find(message => message._id == obj.id && message.sender == obj.deletedBy)
        if (thisMessage || thisMessage) {
          chats = chats.filter(chat => chat.id !== obj.id);
          io.to(globId).emit('messageDelete', obj);
          cacheChats(chatId, chats);
        }
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