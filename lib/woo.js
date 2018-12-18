// User Config File
var config = require(__dirname + '/../config.js');
var utils = require(__dirname + '/../utils.js');

var WooCommerce = require('woocommerce');





var wooCommerce = new WooCommerce({
  url: config.woo.url,
  ssl: true,
  consumerKey: config.woo.consumerKey,
  secret: config.woo.secret
});
exports.api = wooCommerce;


var products = function(mysql, cb) {
  wooCommerce.get('/products')
    .then(data => {
      cb(null, data);
    })
    .catch(err => {
      // Log the error message
      utils.log(err.message);
      // Log the body returned from the server
      utils.log(err.body);
    });
};
exports.products = products;
