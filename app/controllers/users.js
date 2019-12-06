const { signUp, findUserByEmail } = require('../services/users');
const { generateToken } = require('../helpers/token_generator');

exports.signUp = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  signUp(firstName, lastName, email, password)
    .then(user => res.status(201).send({ user }))
    .catch(next);
};

exports.signIn = async (req, res) => {
  const user = await findUserByEmail(req.body.email);
  res.send({ accessToken: generateToken(user) });
};
