/*global $ */
(function() {

    var products;
    var frmLogin;
    var frmEdit;
    var infoBlock;
    var bAlert;
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
    var cols = {
        'image': {
            formula: function(cell, item, cb) {
                let src = (item.images != undefined && item.images.length) ? item.images[0].src : item.image != undefined ? item.image.src : 'https://shopofthings.ch/wp-content/plugins/woocommerce/assets/images/placeholder.png';
                cell.value = '<img src="' + src + '" height="50" />'
                cb();
            }
        },
        'Title': {
            formula: function(cell, item, cb) {
                cell.value = (item.name != undefined) ? item.name : '&nbsp;&nbsp;&nbsp;&nbsp;<span style="font-style:italic">' + item.attributes[0].option + '</span>';
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
                links.push({ link: 'products/label/' + item.sku + '/' + window.btoa(item.permalink), title: 'label' });
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


    document.addEventListener('DOMContentLoaded', function() {

        frmLogin = new Login();
        frmEdit = new EditFrm();
        infoBlock = new InfoBlock();
        bAlert = new BAlert();
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
            if (request.status >= 200 && request.status < 405) {
                try {
                    var data = JSON.parse(request.responseText);
                    console.log(data);
                    document.getElementById('dashline').removeChild(frmLogin.div);

                    for (let i in data) {
                        let product = new Product(data[i]);
                        product.load();
                        // Add product to collection
                        products.add(product);

                        // Load variations
                        for (let s in data[i].variations) {
                            let product = new Product(data[i].variations[s], data[i].id);
                            product.load();
                            // Add product to collection
                            products.add(product);
                        }
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


    var editKeyValueById = function(item, key, value, cb) {
        var params = [item.id, key, window.btoa(value)];
        let path = '/products/';
        if (item.parent) {
            path += item.parent + '/variations/' + params.join('/');
        }
        else {
            path += params.join('/');
        }
        var request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                try {
                    var data = JSON.parse(request.responseText);
                    console.log(data);
                    cb();
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
    };



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
        form.appendChild(username);
        form.appendChild(password);
        form.appendChild(submit);
        div.appendChild(form);
        document.getElementById('dashline').appendChild(div);
        this.div = div;
        this.form = form;
        div.style.display = 'none';

        this.show = function() {
            this.div.style.display = 'block';
        };
        this.hide = function() {
            this.div.style.display = 'none';
        };
    };

    var EditFrm = function() {
        var self = this;

        this.key = null;
        this.value = null;
        this.id = null;
        this.item = null;

        var div = document.createElement('div');

        var value = document.createElement('input');
        value.type = "text";
        this.valueDom = value;
        value.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                editKeyValueById(self.item, self.key, value.value, function() {
                    self.item[self.key] = value.value;
                    self.item.update();
                    this.key = null;
                    this.value = null;
                    this.id = null;
                    this.item = null;
                    self.hide();
                    bAlert.show('value saved!', 'success');
                });
            }
        });

        var submit = document.createElement('button');
        submit.type = "button";
        submit.innerHTML = "save";
        submit.className = 'btn-success';
        submit.addEventListener('click', function() {
            editKeyValueById(self.item, self.key, value.value, function() {
                self.item[self.key] = value.value;
                self.item.update();
                this.key = null;
                this.value = null;
                this.id = null;
                this.item = null;
                self.hide();
                bAlert.show('value saved!', 'success');
            });
        });

        var cancel = document.createElement('button');
        cancel.type = "button";
        cancel.innerHTML = "cancel";
        cancel.className = 'btn';
        cancel.addEventListener('click', function() {
            this.key = null;
            this.value = null;
            this.id = null;
            this.item = null;
            self.hide();
        });

        div.appendChild(value);
        div.appendChild(submit);
        div.appendChild(cancel);
        document.getElementById('dashline').appendChild(div);
        this.div = div;
        div.style.display = 'none';
        div.style.float = 'left';
        this.show = function() {
            this.div.style.display = 'block';
            // infoBlock.div.style.marginTop = '-30px';
            this.valueDom.focus();
            this.valueDom.select();
        };
        this.hide = function() {
            this.div.style.display = 'none';
            // infoBlock.div.style.marginTop = '';
        };
    };


    var InfoBlock = function() {
        this.info = [
            { type: 'sum', col: 4, label: 'Total Einkaufpreis', value: 0, factor: 7 },
            { type: 'sum', col: 5, label: 'Total Verkaufspreis', value: 0, factor: 7 },
        ];
        let div = document.createElement('div');
        div.style.display = 'table';
        div.style.width = 'auto';
        div.style.float = 'right';

        for (let i = 0; i < this.info.length; i++) {
            let tr = document.createElement('div');
            tr.style.display = 'table-row';
            let td1 = document.createElement('div');
            td1.style.display = 'table-cell';
            td1.innerHTML = this.info[i].label + ': ';
            let td2 = document.createElement('div');
            td2.style.display = 'table-cell';
            td2.innerHTML = this.info[i].value;
            tr.appendChild(td1);
            tr.appendChild(td2);
            div.appendChild(tr);
            this.info[i].cellValue = td2;
            this.info[i].cellLabel = td1;
        }

        this.div = div;

        document.getElementById('dashline').appendChild(div);

        this.update = function() {
            // Reset values
            for (let s in this.info) {
                this.info[s].value = 0;
            }
            let table = products.tableBody[1].tBodies[0];
            let tr = table.rows;
            for (let i = 0; i < tr.length; i++) { // all rows
                if (tr[i].style.display !== 'none') {
                    for (let s in this.info) {
                        if (this.info[s].type === 'sum') {
                            let val = tr[i].cells[this.info[s].col].innerHTML;
                            let factor = tr[i].cells[this.info[s].factor].innerHTML;
                            if (!isNaN(val)) {
                                this.info[s].value += Number(val) * Number(factor);
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < this.info.length; i++) {
                this.info[i].cellValue.innerHTML = 'CHF' + (this.info[i].value).toLocaleString('de-CH-1996', { minimumFractionDigits: 0 });;
            }
        };
    };


    var BAlert = function() {
        var div = document.createElement('div');
        div.role = 'alert';
        document.getElementById('dashline').appendChild(div);
        div.style.display = 'none';
        var self = this;
        this.div = div;

        this.show = function(msg, type) {
            self.div.innerHTML = msg;
            self.div.className = 'alert alert-' + type;
            self.div.style.display = 'block';
            this.fadeOut(500);
        };
        this.hide = function() {
            this.div.style.display = 'none';
        };
        this.fadeOut = function(timeout) {
            window.setTimeout(function() {
                return $(self.div).fadeOut(500);
            }, timeout);
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

        this.tableBody = null;

        // Renders a Product table
        this.tableRender = function() {
            var table = this.table();
            this.tableBody = table;
            this.parent.appendChild(table[0]);
            for (let i = 0; i < items.length; i++) {
                items[i].domRow(table[1].tBodies[0]);
                items[i].update();
                infoBlock.update();
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
            tr.style.position = 'sticky';
            tr.style.top = '50px';
            tr.style.background = 'white';
            thead.appendChild(tr);
            t.appendChild(thead);

            // table Body
            var tbody = document.createElement('tbody');
            t.appendChild(tbody);

            // Filter / Search Header
            var header = document.createElement('div');
            header.style.width = '100%';

            // Search Field
            var iSearch = document.createElement('input');
            iSearch.class = 'form-control';
            iSearch.type = 'text';
            iSearch.placeholder = 'Search..';
            iSearch.style.marginBottom = '10px';
            iSearch.onkeyup = function() {
                var input, table, tr, i;
                input = this.value.toLowerCase().split(' ');
                input = input.filter(e => e !== ''); // Remove Empty strings

                // if No Search string given, show all rows
                if (!input.length) {
                    let table = tbody;
                    let tr = table.rows;
                    for (i = 0; i < tr.length; i++) { // all rows
                        tr[i].style.display = "table-row";
                    }
                    infoBlock.update();
                    return;
                }

                table = tbody;
                tr = table.rows;
                for (i = 0; i < tr.length; i++) { // all rows
                    if (searchTr(tr[i], input)) {
                        tr[i].style.display = "table-row";
                    }
                    else {
                        tr[i].style.display = "none";
                    }
                }
                infoBlock.update();
            };
            header.appendChild(iSearch);

            // Filter Buttons
            var fButtons = [
                { title: 'Qt1', col1: 8, col2: 7 },
                { title: 'Qt2', col1: 9, col2: 7 }
            ];
            var filterByQty = function(col1, col2) {
                let table = tbody;
                let tr = table.rows;
                for (let i = 0; i < tr.length; i++) { // all rows
                    let val1 = tr[i].cells[col1].innerHTML;
                    let val2 = tr[i].cells[col2].innerHTML;
                    if (val1 <= val2) {
                        tr[i].style.display = "table-row";
                    }
                    else {
                        tr[i].style.display = "none";
                    }
                }
            };
            var buttonQty1 = document.createElement('button');
            buttonQty1.type = 'button';
            buttonQty1.className = 'btn btn-primary btn-sm';
            buttonQty1.innerHTML = 'Qty 1';
            header.appendChild(buttonQty1);
            buttonQty1.addEventListener('click', function() {
                filterByQty(fButtons[0].col1, fButtons[0].col2);
            });

            var buttonQty2 = document.createElement('button');
            buttonQty2.type = 'button';
            buttonQty2.className = 'btn btn-primary btn-sm';
            buttonQty2.innerHTML = 'Qty 2';
            header.appendChild(buttonQty2);

            // Table Wrapper
            var div = document.createElement('div');
            div.style.width = '100%';
            //div.className = 'table-responsive';

            div.appendChild(header);
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
    var Product = function(data, parent) {

        this.parent = (typeof parent !== 'undefined') ? parent : 0;

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

            // Variation with different Background color
            tr.style.backgroundColor = (this.parent) ? '#f9f9c5' : '#FFF';

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
            for (let cell in this.row) {
                this.row[cell].update();
            }
        };

        /**
         * 
         * Loads Details of asset
         * 
         * 
         * 
         */
        this.detailsToggle = function() {};
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
        this.ondblclick = null;

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
                td.dataValue = this.value;
            }
            td.style.textAlign = this.align;
            td.style.cursor = 'pointer';
            td.className = this.class;
            td.onmousedown = function() { return false; };

            // Click events
            if (typeof(this.ondblclick) === 'function') {
                td.ondblclick = this.ondblclick(parent);
            }
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
     * 
     * 
     * 
     * 
     */
    var BModal = function(title, parent) {
        var modal = document.createElement('div');
        modal.className = 'modal';
        // modal.role = 'dialog';

        // Dialog
        var dialog = document.createElement('div');
        dialog.className = 'modal-dialog';
        // dialog.style.width = '100%';
        //dialog.style.height = '80%';
        //dialog.style.margin = '0';
        //dialog.style.padding = '0';

        // Content Area
        var content = document.createElement('div');
        content.className = 'modal-content';
        //content.style.height = 'auto';
        //content.style.minHeight = '100%';
        //content.style.borderRadius = '0';

        // Header
        var header = document.createElement('div');
        header.className = 'modal-header';
        var h4 = document.createElement('h4');
        h4.className = 'modal-title';
        h4.innerHTML = title;
        var dismiss = document.createElement('button');
        dismiss.type = 'button';
        dismiss.className = 'close';
        dismiss.dataDismiss = 'modal';
        dismiss.innerHTML = '&times;';
        header.appendChild(h4);
        header.appendChild(dismiss);

        // Body
        var body = document.createElement('div');
        body.className = 'modal-body';

        // Footer
        var footer = document.createElement('div');
        footer.className = 'modal-footer';
        var dismissBottom = document.createElement('button');
        dismissBottom.className = 'btn btn-danger';
        dismissBottom.type = 'button';
        dismissBottom.dataDismiss = 'modal';
        dismissBottom.innerHTML = 'Close';
        var btnSave = document.createElement('button');
        btnSave.type = 'button';
        btnSave.onclick = function() {};
        footer.appendChild(btnSave);
        footer.appendChild(dismissBottom);

        // Throw everything together
        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(footer);
        dialog.appendChild(content);
        modal.appendChild(dialog);

        parent.appendChild(modal);

        // save modal tree
        this.dom = modal;
        this.content = body;
        this.title = h4.innerHTML;
    };



    /**
     * Searches table-tr for array of words
     * 
     * @param DOM tr <tr>-DOM Element to search
     * @param array aInput Array with search-Strings
     * 
     */
    var searchTr = function(tr, aInput) {
        let tds = tr.cells;
        let counter = 0;
        let words = aInput;
        for (let i = 0; i < tds.length; i++) { // all cells/cols
            if (tds[i]) {
                let txtValue = tds[i].textContent || tds[i].innerText;
                for (let s = 0; s < words.length; s++) {
                    if (txtValue.toUpperCase().indexOf(words[s].toUpperCase()) > -1) {
                        // Remove found word from words list, so it doesn't get count more than once
                        words = words.filter(e => e !== words[s]);
                        counter++;
                        s--;
                        if (counter === aInput.length) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };


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
