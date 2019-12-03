const { validationResult } = require('express-validator');
const { userValidationError } = require('../errors');
const { findUserByEmail } = require('../services/users');
const { acceptedPassword } = require('../helpers/encryption');

exports.validateLoginUserRequest = async (req, res, next) => {
  const { errors } = validationResult(req);
  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  if (!user) {
    next(userValidationError(`There is no user with the email ${email} in our system.`));
  } else if (!acceptedPassword(password, user.password)) next(userValidationError('The password is invalid'));

  if (errors.length > 0) {
    const errorsMessages = errors.map(error => error.msg);
    next(userValidationError(`Errors: ${errorsMessages}`));
  }

  next();
};
