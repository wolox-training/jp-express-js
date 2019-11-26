const { signUp } = require('../services/users');

exports.signUp = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  signUp(firstName, lastName, email, password)
    .then(user => {
      res.status(201).send(`A new User was created!
        firstName: '${user.firstName}', lastName: '${user.lastName}', email: '${user.email}'`);
    })
    .catch(next);
};
