const profiler = require('../../schematics/profile');
const Room = require('../../schematics/rooms');
const Chat = require('../../schematics/chats');

/**
 * Loads full room from Id
 * @param {String} id ObjectId of the room
 * @returns {Object} Object of the full room
 */
async function loadRoom(id, loads) {
    try {
        const room = await Room.findById(id);
        if (!room) {
        return null;
        }
        const chats = await Chat.findById(room.chats.chat_id);
        const members = await profiler.find({ _id: { $in: room.members } }, loads);
        return { room, chats, members };
    } catch (error) {
        console.error('Error fetching room and chats:', error);
        return null;
    }
}

async function addToRoom(userId, room) {
    return new Promise(async (resolve, reject) => {
        try {
            if (room.members.includes(userId)) {
                return reject({ status: 'halted', error: 'User is already an member, cannot add.' });
            }
            const user = await profiler.findById(userId);
            room.members.push(userId.toString());
            user.chats.push({ chat_id: room._id.toString(), chat_type: 'room' });
            await room.save();
            await user.save();
            resolve({ status: 'success' });
        } catch (error) {
            reject({ status: 'failed', error: error });
        }
    });
}

async function removeMemberFromRoom(userId, roomId) {
    try {
        const room = await Room.findById(roomId);
        const user = await profiler.findById(userId);
        const roomIndex = room.members.indexOf(user._id);
        if (roomIndex > -1) {
            room.members.splice(roomIndex, 1);
        }
        const chatIndex = user.chats.findIndex(chat => chat.chat_id === roomId);
        if (chatIndex > -1) {
            user.chats.splice(chatIndex, 1);
        }
        await Promise.all([room.save(), user.save()]);
        return { status: 'success' };
    } catch (error) {
        throw { status: 'failed', error: error };
    }
}

async function getRoomsFromChats(ids) {
    try {
      const rooms = await Room.find({ _id: { $in: ids } }, '_id title icon members settings chats');
      return rooms;
    } catch (error) {
      console.error('Error fetching rooms:', e);
      return null;
    }
  }

RoomSources = {
    loadRoom: loadRoom,
    removeMemberFromRoom: removeMemberFromRoom,
    addToRoom: addToRoom,
    getRoomsFromChats: getRoomsFromChats
}

module.exports = RoomSources;