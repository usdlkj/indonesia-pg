'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      payerName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      payerPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      invoiceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      invoiceAmount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false,
      },
      paymentStatus: {
        type: Sequelize.ENUM('outstanding','paid','overdue','voice','partial'),
        allowNull: false,
      },
      paymentGateway: {
        type: Sequelize.ENUM('xendit'),
        allowNull: false,
      },
      paymentMethod: {
        type: Sequelize.ENUM('cc','va','qr','ro'),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};