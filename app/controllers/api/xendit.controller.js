const Xendit = require('xendit-node');
const x = new Xendit({
  secretKey: process.env.XENDIT_KEY,
});
const {VirtualAcc} = x;
const db = require('../../models');
const Order = db.Order;
const XenditPayment = db.XenditPayment;
const Op = db.Sequelize.Op;

exports.vaCreated = (req, res) => {

  // Verify the callback token
  if (req.headers['x-callback-token'] == process.env.XENDIT_CALLBACK_TOKEN) {

    // If triggered, find one order by its invoice number
    Order.findAll({where: {invoiceNumber: {[Op.eq]: req.body.external_id}}})
    .then(data => {
      if (data.length == 0) {
        console.log('Invoice not found');
      } else {
        order = data[0];
      }

      // Store the callback's data
      XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'va',
        responseType: 'vaCreated',
        responseData: req.body,
      })
    });

    res.status(200).send();
  } else {

    // Wrong callback token
    console.log('Wrong callback token');
    res.status(500).send();
  }
}

exports.vaPayment = (req, res) => {
  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);

  // Verify the callback token
  if (req.headers['x-callback-token'] == process.env.XENDIT_CALLBACK_TOKEN) {

    // If triggered, find one order by its invoice number
    Order.findAll({where: {invoiceNumber: {[Op.eq]: req.body.external_id}}})
    .then(data => {
      if (data.length == 0) {
        console.log('Invoice not found');
      } else {
        order = data[0];

        // Store the callback's data
        XenditPayment.create({
          orderId: order.id,
          paymentChannel: 'va',
          responseType: 'vaCallback',
          responseData: req.body,
        })
        .then(() => {

          // Verify the payment with Xendit
          va.getVAPayment({paymentID: req.body.payment_id})
          .then(check => {

            // Store the response
            XenditPayment.create({
              orderId: order.id,
              paymentChannel: 'va',
              responseType: 'vaChecked',
              responseData: check,
            })

            // Update the order information to paid
            if (order.invoiceAmount == parseFloat(check.amount)) {
              order.paymentStatus = 'paid';
              order.save()
              .then(() => {
                console.log('Invoice paid');
              })
              .catch(err => {
                console.log(err.message);
            });
            } else {
              order.paymentStatus = 'partial';
              order.save()
              .then(() => {
                console.log('Invoice paid');
              })
              .catch(err => {
                console.log(err.message);
              });
            }
          })
          .catch(err => {
            console.log(`Error: ${err.message}`);
          })
        })
      }
    })
    res.status(200).send();
  } else {
    
    // Wrong callback token
    console.log('Wrong callback token');
    res.status(500).send();
  }
}

exports.qrPayment = (req, res) => {
  let payment = req.body.data;

  // Verify the callback token
  if (req.headers['x-callback-token'] == process.env.XENDIT_CALLBACK_TOKEN) {

    // If triggered, find one order by its invoice number
    Order.findAll({where: {invoiceNumber: {[Op.eq]: payment.reference_id}}})
    .then(data => {
      if (data.length == 0) {
        console.log('Invoice not found');
      } else {
        order = data[0];

        // Store the callback's data
        XenditPayment.create({
          orderId: order.id,
          paymentChannel: 'qr',
          responseType: 'qrCallback',
          responseData: req.body,
        })
        .then(() => {

          // Update the order information to paid
          order.paymentStatus = 'paid';
          order.save()
          .then(() => {
            console.log('Invoice paid');
          })
          .catch(err => {
            console.log(err.message);
          });
        })
      }
    })
    res.status(200).send();
  } else {
    
    // Wrong callback token
    console.log('Wrong callback token');
    res.status(500).send();
  }
}

exports.roPayment = (req, res) => {
  // Verify the callback token
  if (req.headers['x-callback-token'] == process.env.XENDIT_CALLBACK_TOKEN) {

    // If triggered, find one order by its invoice number
    Order.findAll({where: {invoiceNumber: {[Op.eq]: req.body.external_id}}})
    .then(data => {
      if (data.length == 0) {
        console.log('Invoice not found');
      } else {
        order = data[0];

        // Store the callback's data
        XenditPayment.create({
          orderId: order.id,
          paymentChannel: 'ro',
          responseType: 'roCallback',
          responseData: req.body,
        })
        .then(() => {

          // Update the order information to paid
          order.paymentStatus = 'paid';
          order.save()
          .then(() => {
            console.log('Invoice paid');
          })
          .catch(err => {
            console.log(err.message);
          });
        })
      }
    })
    res.status(200).send();
  } else {
    
    // Wrong callback token
    console.log('Wrong callback token');
    res.status(500).send();
  }
}