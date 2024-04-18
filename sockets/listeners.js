// socketEvents.js
module.exports = async function(io) {
  io.on('connection', (socket) => {
    console.log('A user connected');
    // Define your event listeners here
    socket.on('message', message => {
      socket.broadcast.emit('chat-message', message);
    })
    // Add more event listeners as needed
  });
};