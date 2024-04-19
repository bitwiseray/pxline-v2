const Chat = require('../schematics/chats');

async function saveChats(id, chats) {
  const chatModel = await Chat.findById(id);
  const toAppendArray = [];
  chats.forEach(chat => {
    toAppendArray.push({
      message: chat.content,
      sender: chat.chat.id,
      attachments: chat.attachments || null
    });
  });

  console.log(toAppendArray);

  // Appending `toAppendArray` to the Chat model's `svd_chats` array
  chatModel.svd_chats = chatModel.svd_chats.concat(toAppendArray);
  await chatModel.save();
}

module.exports = saveChats;