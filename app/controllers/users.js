const { signUp, findUserByEmail, findAll, updateAdmin, disableUserSessions } = require('../services/users');
const { findAlbumsByUser } = require('../services/albums');
const { generateToken } = require('../helpers/authentication');

exports.signUp = (req, res, next) => {
  signUp(req.body)
    .then(user => res.status(201).send({ user }))
    .catch(next);
};

exports.signIn = (req, res, next) => {
  findUserByEmail(req.body.email)
    .then(async user => res.send({ accessToken: await generateToken(user) }))
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

exports.getPurchasedAlbums = (req, res, next) => {
  findAlbumsByUser(req.params.userId)
    .then(albums => res.send({ albums }))
    .catch(next);
};

exports.disableAllSessions = (req, res, next) => {
  disableUserSessions(req.headers.accesstoken)
    .then(() => res.send())
    .catch(next);
};
