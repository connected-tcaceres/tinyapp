const {assert} = require('chai');
const {getUserByEmail, emailInDB, urlsForUser} = require('../helpers');

//dummy users object to use for tests
const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

//dummy urlDatabase object to use for tests
const testUrlDatabase = {
  b2xVn2: {longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID'},
  '9sm5xK': {longURL: 'http://www.google.com', userID: 'user2RandomID'}
};

//getUserByEmail function testing
describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = 'userRandomID';
    assert.strictEqual(user.id, expectedOutput);
  });
  it('#2 should return a user with valid email', () => {
    const user = getUserByEmail('user2@example.com', testUsers);
    const expectedOutput = 'user2RandomID';
    assert.strictEqual(user.id, expectedOutput);
  });
  it('should return false if email not in database', () => {
    const user = getUserByEmail('fakeemail@example.com', testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});

//emailInDB function testing
describe('emailInDB', () => {
  it('should return true if the email exists already', () => {
    const user = emailInDB('user@example.com', testUsers);
    const expectedOutput = true;
    assert.strictEqual(user, expectedOutput);
  });
  it('#2 should return true if the email exists already', () => {
    const user = emailInDB('user2@example.com', testUsers);
    const expectedOutput = true;
    assert.strictEqual(user, expectedOutput);
  });
  it('should return false if emal not used yet', () => {
    const user = emailInDB('fakeemail@example.com', testUsers);
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
});

//urlsForUser function testing
describe('urlsForUser', () => {
  it('should return an object with links specific to the user', () => {
    const url = urlsForUser('userRandomID', testUrlDatabase);
    const expectedOutput = {
      b2xVn2: {longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID'}
    };
    assert.deepEqual(url, expectedOutput);
  });
  it('#2 should return an object with links specific to the user', () => {
    const url = urlsForUser('user2RandomID', testUrlDatabase);
    const expectedOutput = {
      '9sm5xK': {longURL: 'http://www.google.com', userID: 'user2RandomID'}
    };
    assert.deepEqual(url, expectedOutput);
  });
  it('should return a blank object', () => {
    const url = urlsForUser('user3RandomID', testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(url, expectedOutput);
  });
});
