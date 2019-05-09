/*global $ */
(function() {
      var orderBlock;

      document.addEventListener('DOMContentLoaded', function() {
            var dashline = document.getElementById('dashline');
            orderBlock = new OrderBlock(dashline);
            orderBlock.update();
            setInterval(orderBlock.update, 10000);

      });


      var OrderBlock = function(parent) {
            var self = this;
            let div = document.createElement('div');
            div.style.display = 'block';
            div.style.width = 'auto';
            div.style.float = 'right';
            this.content = div;
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
                                          this.orders.push(data[i]);
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
                        content.push('<a href="/label/adress/'+this.orders[i].id+'">' + this.orders[i].id + '</a>');
                  }
                  this.div.innerHTML = content.join('&nbsp;');
            };
      };
      


})();
