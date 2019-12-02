const bcrypt = require('bcryptjs');

exports.encrypt = (password, salt) => bcrypt.hashSync(password, bcrypt.genSaltSync(salt));
