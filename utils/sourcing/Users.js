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
  
  async function loadUser(target, meId) {
    try {
      const user = await profiler.findById(target, '_id user_name display_name image chats createdAt socials');
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
  
const UserSources = {
    loadUser: loadUser,
    getUsersWithId: getUsersWithId
}

module.exports = UserSources;