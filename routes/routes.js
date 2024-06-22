const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const initGateway = require('../utils/strategy');
const bcrypt = require('bcrypt');
const profiler = require('../schematics/profile');
const Room = require('../schematics/rooms');
const mongoose = require('mongoose');
const { checkAuth, checkNotAuth } = require('../preval/validators');
const { getIndexes, uploadMedia, getLastMessages, loadFriends } = require('../utils/sourcing');
const { storage, clearCache } = require('../utils/upload-sys');
const RoomSources = require('../utils/sourcing/Rooms');
const UserSources = require('../utils/sourcing/Users');

initGateway();
router.get('/', checkAuth, async (request, reply) => {
  reply.render('index', { user: request.user });
});

router.get('/login', checkNotAuth, (request, reply) => {
  reply.render('login');
});

router.post('/login', checkNotAuth, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/chat', checkAuth, async (request, reply) => {
  reply.render('chat');
});

router.get('/signup', checkNotAuth, (request, reply) => {
  reply.render('signup');
});

const upload = multer({ storage: storage });
router.post('/signup', checkNotAuth, upload.single('image'), async (request, reply) => {
  try {
    const { display_name, username, password } = request.body;
    if (username === await profiler.findOne({ username })) {
      request.flash('error', 'Username already exists');
      return;
    }
    let media;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (request.file) {
      media = await uploadMedia('profile', request.file, fs.readFileSync(path.join(__dirname, '../tmp', request.file.filename)), request);
    } else {
      media = { url: 'https://github.com/bitwiseray/pxline-v2/blob/main/public/assets/profile-pic.png?raw=true' };
    }
    await profiler.create({
      user_name: username,
      display_name: display_name,
      password: hashedPassword,
      image: media.url,
      createdAt: Date.now(),
      socials: {
        bio: '',
        interactions: 0,
        friends: []
      }
    });
    request.flash('success', 'Account created!');
    reply.redirect('/');
  } catch (e) {
    request.flash('error', 'Something went wrong');
    reply.redirect('/signup');
    return console.error({ at: '/signup', error: e })
  }
});

router.get('/create-room', checkAuth, (request, reply) => {
  reply.render('create-room');
});

router.post('/create-room', checkAuth, upload.single('image'), async (request, reply) => {
  try {
    const { title, info, admins } = request.body;
    let media;
    if (request.file) {
      media = await uploadMedia('profile', request.file, fs.readFileSync(path.join(__dirname, '../tmp', request.file.filename)), request);
    } else {
      media = { url: 'https://github.com/bitwiseray/pxline-v2/blob/main/public/assets/profile-pic.png?raw=true' };
    }
    const newChat = await Chat.create({
      timestamp: Date.now(),
      svd_chats: []
    });
    const newRoom = await Room.create({
      title: title,
      icon: media.url,
      createdAt: Date.now(),
      members: [request.user._id],
      chats: {
        chat_id: newChat.id,
        chat_type: 'room'
      },
      socials: {
        bio: info,
      }
    });
    let userInstace = await profiler.findById(request.id);
    userInstace.chats.push({
      chat_id: newRoom.id,
      chat_type: 'room'
    });
    request.flash('success', 'Room created!');
    reply.redirect('/');
  } catch (e) {
    request.flash('error', 'Something went wrong');
    reply.redirect('/create-room');
    console.error({ at: '/create-room', error: e })
  }
});

router.get('/:offset', async (request, reply) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(request.params.offset)) {
      const userId = await profiler.findOne({ user_name: request.params.offset });
      if (!userId) {
        request.flash('error', 'Profile doesn\'t exist');
        return reply.redirect('/');
      }
      const offload = await UserSources.loadUser(userId._id);
      reply.render('profile', { user: offload });
    } else {
      const offload = await RoomSources.loadRoom(request.params.offset);
      reply.render('room', { room: offload.room, chats: offload.chats.svd_chats.length });
    }
  } catch (e) {
    request.flash('error', 'Something went wrong');
    console.error({ at: '/:offset', error: e });
  }
});

router.get('/invite/:id', checkAuth, async (request, reply) => {
  const room = await Room.findOne({ _id: request.params.id });
  reply.render('invite', { room: room });
});

router.post('/invite/:id', checkAuth, async (request, reply) => {
  try {
    let room = await Room.findById(request.params.id);
    await RoomSources.addToRoom(request.user._id, room);
    request.flash('success', `Joined ${room.title}!`);
    reply.redirect(`/chat?id=${room._id}`);
  } catch (error) {
    request.flash('error', error.status == 'halted' ? error.message : 'Something went wrong');
    reply.redirect('/');
  }
});

router.delete('/leave/:id', checkAuth, async (request, reply) => {
  try {
    await RoomSources.removeMemberFromRoom(request.user._id, request.params.id);
    reply.status(200).send({ status: 'success', error: null });
  } catch (error) {
    reply.status(200).send({ status: 'success', error: error });
    console.log(error)
  }
});

router.delete('/logout', checkAuth, (request, reply) => {
  request.logOut((err) => {
    if (err) {
      request.flash('error', 'Something went wrong');
      reply.redirect('/');
      return console.error({ at: '/logout', error: err });
    }
    request.flash('success', 'Logged out successfully');
    reply.redirect('/login');
  });
});

router.delete('/delete', checkAuth, (request, reply) => {
  request.logOut((err) => {
    throw new Error(err);
  });
  profiler.findByIdAndDelete(request.user._id, (err, user) => {
    if (err) {
      console.error("Error deleting user:", err);
      request.flash('error', 'Something went wrong');
    } else {
      console.log("User deleted:", user);
      reply.status(200).send("User deleted successfully");
      request.flash('success', 'Deleted successful');
    }
  });
});

module.exports = router;