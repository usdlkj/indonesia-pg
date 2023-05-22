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

exports.landing = (req, res) => {
  res.render('xendit/home');
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

exports.rtNew = (req, res) => {
  res.render('xendit/retail/create');
}

exports.rtCreate = async (req, res) => {
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