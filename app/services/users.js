const { User } = require('../models');
const { databaseError } = require('../errors');
const { encrypt } = require('../helpers/encryption');
const logger = require('../logger/index');

exports.findUserByEmail = email =>
  User.findOne({ where: { email } }).catch(error => {
    throw databaseError(error.message);
  });

exports.signUp = (firstName, lastName, email, password) =>
  User.create({ firstName, lastName, email, password: encrypt(password, 10) })
    .then(result => {
      logger.info(`User ${result.dataValues.firstName} ${result.dataValues.lastName} 
        with email ${result.dataValues.email}, was created successfully`);
      return result.dataValues;
    })
    .catch(error => {
      logger.error(error.message);
      throw databaseError(error.message);
    });
