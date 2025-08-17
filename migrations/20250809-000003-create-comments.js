'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      post_id: { type: Sequelize.INTEGER, allowNull: false },
      text: { type: Sequelize.STRING(300), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addConstraint('comments', {
      fields: ['user_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      name: 'fk_comments_user_id',
    });
    await queryInterface.addConstraint('comments', {
      fields: ['post_id'],
      type: 'foreign key',
      references: { table: 'posts', field: 'id' },
      onDelete: 'CASCADE',
      name: 'fk_comments_post_id',
    });
    await queryInterface.addIndex('comments', ['post_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('comments');
  }
};

