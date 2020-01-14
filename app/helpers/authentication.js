const jwt = require('jwt-simple');
const moment = require('moment');
const { findTokenAndSecret, updateTokenAndSecret } = require('../services/users');
const { randomSecret, DEFAULT_EXPIRED_DATA } = require('./constants');

exports.generateToken = async (user, expired_data = DEFAULT_EXPIRED_DATA) => {
  const tokenExpiresAt = moment().add(expired_data.value, expired_data.unit);
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    expires_at: tokenExpiresAt.unix()
  };
  const secret = randomSecret();
  const token = jwt.encode(payload, secret);
  await updateTokenAndSecret(user.id, token, secret);
  return {
    access_token: token,
    expires_at: tokenExpiresAt.format('YYYY-MM-DD HH:mm')
  };
};

exports.decodeToken = async token => {
  try {
    const tokenAndSecret = (await findTokenAndSecret(token)).dataValues;
    const tokenPayload = jwt.decode(tokenAndSecret.token, tokenAndSecret.secret);
    if (!tokenPayload.expires_at || tokenPayload.expires_at < moment().unix()) {
      throw Error('The Token expired');
    }
    return tokenPayload;
  } catch (error) {
    throw error;
  }
};
