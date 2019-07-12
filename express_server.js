// IMPORTS ********************
const PORT = 8080;
const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const {
  generateRandomString,
  emailInDB,
  validateUser,
  getUserByEmail,
  urlsForUser,
  createEncryptedPassword,
  uniqueVisits,
  totalVisits
} = require('./helpers');

// DATABASES ********************
const urlDatabase = {};
const users = {};
const visits = {};

// APP INITIALIZATION ********************
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(
  cookieSession({
    name: 'session',
    keys: ['pika pikachu']
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// ROUTES ********************
// delete request: deletes URL
app.delete('/urls/:shortURL', (req, res) => {
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
  } else if (req.session.user_id) {
    req.flash('error', 'Cannot delete URL. You do not own.');
  } else {
    req.flash('error', 'Must be logged in and own URL to delete.');
  }
  res.redirect('/urls');
});

// get request: page to create new URL
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    res.render('urls_new', {user: users[req.session.user_id]});
  } else {
    res.redirect('/login');
  }
});

// get request: page to see specific details (and edit) specific URL
app.get('/urls/:shortURL', (req, res) => {
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id],
      visits: visits[req.params.shortURL],
      totalVisits: totalVisits(req.params.shortURL, visits),
      uniqueVisits: uniqueVisits(req.params.shortURL, visits)
    };
    res.render('urls_show', templateVars);
  } else if (req.session.user_id) {
    req.flash('error', 'You do not have access to this page or page does not exist!');
    res.redirect('/urls');
  } else if (!urlDatabase[req.params.shortURL]) {
    req.flash('error', 'The short URL does not exist');
    res.redirect('/urls');
  } else if (!req.session.user_id) {
    req.flash('error', 'You need to be logged in');
    res.redirect('/urls');
  } else {
    res.flash('error', 'redirected from short url info page');
    res.redirect('/urls');
  }
});

// put request: update URL information
app.put('/urls/:id', (req, res) => {
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.id]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
  } else if (req.session.user_id) {
    req.flash('error', 'Do not own this URL, cannot edit.');
  } else {
    req.flash('error', 'Could not update the URL');
  }
  res.redirect('/urls');
});

// post request: registers new user
app.post('/register', (req, res) => {
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

// get request: redirection to the long URL using the short URL
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    req.flash('error', 'URL does not exist in database.');
    res.redirect('/urls');
  } else {
    if (!req.session.guest_id) {
      req.session.guest_id = generateRandomString();
    }
    visits[req.params.shortURL].push({
      visitor: req.session.guest_id,
      time: new Date()
    });
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});

// get request: shows page with all URL information
app.get('/urls', (req, res) => {
  let templateVars = {urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id]};
  res.render('urls_index', templateVars);
});

//get request: shows registration page
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('registration', {user: users[req.session.user_id]});
  }
});

// post request: create new URL
app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    let username = req.session.user_id;
    let random = generateRandomString();
    urlDatabase[random] = {longURL: req.body.longURL, userID: username};
    visits[random] = [];
    res.redirect(`/urls/${random}`);
  } else {
    req.flash('error', 'Need to log in to post.');
    res.redirect('/urls');
  }
});
// post request: login to website
app.post('/login', (req, res) => {
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
//get request: shows login page
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('login', {user: users[req.session.user_id]});
  }
});

// post request: logout a user
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  req.flash('success', 'You have been logged out.');
  res.redirect('/login');
});

// get request: route directly -> redirects as needed
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// SERVER INITIALIZATION********************
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
