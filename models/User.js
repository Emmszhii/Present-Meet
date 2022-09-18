const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  birthday: String,
  type: String,
  googleId: String,
  photoUrl: String,
  descriptor: String,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
