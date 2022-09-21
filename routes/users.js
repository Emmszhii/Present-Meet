const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { isEmail } = require('validator');
const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

// register page
router.get('/register', (req, res) => {
  res.render('register');
});

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Register Handle
router.post('/register', (req, res) => {
  const { first_name, last_name, email, password, password2, birthday, type } =
    req.body;

  const errors = [];
  // check required fields
  if (
    !first_name ||
    !last_name ||
    !birthday ||
    !type ||
    !email ||
    !password ||
    !password2
  ) {
    errors.push({ msg: 'PLease fill in all fields' });
  }
  // check if first_name is valid
  if (first_name < 3 || first_name.trim() === '') {
    errors.push({ msg: 'First name must contain at least 3 letters' });
  }
  // check if last_name is valid
  if (last_name < 3 || last_name.trim() === '') {
    errors.push({ msg: 'Last name must contain at least 3 letter' });
  }
  // check if birthday is not null
  if (birthday.trim() === '') {
    errors.push({ msg: 'Must input a birthday' });
  }
  // check if type is not null and valid
  if (
    type.trim() === '' &&
    type !== 'student' &&
    type !== 'teacher' &&
    type !== 'audience' &&
    type !== 'host'
  ) {
    res.status(400).json({ msg: 'Please input a valid account type' });
  }
  // check if email is valid
  if (!isEmail(email)) {
    errors.push({ msg: 'Email is not valid' });
  }
  if (password !== password2) {
    // check password match
    errors.push({ msg: 'Passwords do not much' });
  }
  // check pass length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      first_name,
      last_name,
      birthday,
      type,
      email,
      password,
      password2,
    });
  } else {
    // Validation Pass
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User Exist
        errors.push({ msg: `Email is already registered` });
        res.render('register', {
          errors,
          first_name,
          last_name,
          birthday,
          type,
          email,
          password,
          password2,
        });
      } else {
        const fname = capitalize(first_name);
        const lname = capitalize(last_name);
        // Hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            // set password to hash
            const newUser = new User({
              firstName: fname,
              lastName: lname,
              birthday,
              type,
              email,
              password: hash,
            });

            // newUser.password = hash;
            // save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  'success_msg',
                  'You are now Registered and can log in'
                );
                res.redirect('/login');
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// profile get request
router.get('/profile', ensureAuthenticated, (req, res) => {
  const {
    firstName: first_name,
    lastName: last_name,
    birthday,
    type,
  } = req.user;
  res.render('profile', { first_name, last_name, birthday, type });
});

// profile post request
router.post('/profile', ensureAuthenticated, (req, res) => {
  const { first_name, last_name, birthday, type, password } = req.body;
  if (!first_name || !last_name || !birthday || !type || !password) {
    return res
      .status(400)
      .json({ err: 'PLease fill in all the required fields' });
  }
  // check if first_name is valid
  if (first_name < 3 || first_name.trim() === '') {
    return res
      .status(400)
      .json({ err: 'First name must contain at least 3 letters' });
  }
  // check if last_name is valid
  if (last_name < 3 || last_name.trim() === '') {
    return res
      .status(400)
      .json({ err: 'Last name must contain at least 3 letter' });
  }
  // check if birthday is not null
  if (birthday.trim() === '') {
    return res.status(400).json({ err: 'Must input a birthday' });
  }
  // check if type is not null
  if (
    type.trim() === '' &&
    type !== 'student' &&
    type !== 'teacher' &&
    type !== 'audience' &&
    type !== 'host'
  ) {
    return res.status(400).json({ err: 'Please input a valid account type' });
  }

  bcrypt.compare(password, req.user.password, (err, result) => {
    if (err) return console.log(err);
    if (result) {
      const data = {
        firstName: first_name,
        lastName: last_name,
        birthday: birthday,
        type: type,
      };
      User.updateOne({ _id: req.user.id }, data, (error, result) => {
        if (error) return res.status(200).json({ err: error });
        console.log(result.acknowledged);
        if (result.acknowledged) {
          return res.status(200).json({ msg: 'User info has been updated' });
        } else {
          return res.status(400).json({ err: 'Something gone wrong' });
        }
      });
    } else {
      return res.status(400).json({ err: 'Invalid Password' });
    }
  });
});

router.post('/password', ensureAuthenticated, (req, res) => {
  const {
    password: oldPw,
    newPassword: newPw,
    newPassword1: newPw1,
  } = req.body;

  if (!oldPw || !newPw || !newPw1)
    return res
      .status(400)
      .json({ err: 'All fields in password are required!' });

  if (newPw < 6)
    return res
      .status(400)
      .json({ err: 'Password must contain 6 or more characters!' });

  if (newPw !== newPw1)
    return res
      .status(400)
      .json({ err: 'New Password and confirm password is not the same!' });

  bcrypt.compare(oldPw, req.user.password, (err, result) => {
    if (err) return res.status(400).json({ err: 'Old Password is incorrect' });
    if (result) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(400).json({ err: 'Something gone wrong' });
        bcrypt.hash(newPw, salt, (err, hash) => {
          if (err) return res.status(400).json({ err: 'Something gone wrong' });

          User.updateOne(
            { _id: req.user.id },
            { password: hash },
            (error, result) => {
              if (error)
                return res.status(400).json({ err: 'Something gone wrong' });

              if (result) {
                return res
                  .status(200)
                  .json({ msg: 'Password have been changed!' });
              }
            }
          );
        });
      });
    }
  });
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout((err) => {
    req.flash('success_msg', 'Your are logged out');
    res.redirect('/login');
  });
});

module.exports = router;
