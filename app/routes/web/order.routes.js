module.exports = app => {
  const order = require('../../controllers/web/order.controller');
  var router = require('express').Router();

  router.get('/', order.list);

  app.use('/orders', router);
};