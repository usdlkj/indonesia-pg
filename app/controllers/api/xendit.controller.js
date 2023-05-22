const Xendit = require('xendit-node');
const x = new Xendit({
  secretKey: process.env.XENDIT_KEY,
});
const {VirtualAcc} = x;
const db = require('../../models');
const Order = db.Order;
const XenditPayment = db.XenditPayment;
const Op = db.Sequelize.Op;

exports.vaCreated = async (req, res) => {
  try {
    // Verify the callback token
    if (req.headers['x-callback-token'] == process.env.XENDIT_CALLBACK_TOKEN) {
      res.status(200).send();

      // If triggered, find one order by its invoice number
      let orders = await Order.findAll({where: {invoiceNumber: {[Op.eq]: req.body.external_id}}});
      let order;
      if (orders.length == 0) {
        throw new Error('Invoice not found');
      } else {
        order = orders[0];
      }

      // Store the callback's data
      await XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'va',
        responseType: 'vaCreated',
        responseData: req.body,
      });
    } else {
      throw new Error('Wrong callback token');
    }
  } catch (err) {
    console.log(err.message);
  }
}

exports.vaPayment = async (req, res) => {
  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);

  try {
    // Verify the callback token
    if (req.headers['x-callback-token'] == process.env.XENDIT_CALLBACK_TOKEN) {
      res.status(200).send();

      // If triggered, find one order by its invoice number
      let orders = await Order.findAll({where: {invoiceNumber: {[Op.eq]: req.body.external_id}}});
      let order;
      if (orders.length == 0) {
        throw new Error('Invoice not found');
      } else {
        order = orders[0];
      }

      // Store the callback's data
      await XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'va',
        responseType: 'vaCallback',
        responseData: req.body,
      });

      // Verify the payment with Xendit
      let check = await va.getVAPayment({paymentID: req.body.payment_id})

      // Store the response
      await XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'va',
        responseType: 'vaChecked',
        responseData: check,
      });

      // Update the order information to paid
      order.paymentStatus = order.invoiceAmount == parseFloat(check.amount) ? 'paid' : 'partial';
      await order.save();
    } else {
      throw new Error('Wrong callback token');
    }
  } catch (err) {
   console.log(err.message);
  }
}

exports.qrPayment = async (req, res) => {
  try {
    let payment = req.body.data;

    // Verify the callback token
    if (req.headers['x-callback-token'] == process.env.XENDIT_CALLBACK_TOKEN) {

      // If triggered, find one order by its invoice number
      let orders = await Order.findAll({where: {invoiceNumber: {[Op.eq]: payment.reference_id}}});
      let order;
      if (orders.length == 0) {
        throw new Error('Invoice not found');
      } else {
        order = orders[0];
      }

      // Store the callback's data
      await XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'qr',
        responseType: 'qrCallback',
        responseData: req.body,
      });

      // Update the order information to paid
      order.paymentStatus = 'paid';
      await order.save();

      res.status(200).send();
    } else {
      throw new Error('Wrong callback token');
    }
  } catch (err) {
    res.status(500).send({message: err.message});
  }
}

exports.roPayment = async (req, res) => {
  try {
    // Verify the callback token
    if (req.headers['x-callback-token'] == process.env.XENDIT_CALLBACK_TOKEN) {

      // If triggered, find one order by its invoice number
      let orders = await Order.findAll({where: {invoiceNumber: {[Op.eq]: req.body.external_id}}});
      let order;
      if (orders.length == 0) {
        throw new Error('Invoice not found');
      } else {
        order = orders[0];
      }

      // Store the callback's data
      await XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'ro',
        responseType: 'roCallback',
        responseData: req.body,
      });

      // Update the order information to paid
      order.paymentStatus = 'paid';
      await order.save();

      res.status(200).send();
    } else {
      throw new Error('Wrong callback token');
    }
  } catch (err) {
    res.status(500).send({message: err.message});
  }
}