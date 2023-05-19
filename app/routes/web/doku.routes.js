module.exports = app => {
  const doku = require('../../controllers/web/doku.controller');
  var router = require('express').Router();

  router.get('/', doku.landing);

  router.get('/cc/charge', doku.ccNew);

  // router.get('/va/banks', xendit.vaBanks);
  // router.get('/va/create', xendit.vaNew);
  // router.post('/va/create', xendit.vaCreate);

  // router.get('/qr/create', xendit.qrNew);
  // router.post('/qr/create', xendit.qrCreate);

  // router.get('/rt/create', xendit.rtNew);
  // router.post('/rt/create', xendit.rtCreate);

  app.use('/doku', router);
};