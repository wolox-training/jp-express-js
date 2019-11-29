const { factory } = require('factory-girl');
const { User } = require('../../app/models');

factory.define('user', User, {
  firstName: factory.chance('first'),
  lastName: factory.chance('last'),
  email: `fake_email${Math.floor(Math.random() * 101)}@wolox.com.ar`,
  password: factory.chance('string', { length: 8, alpha: true, numeric: true })
});

module.exports = { factory };
