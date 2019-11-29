const user = require('./user');
const errors = require('./errors');

module.exports = {
  ...user,
  ...errors
};
