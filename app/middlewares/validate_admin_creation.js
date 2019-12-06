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
    if (userInfo.role === 'user') next(forbidden('You don`t have the permission to perform this action'));
  } catch (error) {
    next(unauthorized(`Invalid token. ${error.message}`));
  }

  if (!firstName || !lastName || !email || !password) {
    next(missingRequiredParams('One of the required params is missing'));
  }

  if (!emailRegexp.test(email)) next(userValidationError(`The email ${email} is not from our Wolox domain`));

  if (!passwordRegexp.test(password)) next(userValidationError("The password doesn't meet our stadards"));

  if (errors.length > 0) {
    const errorsMessages = errors.map(error => error.msg);
    next(userValidationError(`Errors: ${errorsMessages}`));
  }

  next();
};
