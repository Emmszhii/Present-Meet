// const bodyParser = require('body-parser');
// const ejs = require('ejs');

// const passportLocalMongoose = require('passport-local-mongoose');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const findOrCreate = require('mongoose-findorcreate');
// const cors = require('cors');
// const morgan = require('morgan');

// const { default: fetch } = require('node-fetch');

// userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

// const User = new mongoose.model('User', userSchema);

// passport.use(User.createStrategy());

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });
// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//     done(err, user);
//   });
// });

// passport google strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: 'http://localhost:3000/auth/google/secrets',
//       userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
//     },
//     function (accessToken, refreshToken, profile, cb) {
//       User.findOrCreate(
//         {
//           username: profile.emails[0].value,
//           email: profile.emails[0].value,
//           googleId: profile.id,
//           firstName: profile.name.givenName,
//           lastName: profile.name.familyName,
//           photoUrl: profile.photos[0].value,
//         },
//         function (err, user) {
//           return cb(err, user);
//         }
//       );
//     }
//   )
// );

// Auth Google Login route
// app
//   .route('/auth/google')
//   .get(passport.authenticate('google', { scope: ['profile', 'email'] }));
// app.get(
//   '/auth/google/secrets',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   function (req, res) {
//     // Successful authentication, redirect secrets.
//     res.redirect('/');
//   }
// );
