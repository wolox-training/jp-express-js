const { validationResult } = require('express-validator');
const { userValidationError, unauthorized } = require('../errors');
const { decodeToken } = require('../helpers/authentication');

exports.authenticate = (req, res, next) => {
  const { errors } = validationResult(req);
  const { accesstoken } = req.headers;

  try {
    decodeToken(accesstoken);
  } catch (error) {
    next(unauthorized(`Invalid token. ${error.message}`));
  }

  if (errors.length > 0) {
    const errorsMessages = errors.map(error => error.msg);
    next(userValidationError(`Errors: ${errorsMessages}`));
  }

  next();
};
