const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      bio: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      avatarUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'avatar_url',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      // Map camelCase attributes to snake_case columns
      indexes: [],
    }
  );

  return User;
};
