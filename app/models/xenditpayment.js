'use strict';
const {v4:uuidv4} = require('uuid');
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class XenditPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      XenditPayment.belongsTo(models.Order);
    }
  }
  XenditPayment.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    paymentChannel: {
      type: DataTypes.ENUM('cc','va','qr','ro'),
      allowNull: false,
    },
    responseType: {
      type: DataTypes.ENUM('ccCharged','vaCreated','vaCallback','vaChecked','qrCreated','qrCallback','roCreated','roCallback'),
      allowNull: false,
    },
    responseData: {
      type: DataTypes.JSON,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'XenditPayment',
    hooks: {
      beforeValidate: (xendit, options) => {
        xendit.id = uuidv4();
      }
    }
  });
  return XenditPayment;
};