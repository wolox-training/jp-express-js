const { signUp, findUserByEmail, findAll, updateAdmin } = require('../services/users');
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

exports.createAdmin = async (req, res, next) => {
  const user_params = req.body;
  const user = await findUserByEmail(user_params.email);
  if (user) {
    updateAdmin(user.dataValues.id)
      .then(() => res.status(201).send())
      .catch(next);
  } else {
    user_params.role = 'admin';
    signUp(user_params)
      .then(() => res.status(201).send())
      .catch(next);
  }
};
