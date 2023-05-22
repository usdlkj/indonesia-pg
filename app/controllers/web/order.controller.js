const db = require('../../models');
const Order = db.Order;

exports.list = async (req, res) => {
  try {
    let orders = await Order.findAll();
    let message = req.session.message;
    if (message) {
      req.session.message = null;
    }
    res.render('order/list', {
      orders: orders,
      message: message,
    });
  } catch (err) {
    res.status(500).send({message: err.message});
  }
}