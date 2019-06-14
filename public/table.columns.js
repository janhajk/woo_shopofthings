(function() {
      
      let frmEditO = {frmEdit: window.frmEdit};
      let frmEdit = frmEditO.frmEdit;

      /////////////////////////////////////////
      // Main Table
      // Table Columns / Structure
      // p  = parent        = cell
      // pp = parent-parent = item
      // hidden: true/false (default)
      // formula: function(cell, product, cb){cb()}
      // class: 'hidden-xs hidden-sm etc' bootstrap class
      // image: {folder: '', filetype: 'png'}
      // align: 'center/left/right'
      // onclick: function(pp) {return function(){}}
      // round: 2
      // sort: 'desc'
      window.productTableCols = {
            'image': {
                  formula: function(cell, item, cb) {
                        let src = (item.images != undefined && item.images.length) ? item.images[0].src : item.image != undefined ? item.image.src : 'https://shopofthings.ch/wp-content/plugins/woocommerce/assets/images/placeholder.png';
                        cell.value = '<img src="' + src + '" height="50" />'
                        cb();
                  }
            },
            'Title': {
                  formula: function(cell, item, cb) {
                        cell.value = (!item.parent) ? item.name : '&nbsp;&nbsp;&nbsp;&nbsp;<span style="font-style:italic">' + item.attributes[0].option + ' (<span style=font-size:0.5em;>' + item.parent.name + '</span>)</span>';
                        cb();
                  },
                  ondblclick: function(item) {
                        return function() {
                              frmEdit.key = 'name';
                              frmEdit.valueDom.value = item.name;
                              frmEdit.item = item;
                              frmEdit.show();
                        };
                  }
            },
            'SKU': {
                  col: 'sku',
                  ondblclick: function(item) {
                        return function() {
                              frmEdit.key = 'sku';
                              frmEdit.valueDom.value = item.sku;
                              frmEdit.item = item;
                              frmEdit.show();
                        };
                  }
            },
            'Cost': {
                  formula: function(cell, item, cb) {
                        let p = '?';
                        for (let i in item.meta_data) {
                              if (item.meta_data[i].key === '_purchase_price') {
                                    p = item.meta_data[i].value;
                                    break;
                              }
                        }
                        cell.value = p;
                        cb();
                  },
                  round: 2
            },
            'Cost_new': {
                  col: 'warehouse_cost',
                  round: 2,
                  ondblclick: function(item) {
                        return function() {
                              frmEdit.key = 'warehouse_cost';
                              frmEdit.valueDom.value = item.warehouse_cost;
                              frmEdit.item = item;
                              frmEdit.show();
                        };
                  }
            },
            'Price': {
                  col: 'price',
                  ondblclick: function(item) {
                        return function() {
                              frmEdit.key = 'price';
                              frmEdit.valueDom.value = item.price;
                              frmEdit.item = item;
                              frmEdit.show();
                        };
                  },
                  round: 2
            },
            'Shipping Class': {
                  col: 'shipping_class'
            },
            'Qty': {
                  col: 'stock_quantity',
                  round: 0,
                  ondblclick: function(item) {
                        return function() {
                              frmEdit.key = 'stock_quantity';
                              frmEdit.valueDom.value = item.stock_quantity;
                              frmEdit.item = item;
                              frmEdit.show();
                        };
                  }
            },
            'Qty 1': {
                  col: 'warehouse_min_warning',
                  round: 0,
                  ondblclick: function(item) {
                        return function() {
                              frmEdit.key = 'warehouse_min_warning';
                              frmEdit.valueDom.value = item.warehouse_min_warning;
                              frmEdit.item = item;
                              frmEdit.show();
                        };
                  }
            },
            'Qty 2': {
                  col: 'warehouse_min_alert',
                  round: 0,
                  ondblclick: function(item) {
                        return function() {
                              frmEdit.key = 'warehouse_min_alert';
                              frmEdit.valueDom.value = item.warehouse_min_alert;
                              frmEdit.item = item;
                              frmEdit.show();
                        };
                  }
            },
            'ordered': {
                  col: 'warehouse_ordered',
                  round: 0,
                  ondblclick: function(item) {
                        return function() {
                              frmEdit.key = 'warehouse_ordered';
                              frmEdit.valueDom.value = item.warehouse_ordered;
                              frmEdit.item = item;
                              frmEdit.show();
                        };
                  }
            },
            'sold': {
                  col: 'total_sales',
                  round: 0,
            },
            'Categories': {
                  formula: function(cell, item, cb) {
                        let cats = [];
                        for (let i in item.categories) {
                              cats.push(item.categories[i].name);
                        }
                        cell.value = cats.join(', ');
                        cb();
                  }
            },
            'Actions': {
                  formula: function(cell, item, cb) {
                        let links = [];
                        links.push({ link: 'products/label/' + item.id, title: 'label' });
                        links.push({ link: item.permalink, title: 'view' });
                        links.push({ link: 'https://shopofthings.ch/wp-admin/post.php?post=' + item.id + '&action=edit', title: 'edit' });
                        let a = [];
                        for (let i in links) {
                              a.push('<a href="' + links[i].link + '" target="_blank">' + links[i].title + '</a>');
                        }
                        cell.value = a.join('&nbsp;&#124;&nbsp;'); // |-Seperator
                        cb();
                  }
            }
      };


}());
