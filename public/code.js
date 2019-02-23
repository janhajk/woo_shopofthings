(function() {
      
      
      document.addEventListener('DOMContentLoaded', function() {
            
         var frmLogin = new Login();
        /**
         * 
         * Load initial Data
         * 
         * This function only gets called once
         * 
         * 
         */
        var request = new XMLHttpRequest();
        request.open('GET', '/position', true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                try {
                    var data = JSON.parse(request.responseText);
                   
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
        // var btn = document.createElement('button');
        // btn.type = 'button';
        // btn.style.clear = 'both';
        // btn.style.float = 'right';
        // btn.className = 'btn btn-xs';
        // btn.innerHTML = 'Login';
        // btn.style.display = 'none';
        // btn.style.display = 'none';
        // btn.onclick = function() {
        //     window.location = '/login';
        // };
        // this.btn = btn;
        document.getElementById('dashline').appendChild(form);
        
        this.show = function() {
            this.btn.style.display = 'block';
        };
        this.hide = function() {
            this.btn.style.display = 'none';
        };
    };
    
    
    
})();