// User Config File
var config = require(__dirname + '/../config.js');
var utils = require(__dirname + '/../utils.js');

var async = require('async');

// var WooCommerceAPI = require('woocommerce-api');

// var WooCommerce = new WooCommerceAPI({
//   url: 'https://shopofthings.ch/',
//   consumerKey: config.woo.consumerKey,
//   consumerSecret: config.woo.secret,
//   wpAPI: true,
//   version: 'wc/v3'
// });

var WooCommerce = require('woocommerce');

var wooCommerce = new WooCommerce({
  url: config.woo.url,
  ssl: true,
  consumerKey: config.woo.consumerKey,
  secret: config.woo.secret
});



var products = function(mysql, cb) {
  wooCommerce.get('/products', { per_page: 1000, page: 1, 'filter[limit]': 1000 })
    .then(function(data) {
      // Get last rates for each asset
      async.eachOfLimit(data.products, 10, function(item, key, cb) {
        loadWarehouse(item.id, mysql, function(e, rows) {
          if (e) {
            // TODO: Error handling
          }
          else {
            data.products[key].warehouse = rows;
          }
          cb();
        });
      }, function(err) {
        if (err) {
          utils.log(err, 'fatal');
        }
        cb(null, data.products);
      });
    })
    .catch(err => {
      // Log the error message
      utils.log(err.message);
      // Log the body returned from the server
      utils.log(err.body);
    });
};
exports.products = products;




var loadWarehouse = function(pid, connection, callback) {
  utils.log('Fetching additional Product info from product with id: ' + pid);
  var q = 'SELECT * FROM warehouse WHERE id = ' + parseInt(pid, 10);
  connection.query(q, function(err, row) {
    if (err) {
      utils.log(err, 'mysql');
      callback(err);
    }
    else {
      utils.log(row);
      callback(null, row[0]);
    }
  });
};


var edit = function(id, key, value, cb) {
  var data = {};
  data[key] = value;
  utils.log(data);
  wooCommerce.put('/products/' + id + '?' + key + '=' + value, function(err, data, res) {
    console.log(res);
    cb(null, res);
  });
};
exports.edit = edit;
