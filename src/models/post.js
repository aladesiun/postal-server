const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Post extends Model {}

  Post.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      text: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      mediaUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'media_url',
      },
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      createdAt: 'created_at',
    }
  );

  return Post;
};

