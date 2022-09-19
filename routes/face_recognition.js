const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

router.get('/face-recognition', ensureAuthenticated, (req, res) => {
  res.render('face_recognition');
});

router.post('/descriptor', ensureAuthenticated, (req, res) => {
  const descriptor = req.body.descriptor;
  const password = req.body.password;

  if (descriptor.trim() === ``)
    return res.status(400).json({ err: 'Face is not valid' });
  if (password.trim() === ``)
    return res.status(400).json({ err: 'Password is invalid' });

  bcrypt.compare(password, req.user.password, (err, result) => {
    if (err) return res.status(400).json({ err: 'Password is incorrect!' });
    if (result) {
      // splitting the string into an array string
      const float = descriptor.split(',');
      if (!descriptor) return res.status(400).json({ err: 'No Face detected' });
      if (float.length !== 128)
        return res.status(400).json({ err: 'Invalid Face' });
      // converting the split descriptor array to float32array
      // const data = new Float32Array(float);
      User.updateOne({ id: req.user.id }, { descriptor: descriptor }, (err) => {
        if (err) return console.log(err);
        res.status(200).json({ msg: `Successfully save to database` });
        console.log(`successfully updated the document`);
      });
    } else {
      return res.status(400).json({ err: 'Password is incorrect!' });
    }
  });
});

module.exports = router;
