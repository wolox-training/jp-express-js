const bcrypt = require('bcryptjs');

exports.encrypt = (password, salt) => bcrypt.hashSync(password, bcrypt.genSaltSync(salt));

exports.acceptedPassword = (password, hash) => bcrypt.compareSync(password, hash);
