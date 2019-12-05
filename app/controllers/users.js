const { signUp, findUserByEmail, findAll } = require('../services/users');
const { generateToken } = require('../helpers/authentication');

exports.signUp = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  signUp(firstName, lastName, email, password)
    .then(user => res.status(201).send({ user }))
    .catch(next);
};

exports.signIn = (req, res, next) => {
  findUserByEmail(req.body.email)
    .then(user => res.send({ accessToken: generateToken(user) }))
    .catch(next);
};

exports.index = (req, res, next) => {
  const { page, limit } = req.query;
  findAll(page, limit)
    .then(users => res.send({ users }))
    .catch(next);
};
