const bcrypt = require('bcryptjs');
const { DEFAULT_PASSWORD_SALT } = require('./constants.js');

exports.encrypt = (password, salt = DEFAULT_PASSWORD_SALT) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(salt));

exports.acceptedPassword = (password, hash) => bcrypt.compareSync(password, hash);
