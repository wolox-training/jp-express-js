const { signUp, findUserByEmail, findAll, createOrUpdateAdmin } = require('../services/users');
const { generateToken } = require('../helpers/authentication');

exports.signUp = (req, res, next) => {
  signUp(req.body)
    .then(user => res.status(201).send({ user }))
    .catch(next);
};

exports.signIn = (req, res, next) => {
  findUserByEmail(req.body.email)
    .then(user => res.send({ accessToken: generateToken(user) }))
    .catch(next);
};

exports.getAllUsers = (req, res, next) => {
  const { page, limit } = req.query;
  findAll(page, limit)
    .then(users => res.send({ users }))
    .catch(next);
};

exports.createAdmin = (req, res, next) => {
  createOrUpdateAdmin(req.body)
    .then(() => res.status(201).send())
    .catch(next);
};
