const Chat = require('../schematics/chats');

function isMatchFn(chats, svdChatsFromDB) {
  console.log('Fn invoked');
  for (const chatFromDB of svdChatsFromDB) {
    for (const localChat of chats) {
      if (localChat.content.text === chatFromDB.content.text &&
        Number(localChat.content.timestamp) === Number(chatFromDB.content.timestamp) && // Convert timestamp to number
        localChat.sender === chatFromDB.sender) {
        return true;
      }
    }
  }
  return false;
}

async function saveChats(id, chats) {
  if (!chats || !chats.length) return;
  try {
    let chat = await Chat.findById(id);
    if (!chat) {
      console.log('No chat found with the given ID:', id);
      return;
    }
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
        });
      });
      await chat.updateOne({ 
        $push: { 
          svd_chats: { $each: toInsertArray } 
        }
      });
    }
  } catch (error) {
    console.error('Error saving chats:', error);
  }
}

module.exports = saveChats;