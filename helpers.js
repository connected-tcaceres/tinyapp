const bcrypt = require('bcrypt');

const generateRandomString = () => {
  let string = '';
  let options = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < 6; i++) {
    string += options[Math.floor(Math.random() * options.length)];
  }
  return string;
};

const emailInDB = (email, database) => {
  for (const record in database) {
    if (database[record].email === email) {
      return true;
    }
  }
  return false;
};

const validateUser = (email, password, database) => {
  for (const record in database) {
    if (emailInDB(email, database) && bcrypt.compareSync(password, database[record].password)) {
      return true;
    }
  }
  return false;
};

const getUserByEmail = (email, database) => {
  for (const record in database) {
    if (database[record].email === email) {
      return database[record];
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  let newObj = {};
  for (const record in database) {
    if (database[record].userID === id) {
      newObj[record] = database[record];
    }
  }
  return newObj;
};

const createEncryptedPassword = (password, count) => {
  return bcrypt.hashSync(password, count);
};

module.exports = {
  generateRandomString,
  emailInDB,
  validateUser,
  getUserByEmail,
  urlsForUser,
  createEncryptedPassword
};
