module.exports = async function(io) {
  io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('message', message => {
      socket.broadcast.emit('chat-message', message);
    })
  });
};