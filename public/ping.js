/*global $ */
(function() {
      var ping;

      document.addEventListener('DOMContentLoaded', function() {
            var dashline = document.getElementById('navbar');
            ping = new Ping(dashline);
            ping.update();
            setInterval(ping.update, 5000);

      });

      var Ping = function(parent) {
            var self = this;
            var icon = {
                  online: 'ti-signal' + ' nav-link toolbar-icon',
                  offline: 'ti-face-sad' + ' nav-link toolbar-icon'
            };
            var div = document.createElement('li');
            div.style.width = 'auto';
            div.style.float = 'right';
            div.id = 'ping';
            div.className = 'timeout-toggler';
            var span = document.createElement('span');
            span.className = icon.offline;
            div.appendChild(span);
            this.glyph = span;
            parent.appendChild(div);

            this.update = function() {
                  let request = new XMLHttpRequest();
                  request.open('GET', '/ping', true);
                  request.onload = function() {
                        if (request.status >= 200 && request.status < 404) {
                              self.glyph.className = icon.online;
                        }
                        else {
                              self.glyph.className = icon.offline;
                        }
                  };
                  request.onerror = function() {
                        self.glyph.className = icon.offline;
                  };
                  request.send();
            };
      };

})();
