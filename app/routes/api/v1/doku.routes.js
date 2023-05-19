module.exports = app => {
  const doku = require('../../../controllers/api/doku.controller');
  var router = require('express').Router();

  router.post('/getDigest', doku.getDigest);
  router.post('/getSignature', doku.getSignature);
  router.get('/payment-notification', doku.paymentNotification);

  app.use('/api/v1/doku', router);
};