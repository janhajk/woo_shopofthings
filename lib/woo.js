// User Config File
var config = require(__dirname + '/../config.js');
var utils = require(__dirname + '/../utils.js');

var async = require('async');

var WooCommerceAPI = require('woocommerce-api');

var WooCommerce = new WooCommerceAPI({
  url: 'https://shopofthings.ch/',
  consumerKey: config.woo.consumerKey,
  consumerSecret: config.woo.secret,
  wpAPI: true,
  version: 'wc/v3'
});



var products = function(mysql, cb) {
  WooCommerce.get('products?per_page=500', function(err, data, res) {
    if (err) {
      utils.log(err, 'fatal');
      cb(null, data);
    }
    async.eachOfLimit(res, 10, function(item, key, cb) {
      loadWarehouse(item.id, mysql, function(e, rows) {
        if (e) {
          // TODO: Error handling
        }
        else {
          res[key].warehouse = rows;
        }
        cb();
      });
    }, function(err) {
      if (err) {
        utils.log(err, 'fatal');
      }
      cb(null, res);
    });
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


var edit = function(id, key, value, res, cb) {
  var data = {};
  data[key] = value;

  WooCommerce.put('products/' + id, data, function(err, data, res) {
    console.log(res);
    cb(null, res);
  });

};
exports.edit = edit;
