module.exports = app => {
  const xendit = require('../../controllers/web/xendit.controller');
  var router = require('express').Router();

  router.get('/', xendit.landing);

  router.get('/cc/charge', xendit.ccNew);
  router.post('/cc/charge', xendit.ccCharge);

  router.get('/va/banks', xendit.vaBanks);
  router.get('/va/create', xendit.vaNew);
  router.post('/va/create', xendit.vaCreate);

  router.get('/qr/create', xendit.qrNew);
  router.post('/qr/create', xendit.qrCreate);

  router.get('/rt/create', xendit.rtNew);
  router.post('/rt/create', xendit.rtCreate);

  app.use('/xendit', router);
};