const Chat = require('../schematics/chats');
const { QuickDB } = require("quick.db");
const Cache = new QuickDB();

function isMatchFn(chats, svdChatsFromDB) {
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
  const chats = await Cache.get(id);
  if (!chats) return;
  try {
    let chat = await Chat.findById(id);
    if (!chat) {
      console.log('No chat found with the given ID:', id);
      return;
    }
    const isMatch = isMatchFn(chats.svd_chats, chat.svd_chats);
    console.log({ flag: isMatch });
    if (!isMatch) {
      await chat.updateOne({ 
        $push: { 
          svd_chats: { $each: chats.svd_chats } 
        }
      });
    }
    await Cache.delete(id);
  } catch (error) {
    console.error('Error saving chats:', error);
  }
}

async function setCacheFor(id) {
  Cache.set(id, {
    id: id,
    timestamp: Date.now(),
    svd_chats: []
  });
}

async function cacheChats(id, chats) {
  if (!chats || !chats.length > 0) return;
  try {
    let chat = await Cache.get(id);
    if (!chat) await setCacheFor(id);
    const toInsertArray = [];
    const isMatch = isMatchFn(chats, chat.svd_chats);
    if (!isMatch) {
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
      await Cache.push(`${id}.svd_chats`, ...toInsertArray);
    }
  } catch (error) {
    console.error('Error saving chats:', error);
  }
}
module.exports = { saveChats, cacheChats };