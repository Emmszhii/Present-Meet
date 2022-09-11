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
const validator = require('validator');
const bcrypt = require('bcrypt');
const { default: fetch } = require('node-fetch');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const {
  RtcTokenBuilder,
  RtcRole,
  RtmTokenBuilder,
  RtmRole,
} = require('agora-access-token');

const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use('/public', express.static('public'));
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

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    // required: [true, 'Please enter an email.'],
    // validate: [validator.isEmail, 'Please enter a valid E-mail'],
  },
  password: {
    type: String,
    // required: [true, 'Password is a required field.'],
    // minlength: 6,
  },

  googleId: String,
  firstName: String,
  lastName: String,
  birthday: String,
  type: String,
  photoUrl: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// passport google strategy
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
          username: profile.id,
          email: profile.emails[0].value,
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          photoUrl: profile.photos[0].value,
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

// home route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('home');
  } else {
    res.render('login');
  }
});

// Auth Google Login route
app
  .route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get(
  '/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/');
  }
);

// room Route
app.route('/room').get((req, res) => {
  if (req.isAuthenticated()) {
    res.render('room');
  } else {
    res.redirect('/');
  }
});

// AgoraSDK TOKEN
const nocache = (_, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
};

// GENERATE RTC TOKEN
const generateRTCToken = (req, resp) => {
  resp.header('Access-Control-Allow-Origin', '*');
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ error: 'channel is required' });
  }
  let id = req.params.id;
  if (!id || id === '') {
    return resp.status(500).json({ error: 'id is required' });
  }
  // get role
  let role;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === 'audience') {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(500).json({ error: 'role is incorrect' });
  }
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  let token;
  if (req.params.tokentype === 'userAccount') {
    token = RtcTokenBuilder.buildTokenWithAccount(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channelName,
      id,
      role,
      privilegeExpireTime
    );
  } else if (req.params.tokentype === 'uid') {
    token = RtcTokenBuilder.buildTokenWithUid(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channelName,
      id,
      role,
      privilegeExpireTime
    );
  } else {
    return resp.status(500).json({ error: 'token type is invalid' });
  }
  return resp.json({
    AGORA_APP_ID: process.env.AGORA_APP_ID,
    rtcToken: token,
  });
};

// GENERATE RTM TOKEN
const generateRTMToken = (req, resp) => {
  // set response header
  resp.header('Access-Control-Allow-Origin', '*');

  // get uid
  const uid = req.params.uid;
  if (!uid || uid === '') {
    return resp.status(500).json({ error: 'uid is required' });
  }
  // get role
  const role = RtmRole.Rtm_User;
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const APP_ID = process.env.AGORA_APP_ID;
  const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
  const token = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json({ rtmToken: token });
};

// fetch rtc token
app.get('/rtc/:channel/:role/:tokentype/:id', nocache, generateRTCToken);

// fetch rtm token
app.get('/rtm/:uid', nocache, generateRTMToken);

// fetch user information
app.get('/getInfo', (req, res) => {
  if (req.isAuthenticated()) {
    try {
      res.status(200).json({ user: req.user });
    } catch (e) {
      res.status(400).json({ err: 'Something gone wrong!' });
    }
  } else {
    res.redirect('/');
  }
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('register', { user: req.user });
  } else {
    res.redirect('/');
  }
});

app.get('/register', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('register');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }, (err, foundUser) => {
    if (err) return console.log(err);
    if (foundUser) {
      bcrypt.compare(password, foundUser.password, (err, result) => {
        if (result === true) {
          res.render('home');
        }
      });
    }
  });
});

app.post('/register', async (req, res) => {
  // const saltRounds = 10;
  // bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
  //   try {
  //     const newUser = new User({
  //       email: req.body.email,
  //       password: hash,
  //       firstName: req.body.first_name,
  //       lastName: req.body.last_name,
  //       birthday: req.body.birthday,
  //       type: req.body.type,
  //     });
  //     await newUser.save();
  //     res.render('home');
  //     // res.status(200).send(newUser);
  //   } catch (err) {
  //     res.status(400).send(err.message);
  //   }
  // });
  User.register({ email: req.body.email }, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/');
      });
    }
  });
});

app.post('/profile', (req, res) => {
  // const firstName = req.body.first_name;
  // console.log(req.body);
  // console.log(firstName);
  // res.status(200).json({ text: req.body });
});

app.get('/quit', (req, res) => {
  res.redirect('/');
});

// logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    err && console.log(err);
    res.redirect('/');
  });
});

// listen to the route
app.listen(PORT, () => {
  console.log(`Server is up and listening on PORT ${PORT}`);
});
