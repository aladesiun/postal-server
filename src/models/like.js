const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Like extends Model {}

  Like.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      postId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'Like',
      tableName: 'likes',
      underscored: true,
      timestamps: false,
    }
  );

  return Like;
};

