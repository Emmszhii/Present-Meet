const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.get('/face-recognition', (req, res) => {
  res.render('face_recognition');
});

router.post('/descriptor', (req, res) => {
  const descriptor = req.body.descriptor;
  const float = descriptor.split(',');
  console.log(descriptor);
  console.log(float.length);
  const data = new Float32Array(float);
  console.log(data);
});

module.exports = router;
