// DATABASES ********************
const {urlDatabase} = require('../data/database');

//checks if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.user_id) {
    return next();
  }
  req.flash('error', 'You need to be logged in to access this page.');
  res.redirect('/login');
};

// checks if url exists
const urlExists = (req, res, next) => {
  if (urlDatabase[req.params.id]) {
    return next();
  }
  req.flash('error', 'URL does not exist');
  res.redirect('/urls');
};

// check if owner of URL
const urlOwner = (req, res, next) => {
  if (urlDatabase[req.params.id].userID === req.session.user_id) {
    return next();
  }
  req.flash('error', 'You do not own this URL');
  res.redirect('/urls');
};

module.exports = {isLoggedIn, urlExists, urlOwner};
