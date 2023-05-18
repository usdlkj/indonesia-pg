module.exports = app => {
  const xendit = require('../../../controllers/api/xendit.controller');
  var router = require('express').Router();

  router.post('/vaPayment', xendit.vaPayment);
  router.post('/qrPayment', xendit.qrPayment);
  router.post('/roPayment', xendit.roPayment);

  app.use('/api/v1/xendit', router);
};