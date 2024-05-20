const profiler = require('../schematics/profile');
const Room = require('../schematics/rooms');
const Chat = require('../schematics/chats');
const Media = require('../schematics/media');
const mongoose = require('mongoose');

const RoomSources = require('./sourcing/Rooms');
const UserSources = require('./sourcing/Users');

/**
 * Load basic indexs of chats related to user
 * @param {Object} user Object of the user
 * @returns {Array} basic Object of chats indexs related to user
 */
async function getIndexes(user) {
  if (!user || !user.chats) return {};
  const roomChatIds = user.chats
    .filter(chat => chat.chat_type === 'room')
    .map(chat => chat.chat_id);
  const rooms = await RoomSources.getRoomsFromChats(roomChatIds);
  const chatIds = user.chats.map(chat => chat.user_id || chat.chat_id);
  const users = await UserSources.getUsersWithId(chatIds);
  return { rooms, users };
}

async function checkChats(entityId, forChat) {
  if (forChat.type === 'user') {
    const userChats = await profiler.findById(entityId).chats;
    if (userChats.find(thisObj => thisObj.user_id == forChat.targetId)) {
      return true;
    } else {
      const newId = await Chat.create({
        timestamp: Date.now(),
        svd_chats: []
      });
      userChats.push({
        user_id: forChat.user_id,
        chat_type: 'DM',
        chat_id: newId.id
      });
      userChats.save();
    }
  } else {
    const roomChat = await Room.findById(entityId).chats;
    if (roomChat.chat_id) {
      return true;
    } else {
      const newId = await Chat.create({
        timestamp: Date.now(),
        svd_chats: []
      });
      roomChat.push({
        chat_type: 'room',
        chat_id: newId.id
      });
      userChats.save();
    }
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
      const domain = `https://${request.get('host')}`;
      if (type === 'profile') {
        if (offload.size > 5 * 1024 * 1024) {
          reject({ error: 'File size exceeds the limit' });
        }
        const loadPff = await Media.create({
          loadType: type,
          data: stream,
          contentType: offload.mimetype
        });
        resolve({ status: 'done', url: `${domain}/cdn/${loadPff._id}`, id: loadPff._id });
      } else {
        if (offload.size > 10 * 1024 * 1024) {
          reject({ error: 'File size exceeds the limit' });
        }
        const loadAtt = await Media.create({
          loadType: type,
          data: stream,
          contentType: offload.mimetype,
          filename: offload.filename,
          createdAt: Date.now()
        });
        resolve({ status: 'done', url: `${domain}/cdn/${loadAtt._id}`, id: loadAtt._id });
      }
    } catch (error) {
      reject(error)
    }
  });
}

async function addFriend(userId, targetId) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await profiler.findById(userId);
      const target = await profiler.findById(targetId);
      if (user.socials.friends?.includes(targetId) && target.socials.friends?.includes(userId)) {
        reject({ status: 'halted', error: 'Already friends' });
      }
      user.socials.friends.push({
        id: targetId,
        since: Date.now()
      });
      target.socials.friends.push({
        id: userId,
        since: Date.now()
      });
      await user.save();
      await target.save()
      resolve({ status: 'success' });
    } catch (error) {
      reject({ status: 'failed', error: error });
    }
  });
}

async function checkIdType() {
  try {
    if (!this.match(/^[0-9a-fA-F]{24}$/)) return;
    const user = await profiler.findOne({ _id: this });
    if (user) {
      return 'user';
    }
    const room = await Room.findOne({ _id: this });
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
      if (!chat) return { message: 'Chat does not exist'};
      const lastObj = chat.svd_chats[chat.svd_chats.length - 1];
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

String.prototype.checkIdType = checkIdType;
module.exports = { getIndexes, uploadMedia, getLastMessages, loadFriends, checkChats };