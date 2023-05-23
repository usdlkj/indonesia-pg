module.exports = app => {
  const xendit = require('../../controllers/web/xendit.controller');
  var router = require('express').Router();

  router.get('/', xendit.landing);
  router.get('/:id', xendit.responses);

  router.get('/cc/charge', xendit.ccNew);
  router.post('/cc/charge', xendit.ccCharge);

  router.get('/va/banks', xendit.vaBanks);
  router.get('/va/create', xendit.vaNew);
  router.post('/va/create', xendit.vaCreate);
  router.post('/va/:id/pay', xendit.vaPay);

  router.get('/qr/create', xendit.qrNew);
  router.post('/qr/create', xendit.qrCreate);

  router.get('/ro/create', xendit.roNew);
  router.post('/ro/create', xendit.roCreate);
  router.post('/ro/:id/pay', xendit.roPay);

  app.use('/xendit', router);
};