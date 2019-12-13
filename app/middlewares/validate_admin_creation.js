const { validationResult } = require('express-validator');
const { userValidationError, missingRequiredParams, unauthorized, forbidden } = require('../errors');
const { passwordRegexp, emailRegexp } = require('../helpers/constants');
const { decodeToken } = require('../helpers/authentication');

exports.validateCreateAdminRequest = (req, res, next) => {
  const { errors } = validationResult(req);
  const { firstName, lastName, email, password } = req.body;
  const { accesstoken } = req.headers;

  try {
    const userInfo = decodeToken(accesstoken);
    if (userInfo.role === 'user') {
      return next(forbidden('You don`t have the permission to perform this action'));
    }
  } catch (error) {
    return next(unauthorized(`Invalid token. ${error.message}`));
  }

  if (!firstName || !lastName || !email || !password) {
    return next(missingRequiredParams('One of the required params is missing'));
  }

  if (!emailRegexp.test(email)) {
    return next(userValidationError(`The email ${email} is not from our Wolox domain`));
  }

  if (!passwordRegexp.test(password)) {
    return next(userValidationError("The password doesn't meet our stadards"));
  }

  if (errors.length > 0) {
    const errorsMessages = errors.map(error => error.msg);
    return next(userValidationError(`Errors: ${errorsMessages}`));
  }

  return next();
};
