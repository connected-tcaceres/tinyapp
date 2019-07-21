// CONSTANTS ********************
const {PORT} = require('./data/constants');

// IMPORTS ********************
const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');

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
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// ROUTES ********************
const urlsRoutes = require('./routes/urlsRoutes');
const uRoutes = require('./routes/uRoutes');
const defaultRoutes = require('./routes/defaultRoutes');

app.use('/urls', urlsRoutes);
app.use('/u', uRoutes);
app.use('/', defaultRoutes);

// SERVER INITIALIZATION********************
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
