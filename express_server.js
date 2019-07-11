const PORT = 8080;
const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const {
  generateRandomString,
  emailInDB,
  validateUser,
  getUserByEmail,
  urlsForUser,
  createEncryptedPassword
} = require('./helpers');

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['pika pikachu']
  })
);

const urlDatabase = {};
const users = {};

//deletes the URL
app.delete('/urls/:shortURL', (req, res) => {
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});

//page to create a new URL
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    res.render('urls_new', {user: users[req.session.user_id]});
  } else {
    res.redirect('/login');
  }
});

//to get to the edit screen
app.get('/urls/:shortURL', (req, res) => {
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/urls');
  }
});

//update the long URL
app.put('/urls/:id', (req, res) => {
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.id]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls/');
  } else {
    res.redirect('/urls/');
  }
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.sendStatus(400);
  } else if (emailInDB(req.body.email, users)) {
    res.statusCode = 400;
    res.send(400);
  } else {
    let userID = generateRandomString();
    let newUser = {
      id: userID,
      email: req.body.email,
      password: createEncryptedPassword(req.body.password, 10)
    };
    users[userID] = newUser;
    //res.cookie('user_id', userID);
    req.session.user_id = newUser.id;
    res.redirect('/urls');
  }
});

//this is the redirection using the short URL and small link
app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id]};
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  res.render('registration', {user: users[req.session.user_id]});
});

//create new URL
app.post('/urls', (req, res) => {
  let username = req.session.user_id;
  let random = generateRandomString();
  urlDatabase[random] = {longURL: req.body.longURL, userID: username};
  res.redirect(`/urls/${random}`);
});

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

app.post('/login', (req, res) => {
  let {email, password} = req.body;
  if (!validateUser(email, password, users)) {
    res.statusCode = 403;
    res.sendStatus(403);
  } else {
    req.session.user_id = getUserByEmail(email, users).id;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  res.render('login', {user: users[req.session.user_id]});
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// app.get('/error', (req, res) => {
//   res.render('error_page', {user: users[req.session.user_id]});
// });

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
