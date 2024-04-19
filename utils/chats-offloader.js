const Chat = require('../schematics/chats');

async function saveChats(id, chats) {
  const chatModel = await Chat.findById(id);
  const toInsertArray = [];
  chats.forEach(chat => {
    toInsertArray.push({
      content: chat.content || null,
      sender: chat.chat.id,
      attachments: chat.attachments || null
    });
  });

  await Chat.updateOne({ _id: id }, { 
    $push: { 
      svd_chats: { $each: toInsertArray } 
    } 
  });
}

module.exports = saveChats;