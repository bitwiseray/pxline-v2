const express = require('express');
const router = express.Router();
const passport = require('passport');
const initGateway = require('../utils/strategy');
const bcrypt = require('bcrypt');
const profiler = require('../schematics/profile');

initGateway();
router.get('/', checkAuth, (request, reply) => {
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

router.get('/signup', checkNotAuth, (request, reply) => {
  reply.render('signup');
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


module.exports = router;
