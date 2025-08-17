'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      text: { type: Sequelize.STRING(500), allowNull: true },
      media_url: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addConstraint('posts', {
      fields: ['user_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      name: 'fk_posts_user_id',
    });
    await queryInterface.addIndex('posts', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('posts');
  }
};

