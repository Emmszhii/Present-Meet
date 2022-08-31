require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const cors = require('cors');
const morgan = require('morgan');
const { default: fetch } = require('node-fetch');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(morgan('dev'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {},
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true });

// mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  // email: {
  //   type: String,
  //   required: [true, 'Please insert a username!'],
  // },
  // password: {
  //   type: String,
  //   required: [true, 'Please insert a password!'],
  // },
  googleId: String,
  fullName: String,
  photoUrl: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/secrets',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        {
          googleId: profile.id,
          fullName: profile.displayName,
          photoUrl: profile.photos[0].value,
        },
        function (err, user) {
          // console.log(user);
          return cb(err, user);
        }
      );
    }
  )
);

// Home
app.get('/', (req, res) => {
  res.render('home');
});

// Auth Google Login
app
  .route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile'] }));

//
app.get(
  '/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/home' }),
  function (req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/joinAndCreate');
  }
);

// join or create room
app.route('/joinAndCreate').get((req, res) => {
  // session user algorithm
  if (req.isAuthenticated()) {
    res.render('joinAndCreate');
  } else {
    res.redirect('/');
  }
});

app
  .route('/room')
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render('room');
    } else {
      res.redirect('/');
    }
  })
  .post((req, res) => {
    authenticated(req, 'room');
    const link = req.body.meetingLink;
    console.log(link);
  });

// Profile of the user
app.get('/profile', (req, res) => {
  // console.log({ profile: req.user });
  res.status(200).json({ profile: req.user });
});

// VideoSDK TOKEN
const baseURL = `https://api.videosdk.live`;

const API_KEY = process.env.VIDEOSDK_ID;
const SECRET_KEY = process.env.VIDEOSDK_SECRET;

const options = {
  expiresIn: '10m',
  algorithm: 'HS256',
};
const payload = {
  apikey: API_KEY,
  version: 2,
  roles: ['CRAWLER'],
};
// TOKEN
const videoSdkToken = jwt.sign(payload, SECRET_KEY, options);
console.log('VideoSDK TOKEN : ', videoSdkToken);

// VideoSDK ROOMS

// const roomID = getRooms();
// console.log(roomID);
// GET TOKEN
app.get('/get-token', (req, res) => [
  res.status(200).json({ token: videoSdkToken }),
]);

// GET ROOM
app.get('/create-meeting', (req, res) => {
  const optionsRoom = {
    method: 'POST',
    headers: {
      Authorization: videoSdkToken,
      'Content-Type': 'application/json',
    },
  };
  const roomUrl = `https://api.videosdk.live/v2/rooms`;
  const getRoomId = async () => {
    const response = await fetch(roomUrl, optionsRoom);
    const data = await response.json();
    console.log(data);
    res.status(200).json(data);
  };
  getRoomId();
});

// Logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    err && console.log(err);
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server is up and listening on PORT ${PORT}`);
});
