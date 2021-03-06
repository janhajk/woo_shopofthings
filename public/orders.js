/*global $ */
(function() {
      var orderBlock;

      document.addEventListener('DOMContentLoaded', function() {
            var dashline = document.getElementById('navbar');
            orderBlock = new OrderBlock(dashline);
            orderBlock.update();
            setInterval(orderBlock.update, 10000);

      });


      var OrderBlock = function(parent) {
            var self = this;
            let div = document.createElement('li');
            div.style.width = 'auto';
            div.style.float = 'right';
            let title = document.createElement('div');
            title.innerHTML = 'Address Labels for Order No.';
            let content = document.createElement('div');
            content.style.margin = '3px';
            this.content = content;
            div.appendChild(title);
            div.appendChild(content);
            parent.appendChild(div);
            this.orders = [];

            this.update = function() {
                  let request = new XMLHttpRequest();
                  request.open('GET', '/orders/processing', true);
                  request.onload = function() {
                        if (request.status >= 200 && request.status < 405) {
                              try {
                                    self.orders = [];
                                    var data = JSON.parse(request.responseText);
                                    console.log(data);
                                    for (let i in data) {
                                          self.orders.push(data[i]);
                                    }
                                    self.render();
                              }
                              catch (e) {
                                    console.log(e);
                                    console.log(new Date().toLocaleString() + ': not logged in');
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

            this.render = function() {
                  let content = [];
                  for (var i in this.orders) {
                        let title = this.orders[i].billing.first_name + ' ' + this.orders[i].billing.last_name;
                        content.push('<a href="/label/adress/' + this.orders[i].id + '" title="' + title + '">' + this.orders[i].id + '</a>');
                  }
                  this.content.innerHTML = content.join('&nbsp;|&nbsp;');
            };
      };



})();
