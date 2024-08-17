const express = require('express');
const multer = require('multer');
const router = express.Router();
const RoomSources = require('../utils/sourcing/Rooms');
const UserSources = require('../utils/sourcing/Users');
const { getIndexes, uploadMedia, getLastMessages, loadFriends, checkChats, checkIdType } = require('../utils/sourcing');
const { checkAuth, checkNotAuth } = require('../preval/validators');
const { storage, clearCache } = require('../utils/upload-sys');
const fs = require('fs');
const path = require('path');

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
    const type = await checkIdType(id);
    if (type === 'room') {
      const offload = await RoomSources.loadRoom(id);
      const toSendData = { 
        type: 'room', 
        extusers: offload.members, 
        room: offload.room, 
        chats: offload.chats, 
        user: request.user 
      }
      reply.status(200).json(toSendData);
    } else {
      await checkChats(request.user._id.toString(), id, 'DM');
      const usrOffload = await UserSources.loadUser(id, request.user._id, '_id user_name display_name image chats createdAt');
      const toSendData = { 
        type: 'DM', 
        extusers: usrOffload.user, 
        chats: usrOffload.chats, 
        room: null, 
        user: request.user 
      };
      reply.status(200).json(toSendData);
    }
  } catch (e) {
    request.flash('error', 'Something went wrong');
    reply.status(500).send({ message: 'Something went wrong' });
    console.error({ at: '/', error: e });
  }
});

const upload = multer({ storage: storage });
router.post('/media', upload.single('upload'), async (request, reply) => {
  try {
    const upload = await uploadMedia('attachment', request.file, fs.readFileSync(path.join(__dirname, '../tmp', request.file.filename)), request);
    const responseData = {
      url: upload.url || null,
    };
    reply.status(200).json(responseData);
    clearCache();
  } catch (error) {
    console.log(error)
    reply.status(500).send('Error uploading file');
  }
});

module.exports = router;