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


const num_pages = 4;



var products_new = function(mysql, cb) {
  // Total number of pages to load
  let tasks = [];
  for (let i = 0; i < num_pages; i++) {
    tasks.push(function(cb) {
      WooCommerce.get('products?per_page=100&page=' + (i + 1), function(err, data, res) {
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
  async.parallelLimit(tasks, 1, function(e, data) {
    // merge all arrays back into one
    var products = [];
    for (let i = 0; i < data.length; i++) {
      for (let s in data[i]) {
        products.push(data[i][s]);
      }
    }
    utils.log('Total items: ' + products.length);
    loadVariations(products, function(productsWithVariations) {
      loadWarehouseAll(mysql, function(e, additionalAll) {
        for (let i in productsWithVariations) {
          let additional = additionalAll[productsWithVariations[i].id];
          for (let s in additional) {
            if (s !== 'id') {
              productsWithVariations[i]['warehouse_' + s] = additional[s];
            }
          }
          // Add aditional information for variation
          if (productsWithVariations[i].variations.length) {
            for (let r in productsWithVariations[i].variations) {
              let additional = additionalAll[productsWithVariations[i].variations[r].id];
              for (let s in additional) {
                if (s !== 'id') {
                  productsWithVariations[i].variations[r]['warehouse_' + s] = additional[s];
                }
              }
            }
          }
        }
        cb(productsWithVariations);
      });
    });
  });
};
exports.products_new = products_new;


var loadVariations = function(products, cb) {
  // Load all product variations
  let variations = [];
  for (let i in products) {
    if (products[i].variations.length !== 0) {
      variations.push(products[i].id);
    }
  }
  utils.log('Variations:');
  utils.log(variations);
  utils.log('Total Variations: ' + variations.length);
  // Load all variations async
  async.eachLimit(variations, 5, function(parentId, cb) {
    WooCommerce.get('products/' + parentId + '/variations', function(err, data, res) {
      if (err) {
        utils.log(err, 'fatal');
        cb(null);
      }
      for (let i in products) {
        if (products[i].id === parentId) {
          products[i].variations = JSON.parse(res);
          break;
        }
      }
      cb();
    });
  }, function(error) {
    cb(products);
  });
};


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


var products_public_new = function(mysql, next) {
  products_new(mysql, function(productsWithVariations) {
    let newPs = [];
        for (let i in productsWithVariations) {
          if (productsWithVariations[i].status !== 'publish') continue;
          let product = {
            image: false,
            title: productsWithVariations[i].name,
            sku: productsWithVariations[i].sku,
            price: productsWithVariations[i].price,
            permalink: productsWithVariations[i].permalink,
            shipping: productsWithVariations[i].shipping_class,
            categories: productsWithVariations[i].categories
          };
          for (let r in productsWithVariations[i].images) {
            product.image = productsWithVariations[i].images[r];
            break;
          }
          utils.log('Adding Product ' + product.title);
          newPs.push(product);
        }
        next(null, newPs);
  });
};
exports.products_public_new  = products_public_new;


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


var addOrderId = function(id, type, oid, connection, next) {
  utils.log('adding orderId ' + oid + ' to id ' + id + ' of type ' + type);
  let q = 'SELECT orderids FROM warehouse WHERE id = ' + id;
  connection.query(q, function(err, row) {
    if (err) {
      utils.log(err, 'mysql');
      next(err);
    }
    else {
      utils.log(row[0]);
      let data = JSON.parse(row[0].orderids);
      utils.log('adding new element via data.push()');
      data.push({
        type: type,
        id: oid
      });
      utils.log('executing mysql query...');
      let q = 'UPDATE warehouse SET orderids = \'' + JSON.stringify(data) + '\' WHERE id = ' + id;
      utils.log(q);
      connection.query(q, function(err) {
        if (err) {
          next(err, 'mysql');
        }
        else {
          next(null, true);
        }
      });
    }
  });
};
exports.addOrderId = addOrderId;



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

var loadWarehouseAll = function(connection, callback) {
  utils.log('Fetching additional Product info from all products');
  var q = 'SELECT * FROM warehouse';
  connection.query(q, function(err, row) {
    if (err) {
      utils.log(err, 'mysql');
      callback(err);
    }
    else {
      utils.log(row);
      let all = {};
      for (let i in row) {
        all[row[i].id] = row[i];
        utils.log('row:');
        utils.log(row[i]);
        all[row[i].id].orderids = all[row[i].id].orderids === '' ? [] : JSON.parse(all[row[i].id].orderids);
      }
      callback(null, all);
    }
  });
};


var edit = function(id, key, value, connection, cb) {
  value = Buffer.from(value, 'base64').toString('ascii');
  var data = {};
  var special = key.split('_');
  utils.log(special);
  // Warehouse Properties
  if (special[0] === 'warehouse') {
    var q = 'INSERT INTO warehouse (id, ' + key.split('_').splice(1).join('_') + ', orderids) VALUES(' + id + ', "' + value + '", "[]") ON DUPLICATE KEY UPDATE ' + key.split('_').splice(1).join('_') + '="' + value + '"';
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


var editVariation = function(id, id2, key, value, connection, cb) {
  value = Buffer.from(value, 'base64').toString('ascii');
  var data = {};
  var special = key.split('_');
  utils.log(special);
  // Warehouse Properties
  if (special[0] === 'warehouse') {
    var q = 'INSERT INTO warehouse (id, ' + key.split('_').splice(1).join('_') + ', orderids) VALUES(' + id2 + ', "' + value + '", "[]") ON DUPLICATE KEY UPDATE ' + key.split('_').splice(1).join('_') + '="' + value + '"';
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
    WooCommerce.put('products/' + id + '/variations/' + id2, data, function(err, data, res) {
      console.log(res);
      cb(null, res);
    });
  }
};
exports.editVariation = editVariation;



/**
 * 
 * Returning Shipping Adress for Order
 * 
 *  "shipping": {
      "first_name": "John",
      "last_name": "Doe",
      "company": "",
      "address_1": "969 Market",
      "address_2": "",
      "city": "San Francisco",
      "state": "CA",
      "postcode": "94103",
      "country": "US"
    }
 **/
var getAdressFromOrderId = function(id, cb) {
  WooCommerce.get('orders/' + id, function(err, data, res) {
    if (err) {
      utils.log(err);
      cb(err);
      return;
    }
    let order = JSON.parse(res);
    utils.log(order.shipping);
    cb(null, order.shipping);
  });
};
exports.getAdressFromOrderId = getAdressFromOrderId;



var getOrdersByStatus = function(status, cb) {
  WooCommerce.get('orders?status=' + status, function(err, data, res) {
    if (err) {
      utils.log(err);
      cb(err);
      return;
    }
    utils.log(res);
    cb(null, res);
  });
};
exports.getOrdersByStatus = getOrdersByStatus;



/**
 * Adds new Product with little information
 * in draft-mode
 * 
 **/
var addProduct = function(title, orderId, connection, cb) {
  utils.log('-');
  utils.log('adding new product item');
  utils.log('Title: ' + title);
  utils.log('Order ID: ' + orderId);
  var data = {
    name: title,
    type: 'simple',
    manage_stock: true,
    status: 'draft'
  };
  WooCommerce.post('products', data, function(err, data, res) {
    if (err) {
      utils.log(err);
      cb(err);
      return;
    }
    utils.log(res);
    let id = (JSON.parse(res)).id;
    let q = 'INSERT INTO warehouse (id, orderids) VALUES (' + id + ', "[]")';
    utils.log(q, 'mysql');
    connection.query(q, function(err, row) {
      if (err) {
        utils.log(err, 'mysql');
        cb(err);
      }
      else {
        addOrderId(id, 'ali', orderId, connection, function(err) {
          if (err) {
            utils.log(err, 'mysql');
            cb(err);
          }
          else {
            cb(null, true);
          }
        });
      }
    });
  });
};
exports.addProduct = addProduct;


var productFromId = function(id, cb) {
  WooCommerce.get('products/' + id, function(err, data, res) {
    cb(res);
  });
};
exports.productFromId = productFromId;
