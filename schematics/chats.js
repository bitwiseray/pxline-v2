const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  svd_chats: [
    {
      message: String,
      sender: String,
      attachments: String
    },
  ],
});

const Chat = mongoose.model("chats", chatSchema);

module.exports = Chat;