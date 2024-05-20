const express = require('express');
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const override = require('method-override');
const app = express();
const socket = require('http').Server(app);
const io = require('socket.io')(socket, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});
const routes = require('./routes/routes');
require('dotenv').config();
require('./sockets/listeners')(io);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.sessionkey,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(override('_method'));
app.use('/', routes);

socket.listen(8080, async () => {
  await mongoose.connect(process.env.srv);
  console.log('Server is up!');
});