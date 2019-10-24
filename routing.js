// User Config File
var config = require(__dirname + '/config.js');

var utils = require(__dirname + '/utils.js');
var auth = require(__dirname + '/auth.js');


// System
var path = require('path');
var fs = require('fs');


var basic = function(app, connection) {
    app.get('/', function(req, res) {
        fs.readFile(__dirname + '/public/index.html', 'utf-8', function(err, data) {
            res.send(data);
        });
    });

    app.get('/products_old', auth.ensureAuthenticated, function(req, res) {
        const woo = require(__dirname + '/lib/woo.js');
        woo.products(connection, function(e, data) {
            res.send(e ? e : data);
        });
    });
    
    app.get('/products', auth.ensureAuthenticated, function(req, res) {
        const woo = require(__dirname + '/lib/woo.js');
        woo.products_new(connection, function(e, data) {
            res.send(e ? e : data);
        });
    });
    
    app.get('/products_public_v2', function(req, res) {
        utils.log('loading products v2');
        const woo = require(__dirname + '/lib/woo.js');
        woo.products_public(connection, function(e, data) {
            res.send(e ? e : data);
        });
    });
    
    app.get('/products/label/:id', auth.ensureAuthenticated, function(req, res) {
        const label = require(__dirname + '/lib/label.js');
        const id = req.params.id;
        label.product(id, res, function(e, data) {
            //res.send(e ? e : data);
        });
    });
    
    app.get('/orders/:status', auth.ensureAuthenticated, function(req, res) {
        const woo = require(__dirname + '/lib/woo.js');
        const status = req.params.status;
        woo.getOrdersByStatus(status, function(e, data) {
            res.send(e ? e : data);
        });
    });
    
    
    app.get('/ping', auth.ensureAuthenticated, function(req, res) {
            res.send('ok');

    });
    
    app.get('/label/adress/:orderId', auth.ensureAuthenticated, function(req, res) {
        const label = require(__dirname + '/lib/label.js');
        const orderId = req.params.orderId;
        label.adress(orderId, res, function(e, data) {
            //res.send(e ? e : data);
        });
    });
    
    app.post('/products/add', auth.ensureAuthenticated, function(req, res){
        const woo = require(__dirname + '/lib/woo.js');
        let title = req.body.title;
        let orderID = req.body.orderid;
        woo.addProduct(title, orderID, connection, function(e, success){
            res.send('ok');
        });
    });

    app.get('/products/:id/variations/:id2/:key/:value', auth.ensureAuthenticated, function(req, res) {
        const woo = require(__dirname + '/lib/woo.js');
        const id = req.params.id;
        const id2 = req.params.id2;
        const key = req.params.key;
        const value = req.params.value;
        woo.editVariation(id, id2, key, value, connection, function(e, data) {
            res.send(data);
            //res.send(e ? e : data);
        });
    });
    
    app.get('/products/:id/:key/:value', auth.ensureAuthenticated, function(req, res) {
        const woo = require(__dirname + '/lib/woo.js');
        const id = req.params.id;
        const key = req.params.key;
        const value = req.params.value;
        woo.edit(id, key, value, connection, function(e, data) {
            res.send(data);
            //res.send(e ? e : data);
        });
    });
    
    app.get('/feeds/comparis', function(req, res) {
        const woo = require(__dirname + '/lib/woo.js');
        woo.comparis(connection, function(e, data) {
            utils.csvExport(res, data, 'comparis');
        });
    });
    
    app.get('/feeds/toppreise', function(req, res) {
        const woo = require(__dirname + '/lib/woo.js');
        woo.toppreise(connection, function(e, data) {
            utils.csvExport(res, data, 'toppreise');
        });
    });
    
    
};

exports.basic = basic;