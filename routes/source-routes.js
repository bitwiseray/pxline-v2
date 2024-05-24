const express = require('express');
const router = express.Router();
const RoomSources = require('../utils/sourcing/Rooms');
const UserSources = require('../utils/sourcing/Users');
const { getIndexes, uploadMedia, getLastMessages, loadFriends } = require('../utils/sourcing');
const { checkAuth, checkNotAuth } = require('../preval/validators');

router.get('/indexes', checkAuth, async (request, reply) => {
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


router.get('/chat/:id/', checkAuth, async (request, reply) => {
  try {
    const id = request.params.id;
    const type = await id.checkIdType();
    if (type === 'room') {
      const offload = await RoomSources.loadRoom(id, '_id display_name user_name image createdAt');
      const toSendData = { 
        extType: 'room', 
        extusers: offload.members, 
        extroom: offload.room, 
        chats: offload.chats, 
        user: request.user 
      }
      reply.status(200).json(toSendData);
    } else {
      const usrOffload = await UserSources.loadUser(id, request.user._id, '_id user_name display_name image chats createdAt');
      const toSendData = { extType: 'DM', extusers: usrOffload.user, chats: usrOffload.chats, extroom: null, user: request.user };
      reply.status(200).json(toSendData);
    }
  } catch (e) {
    request.flash('error', 'Something went wrong');
    reply.status(500).send({ message: 'Something went wrong' });
    console.error({ at: '/', error: e });
  }
});

module.exports = router;