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

function handleCache(forId, handle) {
  if (handle === 'delete') {
    Cache.delete(forId);
  } else if (handle === 'create') {
    Cache.set(forId, {
      timestamp: Date.now(),
      svd_chats: []
    });
  }
}

function cacheChats(id, chat) {
  if (!chat) return;
  if (!Cache.has(id)) {
    handleCache(id, 'create');
  }
  const toAppendObj = {
    content: {
      text: chat.content.text,
      timestamp: chat.content.timestamp,
    },
    sender: chat.author.id,
    attachments: chat.attachments
  };
  const existingCache = Cache.get(id);
  existingCache.svd_chats.push(toAppendObj);
  Cache.set(id, existingCache);
}

module.exports = { saveChats, cacheChats };