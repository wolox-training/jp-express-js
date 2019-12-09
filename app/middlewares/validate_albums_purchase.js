const { validationResult } = require('express-validator');
const { userValidationError, unauthorized, forbidden } = require('../errors');
const { decodeToken } = require('../helpers/authentication');

exports.validateAlbumsPurchase = (req, res, next) => {
  const { errors } = validationResult(req);
  const { accesstoken } = req.headers;

  try {
    const userInfo = decodeToken(accesstoken);
    if (userInfo.role === 'user') next(forbidden('You don`t have the permission to perform this action'));
  } catch (error) {
    next(unauthorized(`Invalid token. ${error.message}`));
  }

  if (errors.length > 0) {
    const errorsMessages = errors.map(error => error.msg);
    next(userValidationError(`Errors: ${errorsMessages}`));
  }

  next();
};
