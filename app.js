require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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
      console.log(profile);
      User.findOrCreate(
        {
          googleId: profile.id,
          fullName: profile.displayName,
          photoUrl: profile.photos[0].value,
        },
        function (err, user) {
          console.log(user);
          return cb(err, user);
        }
      );
    }
  )
);

// home
app.get('/', (req, res) => {
  // if (req.isAuthenticated()) {
  // res.redirect('/secrets');
  // } else {
  res.render('home');
  // }
});

//
app
  .route('/joinAndCreate')
  .get((req, res) => {
    // session user algorithm
    if (req.isAuthenticated()) {
      res.render('joinAndCreate');
    } else {
      res.redirect('/');
    }
  })
  .post((req, res) => {
    if (req.isAuthenticated()) {
      const showJoinModal = !!req.body.joinModal;
      res.render('joinAndCreate', { showJoinModal });
    } else {
      res.redirect('/');
    }
  });

// Auth Login
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

// app
//   .route('/login')
//   .get((req, res) => {
//     res.render('login');
//   })
//   .post(
//     passport.authenticate('local', {
//       successRedirect: '/secrets',
//       failureRedirect: '/login',
//     }),
//     (req, res) => {
//       const user = new User({
//         username: req.body.username,
//         password: req.body.password,
//       });

//       // login algorithm
//       req.login(user, (err) => {
//         err && console.log(err);
//         passport.authenticate('local')(req, res, () => {
//           res.redirect('/secrets');
//         });
//       });
//     }
//   );

// app
//   .route('/register')
//   .get((req, res) => {
//     res.render('register');
//   })
//   .post((req, res) => {
//     //register algorithm
//     User.register(
//       { username: req.body.username },
//       req.body.password,
//       (err, user) => {
//         if (err) {
//           console.log(err);
//           res.redirect('/register');
//         } else {
//           passport.authenticate('local')(req, res, function () {
//             res.redirect('/secrets');
//           });
//         }
//       }
//     );
//   });

app.get('/logout', (req, res) => {
  req.logout((err) => {
    err && console.log(err);
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server is up and listening on PORT ${PORT}`);
});
