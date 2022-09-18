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
  const errors = [];
  const descriptor = req.body.descriptor;
  const password = req.body.password;
  if (password.trim() === ``) return errors.push({ msg: 'Password is Empty!' });
  console.log(password, descriptor);
  bcrypt.compare(password, req.user.password, (err, result) => {
    if (err) return errors.push({ msg: 'Something gone wrong!' });
    if (result) {
      const float = descriptor.split(',');
      const errors = [];
      if (!descriptor) errors.push({ msg: 'No Face detected' });
      if (float.length !== 128) errors.push({ msg: 'Invalid Face' });
      if (descriptor.trim() === ``) errors.push({ msg: 'Face is not valid' });
      const data = new Float32Array(float);

      User.updateOne({ id: req.user.id }, { descriptor: data }, (err) => {
        if (err) return console.log(err);
        console.log(`successfully updated the document`);
      });
    } else {
      return errors.push({ msg: 'Something gone wrong!' });
    }
  });

  // console.log(data);
});

module.exports = router;
