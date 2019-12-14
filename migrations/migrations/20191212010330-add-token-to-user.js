'use strict';
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Users', 'token', {
      type: Sequelize.STRING
    }),
  down: queryInterface => Promise.all([queryInterface.removeColumn('Users', 'token')])
};
