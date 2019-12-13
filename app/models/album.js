'use strict';
module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define(
    'Album',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      albumId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {}
  );
  Album.associate = models => {
    Album.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };
  return Album;
};
