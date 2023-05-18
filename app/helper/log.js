const writelog = require("writelog");

const debug = async function (payload) {
  writelog("debug", payload);
};

module.exports = {
  debug,
};

/*
how to use

const log = require(../../helper/log.js);

var test="aasd"
log.debug(test) / log.debug("masuk sini")

nanti akan terbuat folder .log dan file debug.log di dalam nya
*/
