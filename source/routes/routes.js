const express = require('express');
const router = express.Router();
const passport = require('passport');
const initGateway = require('../utils/strategy');
const bcrypt = require('bcrypt');
const profiler = require('../schematics/profile');
const Chat = require('../schematics/chats');
const Rooms = require('../schematics/rooms');
const fs = require('fs');

initGateway();
router.get('/', checkAuth, async (request, reply) => {
  const users = await getIdsFromChats(request.user);
  reply.render('index', { user: request.user, extchats: users });
});

router.get('/login', checkNotAuth, (request, reply) => {
  reply.render('login');
});

router.post('/login', checkNotAuth, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/signup', checkNotAuth, (request, reply) => {
  reply.render('signup');
});

router.get('/chat/:id/:room', checkAuth, async (request, reply) => {
  const id = request.params.id;
  const room = request.params.room;
  if (room == "true") {
    const room = await Rooms.findById(id, ('_id room_title room_icon members'));
    const users = await getIdsFromChats(room.members);
    const chats = await Chat.findById(room.chat_id, ('_id timestamp svd_chats'));
    reply.render('chat', { extChatType: 'room', extusers: users, extroom: room, chats: chats });l;
  } else {
    const user = await profiler.findById(id, ('_id chat_id display_name user_name image'));
    const chatObject = request.user.chats.find(chat => chat.user_id === id);
    if (!chatObject) {
      reply.redirect('/');
    } else {
      const userChats = await Chat.findById(chatObject.chat_id) || null;
      reply.render('chat', { extChatType: 'DM', extuser: user, chats: userChats, extroom: null, load: [user, request.user]});;
    }
  }
});

router.post('/signup', checkNotAuth, async (request, reply) => {
  const { display_name, username, password, image } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await profiler.create({
      user_name: username,
      display_name: display_name,
      password: hashedPassword,
      image: image,
    });
    reply.redirect('/');
});

router.delete('/logout', checkAuth, (request, reply) => {
  request.logOut();
  reply.redirect('/');
});

function checkAuth(request, reply, next) {
  if(request.isAuthenticated()) {
    next();
  } else {
    return reply.redirect('/login');
  }
}

function checkNotAuth(request, reply, next) {
  if (request.isAuthenticated()) {
    return reply.redirect('/');
  } else {
    next();
  }
}

async function getIdsFromChats(user) {
  if (!user || !user.chats) {
    return [];
  }
  const chatIds = user.chats.map(chat => chat.user_id);
  return getUsersWithId(chatIds);
}

async function getUsersWithId(objectIds) {
  try {
    const users = await profiler.find({ _id: { $in: objectIds } }, '_id user_name display_name image');
    return users;
  } catch (err) {
    console.error('Error fetching users:', err);
    // Handle error
    return [];
  }
}

module.exports = router;
