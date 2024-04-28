const saveChat = require('../utils/chats-offloader');

module.exports = async (io) => {
  let chats = [];
  let chatId;
  let globId;
  io.on('connection', (socket) => {
    console.log('A user online');
    socket.on('joinRoom', load => {
      if (load && load._id) {
        socket.join(load._id);
        globId = load._id;
        console.log('A user joined the room', load); // Confirming the load object
      } else {
        console.log('Error: load object is undefined or missing _id');
      }
    });

    socket.on('message', async message => {
      console.log('Message received for ', message);
      io.to(globId).emit('messageAdd', message, (cb) => {
        console.log(cb);
      });
    });
    
    socket.on('messageTyping', payload => {
      socket.broadcast.to(globId).emit('messageTyping', payload);
    });

    socket.on('disconnect', () => {
      // saveChat(chatId, chats);
      console.log('A user disconnected from chat');
    });
  });
};