const profiler = require('../schematics/profile');
const { saveChats, cacheChats, deleteMessage } = require('../utils/chats-offloader');

class ChatManager {
  constructor(io) {
    this.io = io;
    this.chatId = null;
    this.globId = null;
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }
  handleConnection(socket) {
    socket.on('joinRoom', (load) => this.joinRoom(socket, load));
    socket.on('message', (message) => this.handleMessage(message));
    socket.on('delete', (obj) => this.handleDelete(obj));
    socket.on('disconnect', () => this.handleDisconnect());
  }
  joinRoom(socket, load) {
    if (load && load._id) {
      socket.join(load._id);
      this.globId = load._id;
      this.chatId = load.chatLoad;
      saveChats(this.chatId);
    } else {
      console.log('Error: load object is undefined or missing _id');
    }
  }
  async handleMessage(message) {
    if (message && message.content && message.author) {
      this.chatId = message.room.chat_id;
      this.io.to(this.globId).emit('messageCreate', message);
      cacheChats(this.chatId, message);
    }
  }
  async handleDelete(obj) {
    let handle = await deleteMessage(obj.id, obj.by, this.chatId);
    if (handle.code === 'MESSAGE_DELETED') {
      this.io.to(this.globId).emit('messageDelete', obj);
    }
  }
  handleDisconnect() {
    saveChats(this.chatId);
  }
}

module.exports = (io) => new ChatManager(io);