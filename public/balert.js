/*global $*/
(function() {

      document.addEventListener('DOMContentLoaded', function() {
            window.bAlert = new BAlert();
      });
      
      
      var BAlert = function() {
            var div = document.createElement('li');
            div.role = 'alert';
            document.getElementById('navbar').appendChild(div);
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

}());
