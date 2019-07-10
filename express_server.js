const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: {longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID'},
  '9sm5xK': {longURL: 'http://www.google.com', userID: 'user2RandomID'}
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '1'
    //password: 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: '2'
    //password: 'dishwasher-funk'
  }
};

//deletes the URL
app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlsForUser(req.cookies.user_id)[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});

//page to create a new URL
app.get('/urls/new', (req, res) => {
  if (req.cookies.user_id) {
    res.render('urls_new', {user: users[req.cookies.user_id]});
  } else {
    res.redirect('/login');
  }
});

//to get to the edit screen
app.get('/urls/:shortURL', (req, res) => {
  if (urlsForUser(req.cookies.user_id)[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.cookies.user_id]
    };
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/urls');
  }
});

//update the long URL
app.post('/urls/:id', (req, res) => {
  if (urlsForUser(req.cookies.user_id)[req.params.id]) {
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
  } else if (emailInDB(req.body.email)) {
    res.statusCode = 400;
    res.send(400);
  } else {
    let userID = generateRandomString();
    let newUser = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    users[userID] = newUser;
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

//this is the redirection using the short URL and small link
app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id]};
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  res.render('registration', {user: users[req.cookies.user_id]});
});

//create new URL
app.post('/urls', (req, res) => {
  let username = req.cookies.user_id;
  let random = generateRandomString();
  urlDatabase[random] = {longURL: req.body.longURL, userID: username};
  res.redirect(`/urls/${random}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.post('/login', (req, res) => {
  let {email, password} = req.body;
  if (!validateUser(email, password)) {
    res.statusCode = 403;
    res.sendStatus(403);
  } else {
    res.cookie('user_id', getUserID(email)); //set the cookie to username
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  res.render('login', {user: users[req.cookies.user_id]});
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id'); //clear the 'username' cookie
  res.redirect('/urls');
});

app.get('/error', (req, res) => {
  res.render('error_page', {user: users[req.cookie.user_id]});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  let string = '';
  let options = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < 6; i++) {
    string += options[Math.floor(Math.random() * options.length)];
  }
  return string;
};

const emailInDB = (email) => {
  for (const record in users) {
    if (users[record].email === email) {
      return true;
    }
  }
  return false;
};

const validateUser = (email, password) => {
  for (const record in users) {
    if (users[record].email === email && users[record].password === password) {
      return true;
    }
  }
  return false;
};

const getUserID = (email) => {
  for (const record in users) {
    if (users[record].email === email) {
      return users[record].id;
    }
  }
  return false;
};

const urlsForUser = (id) => {
  let newObj = {};
  for (const record in urlDatabase) {
    if (urlDatabase[record].userID === id) {
      newObj[record] = urlDatabase[record];
    }
  }
  return newObj;
};
