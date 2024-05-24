const express = require('express');
const router = express.Router();
const RoomSources = require('../utils/sourcing/Rooms');
const UserSources = require('../utils/sourcing/Users');
const { getIndexes, uploadMedia, getLastMessages, loadFriends } = require('../utils/sourcing');
const { checkAuth, checkNotAuth } = require('../preval/validators');

router.get('/indexes', async (request, reply) => {
  try {
    const offload = await getIndexes(request.user);
    let collectedIds = [];
    offload.rooms.forEach(room => {
      collectedIds.push(room.chats.chat_id);
    });
    offload.users.forEach(user => {
      let obj = user.chats.find(thisObj => thisObj.user_id == request.user._id);
      if (obj) {
        collectedIds.push(obj.chat_id);
      }
    });
    const lastMessages = await getLastMessages(collectedIds);
    const friends = await loadFriends(request.user.socials.friends);
    let toSendData = {
      user: request.user,
      extusers: offload.users,
      extrooms: offload.rooms,
      lastMessages: lastMessages,
      friends: friends
    }
    reply.status(200).json(toSendData);
  } catch (e) {
    request.flash('error', 'Something went wrong');
    reply.status(500).send({ message: 'Something went wrong' });
    console.error({ at: '/', error: e });
  }
});

module.exports = router;