const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  svd_chats: [
    {
      content: { text: String, timestamp: String },
      sender: String,
      attachments: String
    },
  ],
});

const Chat = mongoose.model("chats", chatSchema);

module.exports = Chat;