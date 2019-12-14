const { User } = require('../models');
const { databaseError } = require('../errors');
const { encrypt } = require('../helpers/encryption');
const { pag_params } = require('../helpers/pagination');
const { randomSecret } = require('../helpers/constants');
const authentication = require('../helpers/authentication');
const logger = require('../logger/index');

exports.findUserByEmail = email =>
  User.findOne({ where: { email } }).catch(error => {
    logger.error(error.message);
    throw databaseError(error.message);
  });

exports.signUp = userParams => {
  userParams.password = encrypt(userParams.password);
  return User.create(userParams)
    .then(result => {
      logger.info(`User ${result.dataValues.firstName} ${result.dataValues.lastName} 
        with email ${result.dataValues.email}, was created successfully`);
      return result.dataValues;
    })
    .catch(error => {
      logger.error(error.message);
      throw databaseError(error.message);
    });
};

exports.findAll = (page = 1, limit = 10) =>
  User.findAll({ ...pag_params(page, limit), attributes: ['id', 'firstName', 'lastName', 'email'] }).catch(
    error => {
      logger.error(error.message);
      throw databaseError(error.message);
    }
  );

exports.updateAdmin = id =>
  User.update({ role: 'admin' }, { where: { id } }).catch(error => {
    logger.error(error.message);
    throw databaseError(error.message);
  });

exports.updateTokenAndSecret = (id, token, secret) =>
  User.update({ token, secret }, { where: { id } }).catch(error => {
    logger.error(error.message);
    throw databaseError(error.message);
  });

exports.findTokenAndSecret = token =>
  User.findOne({ attributes: ['token', 'secret'], where: { token } }).catch(error => {
    logger.error(error.message);
    throw databaseError(error.message);
  });

exports.disableUserSessions = async token => {
  const userInfo = await authentication.decodeToken(token);
  return this.updateTokenAndSecret(userInfo.id, token, randomSecret());
};
