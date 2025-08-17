const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Follow extends Model {}

  Follow.init(
    {
      followerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      followingId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'Follow',
      tableName: 'follows',
      underscored: true,
      timestamps: false,
    }
  );

  return Follow;
};

