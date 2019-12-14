const faker = require('faker');

module.exports = {
  passwordRegexp: new RegExp('[a-zA-Z0-9]{8}'),
  emailRegexp: new RegExp('[a-zA-Z0-9]*@(wolox.co).*'),
  randomSecret: () => faker.random.alphaNumeric(faker.random.number(5) + 10),
  DEFAULT_PASSWORD_SALT: 10
};
