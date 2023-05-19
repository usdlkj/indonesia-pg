const {v4:uuidv4} = require('uuid');
const moment = require('moment');

exports.landing = (req, res) => {
  res.render('doku/home');
}

exports.ccNew = (req, res) => {
  let requestTimestamp = moment().toISOString();
  res.render('doku/creditCard/charge', {
    dokuEndpoint: process.env.DOKU_API_ENDPOINT,
    serverUrl: process.env.SERVER_URL,
    clientId: process.env.DOKU_CLIENT_ID,
    requestId: uuidv4(),
    requestTimestamp: requestTimestamp,
  });
}