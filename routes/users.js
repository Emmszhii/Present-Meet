const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { isEmail } = require('validator');

const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

router.get('/login', (req, res) => {
  res.render('login');
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
  console.log(req.body);
  let errors = [];
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
  // check if type is not null
  if (type.trim() === '') {
    errors.push({ msg: 'Please input an account type' });
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
        const newUser = new User({
          firstName: fname,
          lastName: lname,
          birthday,
          type,
          email,
          password,
        });
        console.log(newUser);
        // Hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // set password to hash
            newUser.password = hash;
            // save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  'success_msg',
                  'You are now Registered and can log in'
                );
                res.redirect('/');
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
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
