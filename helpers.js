const bcrypt = require('bcrypt');

// generates random 6 length alphanmumeric string
const generateRandomString = () => {
  let string = '';
  let options = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < 6; i++) {
    string += options[Math.floor(Math.random() * options.length)];
  }
  return string;
};

// checks if an email address is found in a given database
const emailInDB = (email, database) => {
  for (const record in database) {
    if (database[record].email === email) {
      return true;
    }
  }
  return false;
};

// validates if email and password provided, match the hashed password stored in database
const validateUser = (email, password, database) => {
  for (const record in database) {
    if (emailInDB(email, database) && bcrypt.compareSync(password, database[record].password)) {
      return true;
    }
  }
  return false;
};

//gets user information from database when provided with an email
const getUserByEmail = (email, database) => {
  for (const record in database) {
    if (database[record].email === email) {
      return database[record];
    }
  }
  return undefined;
};

// gets urls created by specifiied user from a database
const urlsForUser = (id, database) => {
  let newObj = {};
  for (const record in database) {
    if (database[record].userID === id) {
      newObj[record] = database[record];
    }
  }
  return newObj;
};

//creates encrypted password
const createEncryptedPassword = (password, count) => {
  return bcrypt.hashSync(password, count);
};

//determines unique visits for a given short URL
const uniqueVisits = (url, database) => {
  return new Set(database[url].map((visit) => visit.visitor)).size;
};

//determines total visits for a given short URL
const totalVisits = (url, database) => {
  return database[url].length;
};
module.exports = {
  generateRandomString,
  emailInDB,
  validateUser,
  getUserByEmail,
  urlsForUser,
  createEncryptedPassword,
  uniqueVisits,
  totalVisits
};
