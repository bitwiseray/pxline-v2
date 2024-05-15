const mongoose = require('mongoose');

const profile_schema = new mongoose.Schema({
  user_name: { type: String, required: true, unique: true },
  display_name: { type: String },
  socials: {
    friends: Number,
    interactions: Number,
    bio: String 
  },
  password: { type: String, required: true },
  authority: { type: String },
  image: { type: String },
  createdAt: Number,
  chats: [{ chat_id: String, user_id: String, chat_type: String, total_length: Number }],
});

const profiler = mongoose.model('users', profile_schema);
module.exports = profiler;