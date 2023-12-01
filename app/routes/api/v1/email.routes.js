module.exports = app => {
  const controller = require('../../../controllers/api/email.controller');
  var router = require('express').Router();

  router.post('/test', controller.testEmail);

  app.use('/api/v1/email', router);
};