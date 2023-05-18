'use strict';
const {v4:uuidv4} = require('uuid');
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.hasMany(models.XenditPayment);
    }
  }
  Order.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    payerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoiceAmount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
    },
    amount: {
      type: DataTypes.VIRTUAL,
      get() {
        const rawValue = this.getDataValue('invoiceAmount');
        return rawValue ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rawValue) : null;
      }
    },
    paymentStatus: {
      type: DataTypes.ENUM('outstanding','paid','overdue','void','partial'),
      allowNull: false,
    },
    paymentGateway: {
      type: DataTypes.ENUM('xendit'),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('cc','va','qr','ro'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Order',
    paranoid: true,
    hooks: {
      beforeValidate: (order, options) => {
        order.id = uuidv4();
      }
    }
  });
  return Order;
};