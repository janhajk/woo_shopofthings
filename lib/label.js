// User Config File
var config = require(__dirname + '/../config.js');
var utils = require(__dirname + '/../utils.js');


var wooCommerce = new WooCommerce({
  url: config.woo.url,
  ssl: true,
  consumerKey: config.woo.consumerKey,
  secret: config.woo.secret
});
exports.api = wooCommerce;


var export = function(sku, link, cb) {

};
exports.export = export;
