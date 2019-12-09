const errors = require('../errors');
const logger = require('../logger');

const DEFAULT_STATUS_CODE = 500;

const statusCodes = {
  [errors.DATABASE_ERROR]: 422,
  [errors.MISSING_REQUIRED_PARAMS]: 422,
  [errors.DEFAULT_ERROR]: 500,
  [errors.USER_VALIDATION_ERROR]: 500,
  [errors.UNAUTHORIZED]: 401,
  [errors.FORBIDDEN]: 403,
  [errors.CONFLICT]: 409
};

exports.handle = (error, req, res, next) => {
  if (error.internalCode) res.status(statusCodes[error.internalCode] || DEFAULT_STATUS_CODE);
  else {
    // Unrecognized error, notifying it to rollbar.
    next(error);
    res.status(DEFAULT_STATUS_CODE);
  }
  logger.error(error);
  return res.send({ message: error.message, internal_code: error.internalCode });
};
