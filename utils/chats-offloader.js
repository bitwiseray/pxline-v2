const Chat = require('../schematics/chats');

async function saveChats(id, chats) {
  if (!chats || !chats.length) return;
  try {
    const chat = await Chat.findById(id);
    const toInsertArray = [];
    chats.forEach(newChat => {
      if (chat.svd_chats.some(existingChat => (
        existingChat.content.text === newChat.content.text &&
        existingChat.content.timestamp === newChat.content.timestamp &&
        existingChat.sender === newChat.author.id
      ))) {
        return true;
      }
      toInsertArray.push({
        content: { text: newChat.content.text || null, timestamp: newChat.content.timestamp },
        sender: newChat.author.id,
        attachments: newChat.attachments || null
      });
    });
    
    await chat.updateOne({ _id: id }, { 
      $push: { 
        svd_chats: { $each: toInsertArray } 
      }
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = saveChats;