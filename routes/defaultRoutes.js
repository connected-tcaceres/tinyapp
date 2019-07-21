const express = require('express');
const router = express.Router();

// HELPER FUNCTIONS ********************
const {generateRandomString, emailInDB, validateUser, getUserByEmail, createEncryptedPassword} = require('../helpers');

// DATABASES ********************
const {users} = require('../data/database');

// ROUTES ********************
// post request: login to website
router.post('/login', (req, res) => {
  let {email, password} = req.body;
  if (!req.body.email || !req.body.password) {
    req.flash('error', 'You did not enter in a required field.');
    res.redirect(403, '/login');
  } else if (!validateUser(email, password, users)) {
    req.flash('error', 'Incorrect credentials. Please try again.');
    res.redirect(403, '/login');
  } else {
    req.session.user_id = getUserByEmail(email, users).id;
    req.flash('success', 'Welcome back!');
    res.redirect('/urls');
  }
});

// post request: logout a user
router.post('/logout', (req, res) => {
  req.session.user_id = null;
  req.flash('success', 'You have been logged out.');
  res.redirect('/login');
});

//get request: shows login page
router.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/');
  }
  res.render('login', {user: users[req.session.user_id]});
});

//get request: shows registration page
router.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('registration', {user: users[req.session.user_id]});
  }
});

// post request: registers new user
router.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    req.flash('error', 'Missing information in fields.');
    res.redirect(403, '/register');
  } else if (emailInDB(req.body.email, users)) {
    req.flash('error', 'Email already registered with an account.');
    res.redirect(403, '/register');
  } else {
    let userID = generateRandomString();
    let newUser = {
      id: userID,
      email: req.body.email,
      password: createEncryptedPassword(req.body.password, 10)
    };
    users[userID] = newUser;
    req.session.user_id = newUser.id;
    req.flash('success', 'You have been successfully registered');
    res.redirect('/urls');
  }
});

// get request
router.get('/', (req, res) => {
  res.redirect('/urls');
});

module.exports = router;
