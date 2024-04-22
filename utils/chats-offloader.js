const Chat = require('../schematics/chats');

async function saveChats(id, chats) {
  if (!chats) return;
  try {
     const toInsertArray = [];
     chats.forEach(chat => {
      toInsertArray.push({
        content: chat.content || null,
        sender: chat.author.id,
        attachments: chat.attachments || null
      });
  });
  await Chat.updateOne({ _id: id }, { 
    $push: { 
      svd_chats: { $each: toInsertArray } 
    }
  });
  } catch (error) {
     console.error(error);
  }
}

module.exports = saveChats;