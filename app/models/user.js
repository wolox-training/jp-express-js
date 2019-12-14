'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM,
        values: ['user', 'admin'],
        allowNull: false,
        defaultValue: 'user'
      },
      token: {
        type: DataTypes.STRING
      },
      secret: {
        type: DataTypes.STRING
      }
    },
    {}
  );
  User.associate = models => {
    User.hasMany(models.Album, { as: 'albumUser' });
  };
  return User;
};
