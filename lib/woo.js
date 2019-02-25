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
  WooCommerce.get('products?per_page=100', function(err, data, res) {
    if (err) {
      utils.log(err, 'fatal');
      cb(null, res);
    }
    var ps = JSON.parse(res);
    async.eachOfLimit(ps, 1, function(item, key, cb) {
      utils.log('Item');
      utils.log(item);
      utils.log('Key: ' + key);
      loadWarehouse(item.id, mysql, function(e, rows) {
        if (e) {
          // TODO: Error handling
        }
        else {
          ps[key].warehouse = rows;
        }
        cb();
      });
    }, function(err) {
      if (err) {
        utils.log(err, 'fatal');
      }
      cb(null, ps);
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
