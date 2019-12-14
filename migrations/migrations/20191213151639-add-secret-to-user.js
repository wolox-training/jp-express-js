'use strict';
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Users', 'secret', {
      type: Sequelize.STRING
    }),
  down: queryInterface => Promise.all([queryInterface.removeColumn('Users', 'secret')])
};
