'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('follows', {
      follower_id: { type: Sequelize.INTEGER, primaryKey: true },
      following_id: { type: Sequelize.INTEGER, primaryKey: true },
    });
    await queryInterface.addConstraint('follows', {
      fields: ['follower_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      name: 'fk_follows_follower_id',
    });
    await queryInterface.addConstraint('follows', {
      fields: ['following_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      name: 'fk_follows_following_id',
    });
    await queryInterface.addIndex('follows', ['follower_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('follows');
  }
};

