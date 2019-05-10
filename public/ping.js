/*global $ */
(function() {
      var ping;

      document.addEventListener('DOMContentLoaded', function() {
            var dashline = document.getElementById('dashline');
            ping = new Ping(dashline);
            ping.update();
            setInterval(ping.update, 5000);

      });

      var Ping = function(parent) {
            var self = this;
            var icon = {
                  online: 'glyphicon glyphicon-signal',
                  offline: 'glyphicon glyphicon-alert'
            };
            var div = document.createElement('div');
            div.style.width = 'auto';
            div.style.float = 'right';
            div.id = 'ping';
            var span = document.createElement('span');
            span.class = icon.offline;
            div.appendChild(span);
            this.glyph = span;
            parent.appendChild(div);

            this.update = function() {
                  let request = new XMLHttpRequest();
                  request.open('GET', '/ping', true);
                  request.onload = function() {
                        if (request.status >= 200 && request.status < 405) {
                              self.glyph.class = icon.online;
                        }
                        else {
                              self.glyph.class = icon.offline;
                        }
                  };
                  request.onerror = function() {
                        self.glyph.class = icon.offline;
                  };
                  request.send();
            };
      };

})();
