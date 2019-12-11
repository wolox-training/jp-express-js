const { validationResult } = require('express-validator');
const { userValidationError, unauthorized, forbidden } = require('../errors');
const { decodeToken } = require('../helpers/authentication');

exports.validateGetPurchasedAlbums = (req, res, next) => {
  const { errors } = validationResult(req);
  const { accesstoken } = req.headers;
  const { userId } = req.params;

  try {
    const { role, id } = decodeToken(accesstoken);
    if (role === 'user' && id !== parseInt(userId)) {
      return next(forbidden('You don`t have the permission to see purchased albums of other user'));
    }
  } catch (error) {
    return next(unauthorized(`Invalid token. ${error.message}`));
  }

  if (errors.length > 0) {
    const errorsMessages = errors.map(error => error.msg);
    return next(userValidationError(`Errors: ${errorsMessages}`));
  }

  return next();
};
