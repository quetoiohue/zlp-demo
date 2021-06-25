const { Sequelize, DataTypes } = require("sequelize")
const sequelize = require("../provider/sequelize")

class Order extends Sequelize.Model {}
Order.init(
  {
    apptransid: {
      type: Sequelize.STRING,
      primaryKey: true,
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
  },
  {
    sequelize,
    modelName: "Order", 
    tableName: 'Orders'
  }
)

module.exports = Order
