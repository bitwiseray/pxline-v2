const express = require('express');
const router = express.Router();
const passport = require('passport');
const initGateway = require('../utils/strategy');
const bcrypt = require('bcrypt');
const profiler = require('../schematics/profile');
const Room = require('../schematics/rooms');
const { checkAuth, checkNotAuth } = require('../preval/validators');
const { getIndexes, loadRoom, loadUser, checkIdType } = require('../utils/sourcing');

initGateway();
router.get('/', checkAuth, async (request, reply) => {
  try {
    const offload = await getIndexes(request.user);
    reply.render('index', { user: request.user, extusers: offload.users, extrooms: offload.rooms });
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

router.get('/invite/:id', checkAuth, async (request, reply) => {
  const room = await Room.findOne({ _id: request.params.id });
  reply.render('invite', { room: room });
});

router.post('/invite/:id', checkNotAuth, async (request, reply) => {
  try {
    const id = request.user._id;
    const room = await Room.findOne({ _id: request.params.id });
    if (room.members.includes(id)) {
      return reply.redirect('/');
    } else {
      room.members.push(id);
      room.save();
    }
  } catch (error) {
    request.flash('error', 'Something went wrong');
    console.error({ at: '/invite/:id', error: error });
  }
});

router.delete('/logout', checkAuth, (request, reply) => {
  request.logOut();
  reply.redirect('/');
});

router.delete('/delete', checkAuth, (request, reply) => {
  request.logOut();
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