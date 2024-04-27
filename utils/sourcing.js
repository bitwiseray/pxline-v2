const profiler = require('../schematics/profile');
const Room = require('../schematics/rooms');
const Chat = require('../schematics/chats');
const Media = require('../schematics/media');
const fs = require('fs');

async function getIndexes(user) {
  if (!user || !user.chats) {
    return {};
  }
  
  const roomChatIds = user.chats
    .filter(chat => chat.chat_type === 'room')
    .map(chat => chat.chat_id);
  const rooms = await getRoomsFromChats(roomChatIds);
  const chatIds = user.chats.map(chat => chat.user_id || chat.chat_id);
  const users = await getUsersWithId(chatIds);
  return { rooms, users };
}

async function getUsersWithId(objectIds) {
  try {
    const users = await profiler.find({ _id: { $in: objectIds } }, '_id user_name display_name image chats');
    return users;
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

async function getRoomsFromChats(ids) {
   try {
     const rooms = await Room.find({ _id: { $in: ids } }, '_id title icon members chats');
     return rooms;
   } catch (error) {
     console.error('Error fetching rooms:', e);
     return null;
   }
}

async function loadRoom(id) {
  try {
    const room = await Room.findById(id);
    if (!room) {
      return null;
    }
    const chats = await Chat.findById(room.chats.chat_id);
    const members = await profiler.find({ _id: { $in: room.members }}, '_id display_name user_name image');
    return { room, chats, members };
  } catch (error) {
    console.error('Error fetching room and chats:', error);
    return null;
  }
}

async function loadUser(target, meId) {
  try {
    const user = await profiler.findById(target, '_id user_name display_name image chats');
    if (!user) {
      return null;
    }
    const chatId = user.chats.find(chat => chat.user_id === meId.toString())?.chat_id;
    const chats = await Chat.findById(chatId);
    return { user, chats };
  } catch (error) {
    console.error('Error fetching user and chats:', error);
    return null;
  }
}

async function uploadMedia(type, offload, stream, request) {
  return new Promise(async (resolve, reject) => {
    try {
      const domain = `${request.protocol}://${request.get('host')}`;
      if (type === 'profile') {
        if (offload.size > 5 * 1024 * 1024) {
          reject({ error: 'File size exceeds the limit' });
        }
        const loadPff = await Media.create({
          loadType: type,
          data: stream,
          contentType: offload.mimetype
        });
        resolve({ status: 'done', url: `${domain}/cdn/${loadPff._id}` });
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
        resolve({ status: 'done', url: `${domain}/cdn/${loadAtt._id}` });
      }
    } catch (error) {
      reject(error)
    }
  });
} 

async function checkIdType() {
  try {
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

String.prototype.checkIdType = checkIdType;
module.exports = { getIndexes, loadRoom, loadUser, checkIdType, uploadMedia };