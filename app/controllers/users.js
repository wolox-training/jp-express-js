const { signUp } = require('../services/users');

exports.signUp = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  signUp(firstName, lastName, email, password)
    .then(user => res.status(201).send({ user }))
    .catch(next);
};
