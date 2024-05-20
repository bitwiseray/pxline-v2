const Chat = require('../schematics/chats');
const Cache = new Map();

function isMatchFn(chats, svdChatsFromDB) {
  if (!svdChatsFromDB) return false;
  for (const chatFromDB of svdChatsFromDB) {
    for (const localChat of chats) {
      if (localChat.content.text === chatFromDB.content.text &&
        Number(localChat.content.timestamp) === Number(chatFromDB.content.timestamp) &&
        localChat.sender === chatFromDB.sender) {
        return true;
      }
    }
  }
  return false;
}

async function saveChats(id) {
  if (!id) return;
  const chats = Cache.get(id);
  if (!chats) return;
  try {
    let chat = await Chat.findById(id);
    if (!chat) {
      console.log('No chat found with the given ID:', id);
      return;
    }
    const isMatch = isMatchFn(chats.svd_chats, chat.svd_chats);
    if (!isMatch) {
      await chat.updateOne({ 
        $push: { 
          svd_chats: { $each: chats.svd_chats } 
        }
      });
    }
    Cache.delete(id);
  } catch (error) {
    console.error('Error saving chats:', error);
  }
}

function setCacheFor(id) {
  Cache.set(id, {
    id: id,
    timestamp: Date.now(),
    svd_chats: []
  });
}

function cacheChats(id, chats) {
  if (!chats || !chats.length > 0) return;
  let chat = Cache.get(id);
  if (!chat) {
    setCacheFor(id);
    chat = Cache.get(id);
  }
  const toInsertArray = [];
  chats.forEach(message => {
    toInsertArray.push({
      content: {
        text: message.content.text,
        timestamp: message.content.timestamp,
      },
      sender: message.author.id,
      attachments: message.attachments
    });
  });
  // Merge the new chats with existing cached chats
  const existingChats = chat.svd_chats || [];
  const updatedChats = existingChats.concat(toInsertArray);
  Cache.set(id, { ...chat, svd_chats: updatedChats });
}

module.exports = { saveChats, cacheChats };
