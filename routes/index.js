const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

// Welcome Page
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('home');
});

router.get('/face-recognition', (req, res) => {
  res.render('face_recognition');
});

// app.get('/profile', (req, res) => {
//   if (req.isAuthenticated()) {
//     res.render('register', { user: req.user });
//   } else {
//     res.redirect('/');
//   }
// });

module.exports = router;
