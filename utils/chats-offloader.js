const Chat = require('../schematics/chats');

async function saveChats(id, chats) {
  if (!chats || !chats.length) return;
  try {
    let chat = await Chat.findById(id);
    if (!chat) return;
    const toInsertArray = [];
    const noneMatch = chats.every(newChat => {
      if (!chat.svd_chats.some(existingChat => (
        existingChat.content.text === newChat.content.text &&
        existingChat.content.timestamp === newChat.content.timestamp &&
        existingChat.sender === newChat.author.id
      ))) {
        toInsertArray.push({
          content: { text: newChat.content.text || null, timestamp: newChat.content.timestamp },
          sender: newChat.author.id,
          attachments: newChat.attachments || null
        });
        return true;
      }
      return false;
    });
    if (noneMatch) {
      await chat.updateOne({ _id: id }, { 
        $push: { 
          svd_chats: { $each: toInsertArray } 
        }
      });
      const currentDate = Date.now()
      chat.timestamp = currentDate;
      /*
      chat.forEach(nowChat => {
        if (currentDate - nowChat.timestamp > 24 * 60 * 60 * 1000) {
          nowChat.svd_chats = [];
        }
      });
      */
      await chat.save();
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = saveChats;