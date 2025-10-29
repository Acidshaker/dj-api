'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('EventMusics', 'payment_method', {
      type: Sequelize.ENUM('card', 'cash'),
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "EventMusics"
      SET "payment_method" = 'card'
      WHERE "payment_method" IS NULL
    `);

    await queryInterface.changeColumn('EventMusics', 'payment_method', {
      type: Sequelize.ENUM('card', 'cash'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('EventMusics', 'payment_method');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_EventMusics_payment_method";');
  },
};
