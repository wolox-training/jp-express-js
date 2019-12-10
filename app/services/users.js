const { User } = require('../models');
const { databaseError } = require('../errors');
const { encrypt } = require('../helpers/encryption');
const { pag_params } = require('../helpers/pagination');
const logger = require('../logger/index');

exports.findUserByEmail = email =>
  User.findOne({ where: { email } }).catch(error => {
    logger.error(error.message);
    throw databaseError(error.message);
  });

exports.signUp = user_params => {
  user_params.password = encrypt(user_params.password);
  return User.create(user_params)
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

exports.updateAdmin = user_id =>
  User.update({ role: 'admin' }, { where: { id: user_id } }).catch(error => {
    logger.error(error.message);
    throw databaseError(error.message);
  });
