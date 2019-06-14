(function() {

      const bAlert = window.bAlert;

      document.addEventListener('DOMContentLoaded', function() {
            window.frmEdit = new EditFrm();
      });

      var EditFrm = function() {
            var self = this;

            this.key = null;
            this.value = null;
            this.id = null;
            this.item = null;

            var div = document.createElement('li');

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
            document.getElementById('navbar').appendChild(div);
            this.div = div;
            div.style.display = 'none';
            // div.style.float = 'left';
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

}());
