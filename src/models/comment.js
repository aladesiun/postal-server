const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Comment extends Model {}

  Comment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      text: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'comments',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      createdAt: 'created_at',
    }
  );

  return Comment;
};

