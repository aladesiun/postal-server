'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
      user_id: { type: Sequelize.INTEGER, primaryKey: true },
      post_id: { type: Sequelize.INTEGER, primaryKey: true },
    });
    await queryInterface.addConstraint('likes', {
      fields: ['user_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      name: 'fk_likes_user_id',
    });
    await queryInterface.addConstraint('likes', {
      fields: ['post_id'],
      type: 'foreign key',
      references: { table: 'posts', field: 'id' },
      onDelete: 'CASCADE',
      name: 'fk_likes_post_id',
    });
    await queryInterface.addIndex('likes', ['post_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('likes');
  }
};

