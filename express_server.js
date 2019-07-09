const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

/*
When our browser submits a POST request, the data in the request body is sent as a Buffer.
While this data type is great for transmitting data, it's not readable for us humans.
To make this data readable, we will need to install another piece of middleware, body-parser.
*/

// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({extended: true}));

app.use(express.urlencoded({extended: true}));

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

//deletes the URL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//page to create a new URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//to get to the edit screen
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

//update the long URL
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls/');
});

//this is the redirection using the short URL and small link
app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

//create new URL
app.post('/urls', (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  console.log(req.body);
  res.redirect(`/urls/${random}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
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
