const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
// tokens
const { nocache, generateRTCToken } = require('../tokens/rtcToken');
const { generateRTMToken } = require('../tokens/rtmToken');

// User model
const User = require('../models/User');

// room Route
router.get('/room', ensureAuthenticated, (req, res) => {
  res.render('room');
});

// // fetch rtc token
router.get('/rtc/:channel/:role/:tokentype/:id', nocache, generateRTCToken);

// // fetch rtm token
router.get('/rtm/:uid', nocache, generateRTMToken);

// quit the room
router.get('/quit', (req, res) => {
  res.redirect('/');
});

module.exports = router;
