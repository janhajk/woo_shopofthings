/*global $ */
(function() {
      var add;

      document.addEventListener('DOMContentLoaded', function() {
            var dashline = document.getElementById('navbar');
            add = new Add(dashline);
      });

      var Add = function(parent) {
            var div = document.createElement('li');
            div.style.width = 'auto';
            div.style.float = 'right';
            div.style.padding = '5px';
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-info';

            var span = document.createElement('span');
            span.className = 'glyphicon glyphicon-file';
            button.appendChild(span);
            div.appendChild(button);
            parent.appendChild(div);

            button.addEventListener('click', function() {
                  let title = prompt('Title of the new Product');
                  let orderID = prompt('Order ID');
                  let params = 'title=' + title + '&orderid=' + orderID;
                  let request = new XMLHttpRequest();
                  request.open('POST', '/products/add', true);
                  request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                  request.onload = function() {
                        if (request.status >= 200 && request.status < 404) {
                              alert('Product added, please reload site');
                        }
                  };
                  request.onerror = function() {
                        alert('Error when adding new Product');
                  };
                  request.send(params);

            });

      };

})();
