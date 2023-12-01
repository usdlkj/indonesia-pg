const Xendit = require('xendit-node');
const x = new Xendit({
  secretKey: process.env.XENDIT_KEY,
});
const {Card, VirtualAcc, RetailOutlet} = x;
const db = require('../../models');
const Op = db.Sequelize.Op;
const Order = db.Order;
const XenditPayment = db.XenditPayment;
const axios = require('axios');
const { response } = require('express');
const moment = require('moment');

exports.landing = (req, res) => {
  res.render('xendit/home');
}

exports.responses = async (req, res) => {
  try {
    let order = await Order.findByPk(req.params.id, {
      include: [
        {model: XenditPayment, as: 'payments'},
      ]
    })
    res.render('xendit/responses', {
      order: order,
    })
  } catch (err) {
    req.session.message = err.message;
    res.redirect('/orders');
  }
}

exports.ccNew = (req, res) => {
  res.render('xendit/creditCard/charge', {
    xenditKey: process.env.XENDIT_PUBLIC_KEY,
  });
}

exports.ccCharge = async (req, res) => {
  const cardSpecificOptions = {};
  const card = new Card(cardSpecificOptions);

  try {
    let payerName = req.body.payerName;
    let payerPhone = req.body.payerPhone;
    let invoiceNumber = req.body.invoiceNumber;
    let invoiceAmount = req.body.invoiceAmount;

    let charge = await card.createCharge({
      tokenID: req.body.xenditToken,
      amount: invoiceAmount,
      externalID: invoiceNumber,
      billingDetails: {
        given_names: payerName,
        mobile_number: payerPhone,
        address: {
          country: 'ID',
        },
      },
    });

    let order = await Order.create({
      payerName: payerName,
      payerPhone: payerPhone,
      invoiceNumber: invoiceNumber,
      invoiceAmount: invoiceAmount,
      paymentStatus: 'paid',
      paymentGateway: 'xendit',
      paymentMethod: 'cc',
    });

    await XenditPayment.create({
      orderId: order.id,
      paymentChannel: 'cc',
      responseType: 'ccCharged',
      responseData: charge,
    });

    req.session.message = 'Credit card charged';
    res.redirect('/orders');
  } catch (err) {
    res.render('xendit/creditCard/charge', {
      xenditKey: process.env.XENDIT_PUBLIC_KEY,
      message: err.message,
    });
  }
}



exports.vaBanks = async (req, res) => {
  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);

  try {
    let banks = await va.getVABanks()
    res.render('xendit/virtualAccount/banks', {banks: banks});
  } catch (err) {
    req.session.message = err.message;
    res.redirect('/orders');
  }
}

exports.vaNew = async (req, res) => {
  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);

  try {
    let banks = await va.getVABanks()
    res.render('xendit/virtualAccount/create', {banks: banks});
  } catch (err) {
    req.session.message = err.message;
    res.redirect('/orders');
  }
}

exports.vaCreate = async (req, res) => {
  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);

  try {
    let payerName = req.body.payerName;
    let payerPhone = req.body.payerPhone;
    let invoiceNumber = req.body.invoiceNumber;
    let invoiceAmount = req.body.invoiceAmount;

    await va.createFixedVA({
      externalID: req.body.invoiceNumber,
      bankCode: req.body.bank,
      name: req.body.payerName,
      expectedAmt: invoiceAmount,
      isClosed: true,
    });

    await Order.create({
      payerName: payerName,
      payerPhone: payerPhone,
      invoiceNumber: invoiceNumber,
      invoiceAmount: invoiceAmount,
      paymentStatus: 'outstanding',
      paymentGateway: 'xendit',
      paymentMethod: 'va',
    });

    req.session.message = 'VA created';
    res.redirect('/orders');
  } catch (err) {
    req.session.message = err.message;
    res.redirect('/orders');
  }
}

exports.vaPay = async (req, res) => {
  try {
    let order = await Order.findByPk(req.params.id);
    let payments = await XenditPayment.findAll({
      where: {
        orderId: {[Op.eq]: order.id},
        paymentChannel: 'va',
        responseType: 'vaCreated',
      }
    });
    if (payments.length != 1) {
      throw new Error('VA creation data not found')
    } else {
      let vaCreated = JSON.parse(payments[0].responseData);
      let payment = await axios.post('https://api.xendit.co/pool_virtual_accounts/simulate_payment', {
        transfer_amount: parseFloat(vaCreated.expected_amount),
        bank_account_number: vaCreated.account_number,
        bank_code: vaCreated.bank_code,
      }, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.XENDIT_KEY + ':')}`,
        }
      });

      if (payment.status == 'COMPLETED') {
        order.paymentStatus = 'paid';
        await order.save();
      } else {
        throw new Error(payment.message);
      }
      
      req.session.message = payment.message;
      res.redirect('/orders');
    }
  } catch (err) {
    req.session.message = err.message;
    res.redirect('/orders');
  }
}


exports.vaCancel = async (req, res) => {
  try {
    // If triggered, find one order by its invoice number
    var order = await Order.findByPk(req.params.id);

    var vaCreated = await XenditPayment.findOne({
      where: {
        orderId: order.id,
        responseType: 'vaCreated'
      }
    });
    
    var responseData = JSON.parse(vaCreated.responseData);
    var yesterday = moment().subtract(1, 'days').utc().format();

    const res = await axios.patch(`https://api.xendit.co/callback_virtual_accounts/${responseData.id}`, {
      expiration_date: yesterday
    }, {
      headers: {
        'Authorization': `Basic ${btoa(process.env.XENDIT_KEY + ':')}`,
      }
    });
    console.log(res);

    order.paymentStatus = 'cancelled';
    await order.save();

    res.redirect('/orders');
  } catch (err) {
    console.log(err.message);
    res.redirect('/orders');
  }
};

exports.qrNew = (req, res) => {
  res.render('xendit/qr/create');
}

exports.qrCreate = async (req, res) => {
  try {
    let qr = await axios.post(process.env.XENDIT_QR_URL, {
      headers: {
        'api-version': process.env.XENDIT_API_VERSION,
      },
      data: {
        reference_id: req.body.invoiceNumber,
        type: 'STATIC',
        currency: 'IDR',
        amount: req.body.invoiceAmount,
      }
    });

    let order = await Order.create({
      payerName: payerName,
      payerPhone: payerPhone,
      invoiceNumber: invoiceNumber,
      invoiceAmount: invoiceAmount,
      paymentStatus: 'outstanding',
      paymentGateway: 'xendit',
      paymentMethod: 'va',
    });

    await XenditPayment.create({
      orderId: order.id,
      paymentChannel: 'qr',
      responseType: 'qrCreated',
      responseData: qr,
    });

    req.session.message = 'QR created';
    res.redirect('/orders');
  } catch (err) {
    req.session.message = err.message;
    res.redirect('/orders');
  }
}

exports.roNew = (req, res) => {
  res.render('xendit/retail/create');
}

exports.roCreate = async (req, res) => {
  const retailOutletSpecificOptions = {};
  const ro = new RetailOutlet(retailOutletSpecificOptions);

  try {
    let payerName = req.body.payerName;
    let payerPhone = req.body.payerPhone;
    let invoiceNumber = req.body.invoiceNumber;
    let invoiceAmount = req.body.invoiceAmount;

    let roPayment = await ro.createFixedPaymentCode({
      externalID: invoiceNumber,
      retailOutletName: req.body.retail,
      name: payerName,
      expectedAmt: invoiceAmount,
    });

    let order = await Order.create({
      payerName: payerName,
      payerPhone: payerPhone,
      invoiceNumber: invoiceNumber,
      invoiceAmount: invoiceAmount,
      paymentStatus: 'outstanding',
      paymentGateway: 'xendit',
      paymentMethod: 'ro',
    });
    
    await XenditPayment.create({
      orderId: order.id,
      paymentChannel: 'ro',
      responseType: 'roCreated',
      responseData: roPayment,
    });

    req.session.message = 'RO created';
    res.redirect('/orders');
  } catch (err) {
    req.session.message = err.message;
    res.redirect('/orders');
  }
}

exports.roPay = async (req, res) => {
  try {
    let order = await Order.findByPk(req.params.id);
    let payments = await XenditPayment.findAll({
      where: {
        orderId: {[Op.eq]: order.id},
        paymentChannel: 'ro',
        responseType: 'roCreated',
      }
    });
    if (payments.length != 1) {
      throw new Error('RO creation data not found')
    } else {
      let data = JSON.parse(payments[0].responseData);
      let payment = await axios.post('https://api.xendit.co/fixed_payment_code/simulate_payment', {
        transfer_amount: parseFloat(data.expected_amount),
        retail_outlet_name: data.retail_outlet_name,
        payment_code: data.payment_code,
      }, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.XENDIT_KEY + ':')}`,
        }
      });

      payment = JSON.parse(payment);
      if (payment.status == 'COMPLETED') {
        order.paymentStatus = 'paid';
        await order.save();
      } else {
        throw new Error(payment.message);
      }
      
      req.session.message = payment.message;
      res.redirect('/orders');
    }
  } catch (err) {
    req.session.message = err.message;
    res.redirect('/orders');
  }
}