const { sequelize } = require('../config/database');

const defineUser = require('./user');
const definePost = require('./post');
const defineComment = require('./comment');
const defineLike = require('./like');
const defineFollow = require('./follow');

const models = {};

models.User = defineUser(sequelize);
models.Post = definePost(sequelize);
models.Comment = defineComment(sequelize);
models.Like = defineLike(sequelize);
models.Follow = defineFollow(sequelize);

// Associations
models.User.hasMany(models.Post, { foreignKey: { name: 'userId', field: 'user_id' } });
models.Post.belongsTo(models.User, { foreignKey: { name: 'userId', field: 'user_id' } });

models.User.hasMany(models.Comment, { foreignKey: { name: 'userId', field: 'user_id' } });
models.Comment.belongsTo(models.User, { foreignKey: { name: 'userId', field: 'user_id' } });
models.Post.hasMany(models.Comment, { foreignKey: { name: 'postId', field: 'post_id' } });
models.Comment.belongsTo(models.Post, { foreignKey: { name: 'postId', field: 'post_id' } });

models.User.belongsToMany(models.Post, { through: models.Like, as: 'LikedPosts', foreignKey: { name: 'userId', field: 'user_id' }, otherKey: { name: 'postId', field: 'post_id' } });
models.Post.belongsToMany(models.User, { through: models.Like, as: 'Likers', foreignKey: { name: 'postId', field: 'post_id' }, otherKey: { name: 'userId', field: 'user_id' } });

models.User.belongsToMany(models.User, {
  through: models.Follow,
  as: 'Following',
  foreignKey: { name: 'followerId', field: 'follower_id' },
  otherKey: { name: 'followingId', field: 'following_id' },
});
models.User.belongsToMany(models.User, {
  through: models.Follow,
  as: 'Followers',
  foreignKey: { name: 'followingId', field: 'following_id' },
  otherKey: { name: 'followerId', field: 'follower_id' },
});

module.exports = { sequelize, models };
