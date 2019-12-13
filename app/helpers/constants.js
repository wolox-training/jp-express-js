module.exports = {
  passwordRegexp: new RegExp('[a-zA-Z0-9]{8}'),
  emailRegexp: new RegExp('[a-zA-Z0-9]*@(wolox.co).*')
};

exports.DEFAULT_PASSWORD_SALT = 10;
