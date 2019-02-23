// User Config File
var config = require(__dirname + '/../config.js');
var utils = require(__dirname + '/../utils.js');

var archiver = require('archiver');




var send = function(sku, link, res, cb) {
       res.writeHead(200, {
             'Content-Type': 'application/zip',
             'Content-disposition': 'attachment; filename=label.zip'
       });
      var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
      });
      archive.pipe(res);
      archive.append(sku, { name: 'sku.txt' });
      archive.append(link, { name: 'link.txt' });
      archive.finalize();
      cb();
};
exports.send = send;
