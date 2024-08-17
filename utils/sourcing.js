const profiler = require('../schematics/profile');
const Room = require('../schematics/rooms');
const Chat = require('../schematics/chats');
const { put } = require('@vercel/blob');
const RoomSources = require('./sourcing/Rooms');
const UserSources = require('./sourcing/Users');
const { clearCache } = require('./upload-sys');

/**
 * Load basic indexs of chats related to user
 * @param {Object} user Object of the user
 * @returns {Array} basic Object of chats indexs related to user
 */
async function getIndexes(user) {
  if (!user || !user.chats) return {};
  const roomChatIds = user.chats.filter(chat => chat.chat_type === 'room').map(chat => chat.chat_id);
  const rooms = await RoomSources.getRoomsFromChats(roomChatIds);
  const chatIds = user.chats.map(chat => chat.user_id || chat.chat_id);
  const users = await UserSources.getUsersWithId(chatIds);
  return { rooms, users };
}

async function checkChats(userId, targetId) {
  try {
    if (userId && targetId) {
      const user = await profiler.findById(userId, '_id chats');
      const targetUser = await profiler.findById(targetId, '_id chats');
      const commonChat = user.chats.some(userChat => 
        targetUser.chats.some(targetChat => 
          userChat.chat_id === targetChat.chat_id && userChat.chat_type === 'DM'
        )
      );
      if (commonChat) {
        return { status: 'halted', code: 'CHAT_EXISTS', error: null };
      } else {
        const newId = await Chat.create({
          timestamp: Date.now(),
          svd_chats: []
        });
        user.chats.push({
          user_id: targetId,
          chat_type: 'DM',
          chat_id: newId.id
        });
        targetUser.chats.push({
          user_id: userId,
          chat_type: 'DM',
          chat_id: newId.id
        });
        await targetUser.save();
        await user.save();
        return { status: 'success', code: 'CHAT_CREATED', error: null };
      }
    }
  } catch (error) {
    return { status: 'failed', code: 'SYSTEM_ERROR', error: error };
  }
}

async function loadFriends(base) {
  const friendsDetails = await Promise.all(base.map(async (friendObj) => {
    const friendData = await UserSources.loadUser(friendObj.friend);
    return friendData;
  }));
  return friendsDetails;
};

async function uploadMedia(type, offload, stream, request) {
  return new Promise(async (resolve, reject) => {
    try {
      if (type === 'profile') {
        if (offload.size > 4 * 1024 * 1024) {
          reject({ error: 'File size exceeds the limit' });
        }
        const blob = await put(`profile/${offload.filename}`, stream, { contentType: offload.mimetype || 'image/jpeg', access: 'public' });
        resolve({ status: 'done', url: blob.url });
      } else {
        if (offload.size > 4 * 1024 * 1024) {
          reject({ error: 'File size exceeds the limit' });
        }
        const blob = await put(`attachment/${offload.filename}`, stream, { contentType: offload.mimetype || 'image/jpeg', access: 'public' });
        resolve({ status: 'done', url: blob.url });
      }
      clearCache();
    } catch (error) {
      console.log(error)
      reject(error)
    }
  });
}

async function checkIdType(id) {
  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return;
    const user = await profiler.findOne({ _id: id });
    if (user) {
      return 'user';
    }
    const room = await Room.findOne({ _id: id });
    if (room && room.members) {
      return 'room';
    }
    return null;
  } catch (error) {
    console.error('Error checking ID type:', error);
    return null;
  }
}

async function getLastMessages(entityIds) {
  let toReturnArray = [];
  await Promise.all(entityIds.map(async (entity) => {
    if (entity) {
      let chat = await Chat.findById(entity.toString());
      if (!chat) return { message: 'Chat does not exist' };
      const lastObj = chat.svd_chats[chat.svd_chats.length - 1];
      if (!lastObj) return toReturnArray.push([]);
      const username = await profiler.findById(lastObj.sender, 'display_name');
      toReturnArray.push({
        lastFor: entity,
        content: lastObj.content.text,
        createdAt: lastObj.content.timestamp,
        sender: username.display_name,
      });
    }
  }));
  return toReturnArray;
}

module.exports = { getIndexes, uploadMedia, getLastMessages, loadFriends, checkChats, checkIdType };