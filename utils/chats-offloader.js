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
  try {
    let chat = await Chat.findById(id);
    const chats = Cache.get(id);
    if (!chat || !chats) {
      return { status: 'Failed', code: 'NOT_FOUND', error: 'No cached entry or global entry for the provided id found' };
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
    return { status: 'Failed', status: 'SYSTEM_ERROR', error: error };
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
  if (!chat) return { status: 'Failed', code: 'NOT_FOUND', error: 'No message object found' };;
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

async function deleteMessage(id, by, chatId) {
  if (id && by) {
    let cache = Cache.get(chatId);
    let thisCacheMessage = cache.svd_chats.find(message => message.author.id == by);
    if (thisCacheMessage) {
      // remove the `thisCacheMessage` object of the chat from `cache` entry within the `svd_chats` array
      cache.svd_chats = cache.svd_chats.filter(message => message.author.id !== by);
      return { status: 'Success', code: 'MESSAGE_DELETED', error: null };
    } else {
      let chatsGlob = await Chat.findById(chatId);
      let thisMessage = chatsGlob.svd_chats.find(message => message._id == id && message.sender == by);
      // remove the `thisMessage` object from the array of message objects `chatsGlob` `svd_chats` array
      chatsGlob.svd_chats = chatsGlob.svd_chats.filter(message => !(message._id == id && message.sender == by));
      return { status: 'Success', code: 'MESSAGE_DELETED', error: null };
    }
  } else {
    return { status: 'Failed', code: 'INVALID_DATA', error: 'No cached entry or global entry for the provided id found' };
  }
}

module.exports = { saveChats, cacheChats, deleteMessage };