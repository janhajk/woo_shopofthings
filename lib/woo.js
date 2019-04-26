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

var products_new = function(mysql, cb) {
  var num_pages = 3;
  let tasks = [];
  for (let i = 0; i < num_pages; i++) {
    tasks.push(function(cb) {
        WooCommerce.get('products?per_page=100&page=' + (i+1), function(err, data, res) {
            if (err) {
              utils.log(err, 'fatal');
              cb(err, res);
            }
            let ps = JSON.parse(res);
            cb(null, ps);
        });
    });
  }
  // Load all num_pages of pages
  async.parallelLimit(tasks, 1, function(e, data){
    utils.log(data);
    // merge all arrays back into one
    for (let i = 1;i<data.length;i++) {
      data[0].concat(data[i]);
    }
    data = data[0];
    utils.log('Total items: ' + data.length);
    cb(data[0]);
  });
};
exports.products_new = products_new;



var products = function(mysql, cb) {
  WooCommerce.get('products?per_page=100&page=1', function(err, data, res) {
    if (err) {
      utils.log(err, 'fatal');
      cb(null, res);
    }
    var ps = JSON.parse(res);
    WooCommerce.get('products?per_page=100&page=2', function(err, data, res) {
      // Combine pages into one array
      ps = ps.concat(JSON.parse(res));
      // Load all product variations
      let variations = [];
      for (let i in ps) {
        if (ps[i].variations.length !== 0) {
          for (let s in ps[i].variations) {
            variations.push({
              parent: ps[i].id,
              id: ps[i].variations[s].id
            });
          }
        }
      }
      // attach warehouse information to each item
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
        // return array of products
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
