'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('registration', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_registration_branch_id',
      references: {
        table: 'branch',
        field: 'branch_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('registration', 'fk_registration_branch_id');
  }
};
