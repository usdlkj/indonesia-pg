module.exports = app => {
  const home = require('../../controllers/web/home.controller');
  var router = require('express').Router();

  router.get('/', home.landing);

  app.use('/', router);
};