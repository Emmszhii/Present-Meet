const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

// Welcome Page
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('home');
});

// // fetch user information
router.get('/getInfo', (req, res) => {
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

// app.get('/profile', (req, res) => {
//   if (req.isAuthenticated()) {
//     res.render('register', { user: req.user });
//   } else {
//     res.redirect('/');
//   }
// });

module.exports = router;
