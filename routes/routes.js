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
const Media = require('../schematics/media');
const { checkAuth, checkNotAuth } = require('../preval/validators');
const { getIndexes, loadRoom, loadUser, uploadMedia, addToRoom, getLastMessages } = require('../utils/sourcing');
const { storage, clearTMP } = require('../utils/upload-sys');

initGateway();
router.get('/', checkAuth, async (request, reply) => {
  try {
    const offload = await getIndexes(request.user);
    let collectedIds = [];
    offload.rooms.forEach(room => {
      collectedIds.push(room.chats.chat_id);
    });
    offload.users.forEach(user => {
      collectedIds.push(user.chats.chat_id);
    });
    const lastMessages = await getLastMessages(collectedIds);
    reply.render('index', { user: request.user, extusers: offload.users, extrooms: offload.rooms, lastMessages: lastMessages });
  } catch (e) {
    request.flash('error', 'Something went wrong');
    console.error({ at: '/', error: e });
  }
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

router.get('/chat/:id/', checkAuth, async (request, reply) => {
  try {
    const id = request.params.id;
    const type = await id.checkIdType();
    if (type === 'room') {
      const offload = await loadRoom(id);
      reply.render('chat', { extType: 'room', extusers: offload.members, extroom: offload.room, chats: offload.chats, user: request.user });
    } else {
      const usrOffload = await loadUser(id, request.user._id);
      reply.render('chat', { extType: 'DM', extusers: usrOffload.user, chats: usrOffload.chats, extroom: null, user: request.user });
    }
  } catch (e) {
    request.flash('error', 'Something went wrong' + e);
  }
});

const upload = multer({ storage: storage });
router.post('/signup', checkNotAuth, upload.single('image'), async (request, reply) => {
  try {
    const { display_name, username, password } = request.body;
    if (username === await profiler.findOne({ username })) {
      request.flash('error', 'Username already exists');
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const media = await uploadMedia('profile', request.file, fs.readFileSync(path.join(__dirname, '../tmp', request.file.filename)), request);
    await profiler.create({
      user_name: username,
      display_name: display_name,
      password: hashedPassword,
      image: media.id,
      createdAt: Date.now(),
      socials: {
        bio: '',
        interactions: 0,
        friends: 0
      }
    });
    request.flash('success', 'Account created!');
    reply.redirect('/');
    clearTMP();
  } catch (e) {
    request.flash('error', 'Something went wrong');
    return console.error({ at: '/signup', error: e })
  }
});

router.get('/:username', async (request, reply) => {
  try {
    const userId = await profiler.findOne({ user_name: request.params.username });
    if (!userId) {
      request.redirect('/');
      return request.flash('error', 'Profile doesn\'t exist');
    }
    const offload = await loadUser(userId._id);
    reply.render('profile', { user: offload, base: `https://${request.get('host')}`});
  } catch (e) {
    request.flash('error', 'Something went wrong');
    console.error({ at: '/:username', error: e });
  }
});

router.get('/invite/:id', checkAuth, async (request, reply) => {
  const room = await Room.findOne({ _id: request.params.id });
  reply.render('invite', { room: room });
});

router.post('/invite/:id', checkAuth, async (request, reply) => {
  try {
    let room = await Room.findById(request.params.id);
    await addToRoom(request.user._id, room);
    request.flash('success', `Joined ${room.title}!`);
    reply.redirect('/');
  } catch (error) {
    request.flash('error', 'Something went wrong');
    console.error({ at: '/invite/:id', error: error });
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

router.get('/cdn/:id', async (request, reply) => {
  const id = request.params.id;
  const media = await Media.findById(id);
  if (!media) {
    reply.status(404).send('File not found');
    return;
  }
  const { data, contentType } = media;
  reply.set('Content-Type', contentType);
  reply.send(data);
});

router.post('/cdn', upload.single('upload'), async (request, reply) => {
  try {
    const upload = await uploadMedia('attachment', request.file, fs.readFileSync(path.join(__dirname, '../tmp', request.file.filename)), request);
    const responseData = {
      id: upload.id || null,
    };
    reply.status(200).json(responseData);
    clearTMP();
    /*
    setTimeout(async () => {
      const doc = await Media.findByIdAndDelete(upload.id);
      console.log('deleted')
    }, 60 * 1000)
    */
  } catch (error) {
    reply.status(500).send('Error uploading file');
  }
});

module.exports = router;