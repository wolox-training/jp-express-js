const { validationResult } = require('express-validator');
const { userValidationError, missingRequiredParams, databaseError } = require('../errors');
const { passwordRegexp, emailRegexp } = require('../helpers/constants');
const { findUserByEmail } = require('../services/users');

exports.validateCreateUserRequest = async (req, res, next) => {
  const { errors } = validationResult(req);
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    next(missingRequiredParams('One of the required params is missing'));
  }

  if (!emailRegexp.test(email)) next(userValidationError(`The email ${email} is not from our Wolox domain`));

  if (!passwordRegexp.test(password)) next(userValidationError("The password doesn't meet our stadards"));

  const user = await findUserByEmail(email);

  if (user) next(databaseError(`A user with the email ${email} already exists.`));

  if (errors.length > 0) {
    const errorsMessages = errors.map(error => error.msg);
    next(userValidationError(`Errors: ${errorsMessages}`));
  }

  next();
};
