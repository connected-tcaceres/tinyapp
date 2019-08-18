const express = require('express');
const router = express.Router();

// HELPER FUNCTIONS ********************
const {
  generateRandomString,
  urlsForUser,
  uniqueVisits,
  totalVisits
} = require('../helpers');

// DATABASES ********************
const {urlDatabase, users, visits} = require('../data/database');

// MIDDLEWARE ********************
const {isLoggedIn, urlExists, urlOwner} = require('../middleware/middleware');

// ROUTES ********************
// delete request: deletes URL
router.delete('/:id', isLoggedIn, urlExists, urlOwner, (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// get request: page to create new URL
router.get('/new', isLoggedIn, (req, res) => {
  res.render('urls_new', {user: users[req.session.user_id]});
});

// get request: page to see specific details (and edit) specific URL
router.get('/:id', isLoggedIn, urlExists, urlOwner, (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
    visits: visits[req.params.id],
    totalVisits: totalVisits(req.params.id, visits),
    uniqueVisits: uniqueVisits(req.params.id, visits)
  };
  return res.render('urls_show', templateVars);
});

// put request: update URL information
router.put('/:id', isLoggedIn, urlExists, urlOwner, (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// get request: shows page with all URL information
router.get('/', (req, res) => {
  console.log('USERS:', users);
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

// post request: create new URL
router.post('/', isLoggedIn, (req, res) => {
  let username = req.session.user_id;
  let random = generateRandomString();
  urlDatabase[random] = {longURL: req.body.longURL, userID: username};
  visits[random] = [];

  return res.redirect(`/urls/${random}`);
});

module.exports = router;
