const Xendit = require('xendit-node');
const x = new Xendit({
  secretKey: process.env.XENDIT_KEY,
});
const {Card, VirtualAcc, RetailOutlet} = x;
const db = require('../../models');
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

exports.ccCharge = (req, res) => {
  const cardSpecificOptions = {};
  const card = new Card(cardSpecificOptions);

  let payerName = req.body.payerName;
  let payerPhone = req.body.payerPhone;
  let invoiceNumber = req.body.invoiceNumber;
  let invoiceAmount = req.body.invoiceAmount;

  card.createCharge({
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
  })
  .then(charge => {
    Order.create({
      payerName: payerName,
      payerPhone: payerPhone,
      invoiceNumber: invoiceNumber,
      invoiceAmount: invoiceAmount,
      paymentStatus: 'paid',
      paymentGateway: 'xendit',
      paymentMethod: 'cc',
    })
    .then(order => {
      XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'cc',
        responseType: 'ccCharged',
        responseData: charge,
      })
      .then(() => {
        res.redirect('/orders');
      })
    })
  })
  .catch(err => {
    res.status(500).send({message: err.message});
  });
}

exports.vaBanks = (req, res) => {
  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);
  va.getVABanks()
  .then(data => {
    res.render('xendit/virtualAccount/banks', {banks: data});
  });
}

exports.vaNew = (req, res) => {
  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);
  va.getVABanks()
  .then(data => {
    res.render('xendit/virtualAccount/create', {banks: data});
  });
}

exports.vaCreate = (req, res) => {
  let payerName = req.body.payerName;
  let payerPhone = req.body.payerPhone;
  let invoiceNumber = req.body.invoiceNumber;
  let invoiceAmount = req.body.invoiceAmount;

  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);
  va.createFixedVA({
    externalID: req.body.invoiceNumber,
    bankCode: req.body.bank,
    name: req.body.payerName,
    expectedAmt: invoiceAmount,
    isClosed: true,
  })
  .then(va => {
    Order.create({
      payerName: payerName,
      payerPhone: payerPhone,
      invoiceNumber: invoiceNumber,
      invoiceAmount: invoiceAmount,
      paymentStatus: 'outstanding',
      paymentGateway: 'xendit',
      paymentMethod: 'va',
    })
    .then(order => {
      XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'va',
        responseType: 'vaCreated',
        responseData: va,
      })
      .then(() => {
        res.redirect('/orders');
      })
    })
  })
  .catch(err => {
    res.status(500).send({message: err.message});
  });
}

exports.qrNew = (req, res) => {
  res.render('xendit/qr/create');
}

exports.qrCreate = (req, res) => {
  axios.post(process.env.XENDIT_QR_URL, {
    headers: {
      'api-version': process.env.XENDIT_API_VERSION,
    },
    data: {
      reference_id: req.body.invoiceNumber,
      type: 'STATIC',
      currency: 'IDR',
      amount: req.body.invoiceAmount,
    }
  })
  .then(qr => {
    Order.create({
      payerName: payerName,
      payerPhone: payerPhone,
      invoiceNumber: invoiceNumber,
      invoiceAmount: invoiceAmount,
      paymentStatus: 'outstanding',
      paymentGateway: 'xendit',
      paymentMethod: 'va',
    })
    .then(order => {
      XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'qr',
        responseType: 'qrCreated',
        responseData: qr,
      })
      .then(() => {
        res.redirect('/orders');
      })
    })
  })
  .catch(err => {
    res.status(500).send({message: err.message});
  })
}

exports.rtNew = (req, res) => {
  res.render('xendit/retail/create');
}

exports.rtCreate = (req, res) => {
  let payerName = req.body.payerName;
  let payerPhone = req.body.payerPhone;
  let invoiceNumber = req.body.invoiceNumber;
  let invoiceAmount = req.body.invoiceAmount;

  const retailOutletSpecificOptions = {};
  const ro = new RetailOutlet(retailOutletSpecificOptions);

  ro.createFixedPaymentCode({
    externalID: invoiceNumber,
    retailOutletName: req.body.retail,
    name: payerName,
    expectedAmt: invoiceAmount,
  })
  .then(ro => {
    Order.create({
      payerName: payerName,
      payerPhone: payerPhone,
      invoiceNumber: invoiceNumber,
      invoiceAmount: invoiceAmount,
      paymentStatus: 'outstanding',
      paymentGateway: 'xendit',
      paymentMethod: 'ro',
    })
    .then(order => {
      XenditPayment.create({
        orderId: order.id,
        paymentChannel: 'ro',
        responseType: 'roCreated',
        responseData: ro,
      })
      .then(() => {
        res.redirect('/orders');
      })
    })
  })
  .catch(err => {
    res.status(500).send({message: err.message});
  })
}