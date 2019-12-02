const { validationResult } = require('express-validator');
const { userValidationError } = require('../errors');
const { passwordRegexp, emailRegexp } = require('../helpers/constants');
const { findUserByEmail } = require('../services/users');

exports.validateUser = async (req, res, next) => {
  const { errors } = validationResult(req);
  const { email, password } = req.body;

  if (!emailRegexp.test(email)) next(userValidationError(`The email ${email} is not from our Wolox domain`));

  if (!passwordRegexp.test(password)) next(userValidationError("The password doesn't meet our stadards"));

  const user = await findUserByEmail(email);

  if (user) next(userValidationError(`A user with the email ${email} already exists.`));

  if (errors.length > 0) {
    const errorsMessages = errors.map(error => error.msg);
    next(userValidationError(`Errors: ${errorsMessages}`));
  }

  next();
};
