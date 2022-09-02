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
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(morgan('dev'));

app.use('/public', express.static('public'));

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
  googleId: String,
  fullName: String,
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
          username: profile.emails[0].value,
          googleId: profile.id,
          fullName: profile.displayName,
          photoUrl: profile.photos[0].value,
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

// Home
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/join-and-create');
  } else {
    res.render('home');
  }
});

// Auth Google Login
app
  .route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get(
  '/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/home' }),
  function (req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/join-and-create');
  }
);

// join or create room
app.route('/join-and-create').get((req, res) => {
  // session user algorithm
  if (req.isAuthenticated()) {
    res.render('joinAndCreate');
  } else {
    res.redirect('/');
  }
});

// Room Route
app.route('/room').get((req, res) => {
  if (req.isAuthenticated()) {
    const idRoom = req.query.meetingId;
    console.log(idRoom);
    res.render('room', {
      AGORA_APP_ID: process.env.AGORA_APP_ID,
      // rtcToken: token,
      // user: req.user,
    });
    // validateRoomId(idRoom).then((result) => {
    //   if (!result) {
    //     res
    //       .status(404)
    //       .json({ message: 'Invalid room please check or create a new one' });
    //   } else {
    //     if (result.roomId === idRoom) {
    //       res.render('room', { profile: req.user });
    //     }
    //   }
    // });
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

const generateRTCToken = (req, resp) => {
  resp.header('Access-Control-Allow-Origin', '*');
  const channelName = req.params.channel;
  // console.log(channelName);
  if (!channelName) {
    return resp.status(500).json({ error: 'channel is required' });
  }
  let id = req.params.id;
  console.log(id);
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
    console.log(token);
  } else {
    return resp.status(500).json({ error: 'token type is invalid' });
  }
  return resp.json({
    AGORA_APP_ID: process.env.AGORA_APP_ID,
    rtcToken: token,
  });
};

app.get('/rtc/:channel/:role/:tokentype/:id', nocache, generateRTCToken);

// VideoSDK TOKEN
// const API_BASE_URL = `https://api.videosdk.live`;
// const API_KEY = process.env.VIDEOSDK_ID;
// const SECRET_KEY = process.env.VIDEOSDK_SECRET;

// const options = {
//   expiresIn: '90m',
//   algorithm: 'HS256',
// };
// const payload = {
//   apikey: API_KEY,
//   version: 2,
//   roles: ['CRAWLER'],
// };

// // TOKEN
// const videoSdkToken = jwt.sign(payload, SECRET_KEY, options);

// // GET TOKEN
// app.get('/get-token', (req, res) => [
//   res.status(200).json({ token: videoSdkToken }),
// ]);

// // VideoSDK ROOMS
// // GET ROOM
// const optionsRoom = {
//   method: 'POST',
//   headers: {
//     Authorization: videoSdkToken,
//     'Content-Type': 'application/json',
//   },
// };
// const roomUrl = `${API_BASE_URL}/v2/rooms`;
// const getRoomId = async () => {
//   try {
//     const response = await fetch(roomUrl, optionsRoom);
//     const data = await response.json();
//     ROOM = data;
//     return data;
//   } catch (err) {
//     console.log(err);
//   }
// };

// app.get('/create-meeting', (req, res) => {
//   getRoomId().then((result) => {
//     console.log(result);
//     res.status(200).json(result);
//   });
// });

// // VideoSDK Validate-Meeting
// const validateRoomId = async (roomId) => {
//   const optionsValidate = {
//     method: 'GET',
//     headers: {
//       Authorization: videoSdkToken,
//       'Content-Type': 'application/json',
//     },
//   };
//   const urlValidate = `${API_BASE_URL}/v2/rooms/validate/${roomId}`;
//   try {
//     const response = await fetch(urlValidate, optionsValidate);
//     const data = await response.json();
//     return data;
//   } catch (err) {
//     console.log(err);
//   }
// };

// app.route('/validate-meeting/:meetId').get((req, res) => {
//   const idRoom = req.params.meetId;
//   validateRoomId(idRoom)
//     .then((result) => {
//       // console.log(result);
//       res.status(200).json(result);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

app.get('/getInfo', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.redirect('/');
  }
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
