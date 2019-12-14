const jwt = require('jwt-simple');
const { findTokenAndSecret, updateTokenAndSecret } = require('../services/users');
const { randomSecret } = require('./constants');

exports.generateToken = async user => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  const secret = randomSecret();
  const token = jwt.encode(payload, secret);
  await updateTokenAndSecret(user.id, token, secret);
  return token;
};

exports.decodeToken = async token => {
  const tokenAndSecret = (await findTokenAndSecret(token)).dataValues;
  return jwt.decode(tokenAndSecret.token, tokenAndSecret.secret);
};
