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
  async.parallelLimit(tasks, 5, function(e, data) {
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



const products_serialized = function(mysql, cb) {
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
  async.parallelLimit(tasks, 5, function(e, data) {
    // merge all arrays back into one
    var products = [];
    for (let i = 0; i < data.length; i++) {
      for (let s in data[i]) {
        products.push(data[i][s]);
      }
    }
    utils.log('Total items: ' + products.length);
    loadVariations(products, function(productsWithVariations) {
      let products = [];
      for (let i in productsWithVariations) {
        // Products with variations...
        if (productsWithVariations[i].variations.length) {
          for (let r in productsWithVariations[i].variations) {
            let cp = utils.cloneObj(productsWithVariations[i]);
            let variation = productsWithVariations[i].variations[r];
            cp.name += ' (' + variation.attributes[0].option + ')';
            cp.sku = variation.sku;
            cp.price = variation.price;
            cp.shipping_class = variation.shipping_class;
            cp.stock_quantity = variation.stock_quantity;
            cp.permalink = variation.permalink;
            cp.stock_quantity = variation.stock_quantity;
            cp.variations = [];
            products.push(cp);
          }
        }
        // Products without Variations just add
        else {
          products.push(productsWithVariations[i]);
        }
      }
      cb(products);
    });
  });
};




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


var products_public = function(mysql, next) {
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


const shippingCost = function(product) {
  if (product.price >= 25) return 0;
  switch (product.shipping_class) {
    case 'small':
      return 2;
    case 'large':
      return 4;
  }
  return 2;
};

const deliveryTime = function(product) {
  switch (product.id) {
    // Anet 3D Drucker
    case 2573:
      return 'Innerhalb 7 Tage';
  }
  if (product.stock_status === 'onbackorder') {
    return 'Innerhalb von 14 Tagen';
  }
  if (product.stock_quantity < 0) {
    return 'Innerhalb von 14 Tagen';
  }
  return 'Innerhalb 24 h';
};

const getBrand = function(product) {
  for (let i in product.attributes) {
    if (product.attributes[i].name === 'Marke') {
      return product.attributes[i].options[0];
    }
  }
  return '';
};

// Manufacurer Product Number
const getMpn = function(product) {
  for (let i in product.attributes) {
    if (product.attributes[i].name === 'Herstellernummer') {
      return product.attributes[i].options[0];
    }
  }
  return '';
};

// EAN Number
const getEan = function(product) {
  for (let i in product.attributes) {
    if (product.attributes[i].name === 'EAN') {
      return product.attributes[i].options[0];
    }
  }
  return '';
};


const json2csv = function(data) {
  const items = data;
  const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
  const header = Object.keys(items[0]);
  let csv = items.map(row => header.map(function(fieldName) {
    // if (typeof row[fieldName] === 'string') {
    //   row[fieldName] = '"' + row[fieldName] + '"';
    // }
    return JSON.stringify(row[fieldName], replacer);
  }).join(';'));
  csv.unshift(header.join(';'));
  csv = csv.join("\n");
  return csv;
};


const comparis = function(mysql, cb) {
  products_serialized(mysql, function(products) {
    let comparis_products = [];
    for (let i = 0; i < products.length; i++) {
      if (products[i].status !== 'publish') continue;
      comparis_products.push({
        description: products[i].short_description.replace(/<\/?[^>]+(>|$)/g, ""),
        imageURL: products[i].images.length && products[i].images[0].src,
        name: products[i].name,
        ean: getEan(products[i]),
        price: products[i].price,
        'product id': products[i].sku,
        productURL: products[i].permalink,
        shippingCost: shippingCost(products[i]),
        deliveryTime: deliveryTime(products[i]),
        brand: getBrand(products[i]),
        mpn: getMpn(products[i]),
      });
    }
    cb(null, json2csv(comparis_products));
  });
};
exports.comparis = comparis;


const toppreise = function(mysql, cb) {
  products_serialized(mysql, function(products) {
    let toppreise_products = [];
    for (let i = 0; i < products.length; i++) {
      if (products[i].status !== 'publish') continue;
      toppreise_products.push({
        description: products[i].short_description.replace(/<\/?[^>]+(>|$)/g, ""),
        imageURL: products[i].images.length && products[i].images[0].src,
        name: products[i].name,
        ean: getEan(products[i]),
        price: products[i].price,
        'product id': products[i].sku,
        productURL: products[i].permalink,
        shippingCost: shippingCost(products[i]),
        deliveryTime: deliveryTime(products[i]),
        brand: getBrand(products[i]),
        mpn: getMpn(products[i]),
      });
    }
    cb(null, json2csv(toppreise_products));
  });
};
exports.toppreise = toppreise;
