const db = require('../../models');
const Order = db.Order;

exports.list = (req, res) => {
  Order.findAll()
  .then(data => {
    res.render('order/list', {
      orders: data,
    })
  })
}