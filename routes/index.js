const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

// Welcome Page
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('home', { type: req.user.type });
});

// // fetch user information
router.get('/getInfo', (req, res) => {
  if (req.isAuthenticated()) {
    try {
      res.status(200).json({
        user: req.user,
        AGORA_APP_ID: process.env.AGORA_APP_ID,
      });
    } catch (e) {
      res.status(400).json({ err: 'Something gone wrong!' });
    }
  } else {
    res.redirect('/');
  }
});

module.exports = router;
