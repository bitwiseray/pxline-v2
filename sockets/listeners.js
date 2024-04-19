module.exports = async function(io) {
  io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('message', message => {
      socket.join(message.chat.id);
      socket.broadcast.to(message.chat.id).emit('chat-message', message);
    })
  });
};