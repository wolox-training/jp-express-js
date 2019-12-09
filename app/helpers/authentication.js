const jwt = require('jwt-simple');
const { secret } = require('../../config').common.auth;

exports.generateToken = user => {
  const payload = {
    id: user.id,
    email: user.email
  };

  return jwt.encode(payload, secret);
};

exports.decodeToken = token => jwt.decode(token, secret);
