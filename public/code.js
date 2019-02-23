(function() {
    
    var products;
  /////////////////////////////////////////
    // Main Table
    // Table Columns / Structure
    // p  = parent        = cell
    // pp = parent-parent = position
    // hidden: true/false (default)
    // formula: function(cell, product, cb){cb()}
    // image: {folder: '', filetype: 'png'}
    // align: 'center/left/right'
    // onclick: function(pp) {return function(){}}
    // round: 2
    // sort: 'desc'
    var cols = {
        'id': {
            hidden: true,
            formula: function(cell, product, cb) {
                cell.value = product.id;
                cb();
            }
        },
        'Title': {
            col: 'title'
        },
        'SKU': {
            formula: function(cell, product, cb) {
                cell.value = product.sku;
                cb();
            }
        }/*,
        'Price': {
            formula: function(cell, product, cb) {
                cell.value = product.price;
                cb();
            }
        },
        'Price': {
            col: 'amount',
            class: 'hidden-xs',
            align: 'right'
        },
        'Cost': {
            formula: function(cell, product, cb) {
                cell.value = product.stats.open.rate;
                cb();
            },
            class: 'hidden-xs hidden-sm',
            align: 'right'
        },
        'Shipping Class': {
            formula: function(p, pp, cb) {
                p.value = pp.last;
                cb();
            },
            align: 'right',
            onclick: function(pp) {
                return function() {
                    pp.detailsToggle();
                };
            }
        },
        'Stock qty': {
            formula: function(cell, product, cb) {
                cell.value = product.stats.totals.btc;
                cb();
            },
            round: 2,
            sort: 'desc'
        },
        'Categories': {
            formula: function(cell, product, cb) {
                cell.value = product.stats.totals.usd;
                cb();
            },
            round: 0
        }*/
    };
      
      
      document.addEventListener('DOMContentLoaded', function() {
            
        var frmLogin = new Login();
        var content = document.getElementById('content');

        // Init positions collection
        products = new Products(content);
        /**
         * 
         * Load initial Data
         * 
         * This function only gets called once
         * 
         * 
         */
        var request = new XMLHttpRequest();
        request.open('GET', '/products', true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                try {
                    var data = JSON.parse(request.responseText);
                    console.log(data);
                    frmLogin.hide();
                    
                    for (let i in data.products) {
                        let product = new Product(data.products[i]);
                        product.load();

                        // Add product to collection
                        products.add(product);
                    }
                    products.tableRender();
                }
                catch (e) {
                    console.log(e);
                    console.log(new Date().toLocaleString() + ': not logged in');
                    frmLogin.show();
                    document.getElementById('content').innerHTML = 'Not logged in.';
                }
            }
            else {
                // Error
            }
        };
        request.onerror = function() {
            console.log('There was an error in xmlHttpRequest!');
        };
        request.send();
      });
      
      
      
    /**
     * 
     * Login Form in Navbar
     * 
     * 
     * 
     */
    var Login = function() {
        var div = document.createElement('div');
        var form = document.createElement('form');
        form.action = "/login";
        form.method = "POST";
        var username = document.createElement('input');
        username.type = "text";
        username.name = "username";
        var password = document.createElement('input');
        password.type = "password";
        password.name = "password";
        var submit = document.createElement('input');
        submit.type = "submit";
        submit.value = "Login";
        form.appendChild(username);
        form.appendChild(password);
        form.appendChild(submit);
        div.appendChild(form);
        document.getElementById('dashline').appendChild(div);
        this.div = div;
        
        this.show = function() {
            this.div.style.display = 'block';
        };
        this.hide = function() {
            this.div.style.display = 'none';
        };
    };
    
    
    /**
     * 
     * Positions - Collection of Position
     * 
     * 
     */
    var Products = function(parent) {

        // var that holds all items
        var items = [];

        this.parent = parent;

        // Adds a Position to the collecton
        this.add = function(product) {
            items.push(product);
        };

        // Renders a Position table
        this.tableRender = function() {
            var table = this.table();
            this.parent.appendChild(table[0]);
            for (let i = 0; i < items.length; i++) {
                items[i].domRow(table[1].tBodies[0]);
                items[i].update();
            }
            //$.bootstrapSortable({ applyLast: true });
        };
        /**
         * Products-Table
         * Creates empty products table
         * Data-rows are added asynchronously
         */
        this.table = function() {
            var t = document.createElement('table');
            t.className = ['table', 'table-bordered', 'table-hover', 'table-responsive', 'table-condensed', 'sortable'].join(' ');
            t.style.width = '100%';
            t.style.maxWidth = '1000px';

            // table header
            var thead = document.createElement('thead');
            thead.class = 'thead-inverse';
            var tr = document.createElement('tr');
            for (let c in cols) {
                if (cols[c].hidden) continue;
                let th = document.createElement('th');
                th.innerHTML = c;
                th.className = cols[c].class ? cols[c].class : '';
                th.style.textAlign = cols[c].align ? cols[c].align : 'left';
                if (cols[c].sort) {
                    th.dataDefaultsort = cols[c].sort;
                }
                tr.appendChild(th);
            }
            thead.appendChild(tr);
            t.appendChild(thead);

            // table Body
            var tbody = document.createElement('tbody');
            t.appendChild(tbody);

            // Table Wrapper
            var div = document.createElement('div');
            div.className = 'table-responsive';
            div.appendChild(t);
            return [div, t];
        };
    };


    // -------------------------
    // END OF PositionCollection
    // -------------------------
    
    
    
    
    
    
    /**
     * Product Object
     *
     * @param {Object} data Product-data from Database JSON
     *
     */
    var Product = function(data) {
        var self = this;
        
        // Store all data in object
        for (let i in data) {
            this[i] = data[i];
        }

        // DOM Element of Row
        this.tr = {};
        // DOM Element of Detail-Row
        this.trDetail = {};
        // Visibility state of Detail-Row
        this.showDetails = -1;
        // create cell for each col and update
        this.row = {};

        /**
         * Create the cells for the position row
         * and update the totals
         * 
         */
        this.load = function() {
            for (let i in cols) {
                let c = new Cell(i, cols[i], this); // function Cell(title, defaults, position)
                this.row[i] = c;
            }
            //updateTotal();
        };
        /**
         * Renders DOM of a row
         * appends to parent
         * saves in this.tr
         * returns the DOM-<tr>
         */
        this.domRow = function(parent) {
            let cells = [];
            for (let cell in this.row) {
                if (!this.row[cell].hidden) {
                    cells.push(this.row[cell].dom);
                }
            }
            let tr = document.createElement('tr');
            for (let i in cells) {
                tr.appendChild(cells[i]);
            }
            this.tr = tr;
            parent.appendChild(tr);
        };

        /**
         * Update item and all cells in item
         */
        this.update = function() {
        };

        /**
         * 
         * Loads Details of asset
         * 
         * 
         * 
         */
        this.detailsToggle = function() {
        };
    };
    // -------------------------
    // END OF Product
    // -------------------------



    /**
     * Cell Object
     *
     * @param {String} title
     * @param {Array} defaults
     * @param {Object} parent parent-product of which cell is part of
     *
     */
    var Cell = function(title, defaults, parent) {
        var self = this;
        this.title = title;
        this.col = 0;
        this.value = null;
        this.align = 'left';
        this.formula = null;
        this.pos = 0;
        this.hidden = false;
        this.rw = false;
        this.html = '';
        this.class = '';
        this.round = -1;
        this.image = 0;
        this.onclick = null;
        
        // Set defaults, overwrites initial settings above
        for (let i in defaults) {
            this[i] = defaults[i];
        }
        
        this.dom = document.createElement('td');
        
        
        /**
         * Renders Cell the first time
         * only called once
         */
        this.render = function() {
            var td = this.dom;
            // Image-Cells
            if (this.value !== null && this.image) {
                td.innerHTML = '';
                let value = this.value.replace(/\s/g, '-').toLowerCase();
                let path = 'images/' + this.image.folder + '/';
                let src = path + value + '.' + this.image.filetype;
                td.style.backgroundImage = 'url(' + src + ')';
                td.style.backgroundRepeat = 'no-repeat';
                td.style.backgroundSize = 'Auto 25px';
                td.title = this.value;
                td.style.backgroundPosition = this.align;
                //img.title = self.tValue(this);
            }
            // Text-Cells
            else {
                td.innerHTML = this.tValue();
            }
            td.style.textAlign = this.align;
            td.style.cursor = 'pointer';
            td.className = this.class;
            td.onmousedown = function() { return false; };
            // For Testing purpose
            td.ondblclick = function() {
                console.log(this.value);
            };
            if (typeof(this.onclick) === 'function') {
                td.onclick = this.onclick(parent);
            }
        };

        /**
         * Calculates cell using formula
         */
        this.calc = function(cb) {
            if (this.col) {
                this.value = parent[this.col];
                cb();
            }
            if (this.formula !== null) {
                if (typeof this.formula === 'function') {
                    this.formula(this, parent, cb);
                }
                else if (this.formula.type === '*') {
                    this.value = parent.row[this.formula.x].value * parent.row[this.formula.y].value;
                    cb();
                }
            }
        };
        /**
         * Formats a Cell Value to readable format
         */
        this.tValue = function() {
            var html = this.value;
            if (typeof html === 'number') {
                this.dom.style.textAlign = 'right';
            }
            if (this.round === -1) {
                if (typeof html === 'number') {
                    let digits = smartRound(html);
                    //html = cutTrailingZeros(html.toLocaleString('de-CH-1996', {minimumFractionDigits:digits}));
                    html = html.toLocaleString('de-CH-1996', { minimumFractionDigits: digits });
                }
            }
            else if (typeof html === 'number' && this.round > -1) {
                var num = html;
                html = html.toFixed(this.round);
                html = Number(html).toLocaleString('de-CH-1996', { minimumFractionDigits: this.round });
                if (this.prefix === 'sign' && num > 0) html = '+' + html;
            }
            return html;
        };

        /**
         * Updates Cell (only if value has changed)
         */
        this.update = function() {
            var val1 = this.value;
            var self = this;
            this.calc(function() {
                self.dom.dataValue = self.value;
                // update html if value has changed
                if (val1 === null || self.value !== val1) {
                    self.dom.innerHTML = self.tValue();
                    if (typeof self.value === 'number' && Math.abs(self.value / val1 - 1) > 0.003) {
                        self.dom.style.transition = 'color 1s';
                        if (self.value > val1) {
                            self.dom.style.backgroundColor = '#ccffcc';
                        }
                        else if (self.value < val1) {
                            self.dom.style.backgroundColor = '#ff9999';
                        }
                        var dom = self.dom;
                        setTimeout(function() {
                            dom.style.transition = 'backgroundColor 4s';
                            dom.style.backgroundColor = 'transparent';
                        }, 2500);
                    }
                }
            });
        };
        this.calc(function() {
            self.render();
        });
    };



    // -------------------------
    // END OF Cell
    // -------------------------
    
    
    //
    // Helper Functions
    //
    //
    //
    //
    //


    /**
     * Rounds number in dependence of depth
     * @param {Number} number Value to smart-round
     * @return {Number} smart-rounded number; 0 for default/error
     */
    var smartRound = function(number) {
        number = Math.abs(number);
        if (number == 0) return 0;
        if (number < 0.0001) return 8;
        if (number < 0.001) return 7;
        if (number < 0.01) return 6;
        if (number < 0.1) return 5;
        if (number < 1) return 4;
        if (number < 10) return 3;
        if (number < 100) return 2;
        if (number < 1000) return 1;
        return 0;
    };
    
})();