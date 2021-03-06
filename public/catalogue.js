/*global $ */
/*global catalogueRunOnce */
(function() {

    var products;
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
                let src = (item.image) ? item.image.src : 'https://shopofthings.ch/wp-content/plugins/woocommerce/assets/images/placeholder.png';
                cell.value = '<img src="' + src + '" style="height:50px" />';
                cell.align = 'center';
                cb();
            }
        },
        'Title': {
            formula: function(cell, item, cb) {
                cell.value = '<a href="' + item.permalink + '" target="_blank" style="text-decoration:underline">' + item.title + '</a>';
                cb();
            }
        },
        'SKU': {
            col: 'sku'
        },
        'Price': {
            col: 'price',
            round: 2
        },
        'Shipping': {
            col: 'shipping'
        },
        'Kategorien': {
            formula: function(cell, item, cb) {
                let cats = [];
                for (let i in item.categories) {
                    cats.push(item.categories[i].name);
                }
                cell.value = cats.join(', ');
                cb();
            }
        }
    };


    document.addEventListener('DOMContentLoaded', function() {

        var content = document.getElementById('content');
        if (typeof catalogueRunOnce === 'undefined') {

            // var divSpinner = document.createElement('img');
            // divSpinner.src = 'https://shopofthings.ch/wp-content/uploads/2019/03/Matrix-3.8s-200x200px.gif';
            // divSpinner.style.margin = '0 auto';
            // var divSpinnerContainer = document.createElement('div');
            // divSpinnerContainer.style.width = '100%';
            // divSpinnerContainer.appendChild(divSpinner);
            // content.appendChild(divSpinnerContainer);
            let pb = new Progressbar(content, 10000, function(pbContainer) {
                content.removeChild(pbContainer);
            });


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

            catalogueRunOnce = true;
            var request = new XMLHttpRequest();
            request.open('GET', 'https://admin.shopofthings.ch/products_public_v2', true);
            request.onload = function() {
                if (request.status >= 200 && request.status < 405) {
                    try {
                        var data = JSON.parse(request.responseText);
                        for (let i in data) {
                            let product = new Product(data[i]);
                            product.load();

                            // Add product to collection
                            products.add(product);
                        }
                        products.tableRender();
                        // content.removeChild(divSpinnerContainer);
                    }
                    catch (e) {
                        console.log(e);
                        console.log(new Date().toLocaleString() + ': not logged in');
                        document.getElementById('content').innerHTML = 'Fehler beim Laden';
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
        }
    });


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
            //tr.style.position = 'sticky';
            tr.style.top = '50px';
            tr.style.background = 'white';
            thead.appendChild(tr);
            t.appendChild(thead);

            // table Body
            var tbody = document.createElement('tbody');
            t.appendChild(tbody);

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
            };

            // Table Wrapper
            var div = document.createElement('div');
            div.style.width = '100%';
            div.align = 'center';
            //div.className = 'table-responsive';
            div.appendChild(iSearch);
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


    var Progressbar = function(target, duration, finished) {

        let timer;

        let div = document.createElement('div');
        div.className = 'progress';
        div.style.maxWidth = '500px';
        div.style.marginLeft = 'auto';
        div.style.marginRight = 'auto';
        let bar = document.createElement('div');
        bar.className = 'progress-bar progress-bar-striped';
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-valuenow', '0');
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '100');
        bar.style.width = '0%';
        bar.innerHTML = '0%';
        div.appendChild(bar);


        target.appendChild(div);


        const update = function(value) {
            bar.setAttribute('aria-valuenow', value);
            bar.style.width = parseInt(value, 10) + '%';
            bar.innerHTML = parseInt(value, 10) + '%';
        };

        const start = function(duration) {
            let progress = 0;
            timer = window.setInterval(function() {
                progress += 10;
                update(progress);
                if (progress === 100) {
                    finished(div);
                }
            }, parseInt(duration / 10, 10));
        };

        start(duration);
    };

})();
