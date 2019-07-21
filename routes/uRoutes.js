const express = require('express');
const router = express.Router();

// HELPER FUNCTIONS ********************
const {generateRandomString} = require('../helpers');

// DATABASES ********************
const {urlDatabase, visits} = require('../data/database');

// MIDDLEWARE ********************
const {urlExists} = require('../middleware/middleware');

// get request: redirection to the long URL using the short URL
router.get('/:id', urlExists, (req, res) => {
  if (!req.session.guest_id) {
    req.session.guest_id = generateRandomString();
  }
  visits[req.params.id].push({
    visitor: req.session.guest_id,
    time: new Date()
  });
  res.redirect(urlDatabase[req.params.id].longURL);
});

module.exports = router;
