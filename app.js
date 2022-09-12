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

const { nocache, generateRTCToken } = require('./rtcToken');
const { generateRTMToken } = require('./rtmToken');

const initializePassport = require('./passport-config');
const flash = require('express-flash');
const methodOverride = require('method-override');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { default: fetch } = require('node-fetch');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(morgan('dev'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: {},
  })
);

// initializePassport(
//   passport,
//   (email) => User.find((user) => user.email === email),
//   (id) => User.find((user) => user._id === id)
// );

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
          username: profile.emails[0].value,
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
      // User.findOne({ googleId: profile.id }, (err, foundUser) => {
      //   if (!err) {
      //     if (foundUser) {
      //       return cb(null, foundUser);
      //     } else {
      //       const newUser = new User({
      //         googleId: profile.id,
      //         email: profile.emails[0].value,
      //         firstName: profile.name.givenName,
      //         lastName: profile.name.familyName,
      //         photoUrl: profile.photos[0].value,
      //       });
      //       newUser.save((err) => {
      //         if (!err) {
      //           return cb(null, newUser);
      //         }
      //       });
      //     }
      //   }
      // });
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
  // const email = req.body.email;
  // const password = req.body.password;
  // User.findOne({ email: email }, (err, foundUser) => {
  //   if (err) return console.log(err);
  //   if (foundUser) {
  //     bcrypt.compare(password, foundUser.password, (err, result) => {
  //       if (result === true) {
  //         res.render('home');
  //       }
  //     });
  //   }
  // });

  const user = new User({
    username: req.body.email,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/');
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

  User.register(
    { username: req.body.email },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/');
        });
      }
    }
  );
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
