const { factory } = require('factory-girl');
const faker = require('faker');
const { User } = require('../../app/models');

factory.define('user', User, () => ({
  firstName: factory.chance('first'),
  lastName: factory.chance('last'),
  email: faker.internet.email(null, null, 'wolox.com.ar'),
  password: factory.chance('string', { length: 8, alpha: true, numeric: true })
}));

module.exports = { factory };
