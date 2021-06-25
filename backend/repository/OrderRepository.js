const sequelize = require("../provider/sequelize")
const Order = require("../models/Order")

const ORDER_PER_PAGE = 10

class OrderRepository {
  SaveOrder(data = {}) {
    return sequelize.transaction((t) => {
      const { description } = JSON.parse(data.embeddata)
      
      Order.create({
        apptransid: data.apptransid,
        zptransid: data.zptransid,
        channel: data.channel,
        timestamp: data.servertime,
        amount: data.amount,
        description,
      })
    })
  }

  async Paginate(page = 1) {
    const { rows: orders, count: totalOrder } = await Order.findAndCountAll({
      order: [["timestamp", "DESC"]],
      offset: (page - 1) * ORDER_PER_PAGE,
      limit: ORDER_PER_PAGE,
    })

    return {
      currentPage: page,
      orders,
      totalOrder,
      orderPerPage: ORDER_PER_PAGE,
    }
  }
}

module.exports = new OrderRepository()
