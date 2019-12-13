'use strict';
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Users', 'role', {
      allowNull: false,
      type: Sequelize.ENUM,
      values: ['user', 'admin'],
      defaultValue: 'user'
    }),
  down: queryInterface => Promise.all([queryInterface.removeColumn('Users', 'role')])
};
