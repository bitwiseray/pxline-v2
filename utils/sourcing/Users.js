const profiler = require('../../schematics/profile');
const Room = require('../../schematics/rooms');
const Chat = require('../../schematics/chats');

/**
 * Get multiple users from the database from Array of ids
 * @param {Array} objectIds 
 * @returns 
 */
async function getUsersWithId(objectIds) {
  try {
    const users = await profiler.find({ _id: { $in: objectIds } }, '_id user_name display_name image chats');
    return users;
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

async function loadUser(target, meId, loads) {
  try {
    const user = await profiler.findById(target, loads);
    if (!user) {
      return null;
    }
    if (!meId) {
      return user;
    }
    const chatId = user.chats.find(chat => chat.user_id === meId.toString())?.chat_id;
    const chats = await Chat.findById(chatId);
    return { user, chats };
  } catch (error) {
    console.error('Error fetching user and chats:', error);
    return null;
  }
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

const UserSources = {
  loadUser: loadUser,
  getUsersWithId: getUsersWithId,
  addFriend: addFriend
}

module.exports = UserSources;