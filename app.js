require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const PORT = process.env.PORT || 3000;

// Passport Config
require('./config/passport')(passport);

// DB config
const db = require('./config/keys').MongoURI;

// Connection to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log(`MongoDB connected...`);
  })
  .catch((err) => {
    console.log(err);
  });

// EJS
app.use(express.static('public'));
app.use('/public/', express.static('./public'));
app.set('view engine', 'ejs');

// BodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));
app.use('/', require('./routes/room'));
app.use('/', require('./routes/face_recognition'));

// listen to the route
app.listen(PORT, () => {
  console.log(`Server is up and listening on PORT ${PORT}`);
});
