'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Orders", {
      apptransid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      zptransid: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.BIGINT,
      },
      timestamp: {
        type: Sequelize.BIGINT,
      },
      channel: {
        type: Sequelize.INTEGER,
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Orders');
  }
};