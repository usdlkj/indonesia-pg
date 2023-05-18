'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('XenditPayments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      paymentChannel: {
        type: Sequelize.ENUM('cc','va','qr','ro'),
        allowNull: false,
      },
      responseType: {
        type: Sequelize.ENUM('ccCharged','vaCreated','vaCallback','vaChecked','qrCreated','qrCallback','roCreated','roCallback'),
        allowNull: false,
      },
      responseData: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('XenditPayments');
  }
};