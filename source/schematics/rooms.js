const mongoose = require('mongoose');

const rooms_schema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  icon: { type: String },
  members: { type: Array },
  chats: { chat_id: String, chat_type: String, total_length: Number },
});

const Room = mongoose.model('rooms', rooms_schema);
module.exports = Room;