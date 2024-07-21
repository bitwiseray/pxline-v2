const mongoose = require('mongoose');

const rooms_schema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  icon: { type: String },
  members: { type: Array },
  roles: { type: Object },
  settings: { type: Object },
  createdAt: { type: Number },
  socials: { bio: String },
  chats: { chat_id: String, chat_type: String },
});

const Room = mongoose.model('rooms', rooms_schema);
module.exports = Room;
