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
  WooCommerce.get('products?per_page=100&page=1', function(err, data, res) {
    if (err) {
      utils.log(err, 'fatal');
      cb(null, res);
    }
    var ps = JSON.parse(res);
    WooCommerce.get('products?per_page=100&page=2', function(err, data, res) {
      ps = ps.concat(JSON.parse(res));
      async.eachOfLimit(ps, 1, function(item, key, cb) {
        utils.log('Item');
        utils.log(item);
        utils.log('Key: ' + key);
        loadWarehouse(item.id, mysql, function(e, rows) {
          if (e) {
            // TODO: Error handling
          }
          else {
            for (let i in rows) {
              if (i !== 'id') {
                ps[key]['warehouse_' + i] = rows[i];
              }
            }
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
  });
};
exports.products = products;


var products_public = function(mysql, cb) {
  utils.log('loading products for public...');
  WooCommerce.get('products?per_page=100&page=1', function(err, data, res) {
    if (err) {
      utils.log(err, 'fatal');
      cb(null, res);
    }
    var ps = JSON.parse(res);
    WooCommerce.get('products?per_page=100&page=2', function(err, data, res) {
      ps = ps.concat(JSON.parse(res));
      async.eachOfLimit(ps, 10, function(item, key, cb) {
        utils.log('Item');
        utils.log(item);
        utils.log('Key: ' + key);
        cb();
      }, function(err) {
        if (err) {
          utils.log(err, 'fatal');
        }
        let newPs = [];
        for (let i in ps) {
          if (ps[i].status !== 'publish') continue;
          let product = {
            image: false,
            title: ps[i].name,
            sku: ps[i].sku,
            price: ps[i].price,
            permalink: ps[i].permalink,
            shipping: ps[i].shipping_class,
            categories: ps[i].categories
          };
          for (let r in ps[i].images) {
            product.image = ps[i].images[r];
            break;
          }
          utils.log('Adding Product ' + product.title);
          newPs.push(product);
        }
        cb(null, newPs);
      });
    });
  });
};
exports.products_public = products_public;



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


var edit = function(id, key, value, connection, cb) {
  value = Buffer.from(value, 'base64').toString('ascii');
  var data = {};
  var special = key.split('_', 2);
  utils.log(special);
  // Warehouse Properties
  if (special[0] === 'warehouse') {
    var q = 'INSERT INTO warehouse (id, ' + special[1] + ') VALUES(' + id + ', "' + value + '") ON DUPLICATE KEY UPDATE ' + special[1] + '="' + value + '"';
    utils.log(q, 'mysql');
    connection.query(q, function(err, row) {
      if (err) {
        utils.log(err, 'mysql');
        cb(err);
      }
      else {
        utils.log(row);
        cb(null, row);
      }
    });
  }

  // Woocommerce properties
  else {
    data[key] = value;
    utils.log(data);
    WooCommerce.put('products/' + id, data, function(err, data, res) {
      console.log(res);
      cb(null, res);
    });
  }
};
exports.edit = edit;
