/*global $ */
(function() {

      var doc;

      document.addEventListener('DOMContentLoaded', function() {
            doc = new Document('Produkte');

      });

      var row = function() {
            let div = document.createElement('div');
            div.className = 'row';
            let col = document.createElement('div');
            col.className = 'col';
            div.appendChild(col);
            return {div:div, col:col};
      };



      var Document = function(title) {
            var self = this;
            this.title = {
                  value: title,
                  html: null
            };
            this.row = row();
            let content = document.getElementById('content');
            content.appendChild(this.row.div);

            var html = function() {
                  let div = document.createElement('div');
                  div.className = 'ibox ibox-fullheight';
                  let head = document.createElement('div');
                  head.className = 'ibox-head';
                  let divTitle = document.createElement('div');
                  divTitle.className = 'ibox-title';
                  divTitle.innerHTML = title;
                  let divBody = document.createElement('div');
                  divBody.className = 'ibox-body';
                  let divSlimScroll = document.createElement('div');
                  divSlimScroll.className = 'slimScrollDiv';
                  divSlimScroll.style.position = 'relative';
                  divSlimScroll.style.overflow = 'hidden';
                  divSlimScroll.style.width = 'auto';
                  divSlimScroll.style.height = '470px';
                  divSlimScroll.id = 'productContent';
                  divBody.appendChild(divSlimScroll);
                  div.appendChild(head);
                  head.appendChild(divTitle);
                  div.appendChild(divBody);
                  self.title.html = divTitle;
                  self.row.col.appendChild(div);
                  
                  

                  // Inside head
                  //   <div class="ibox-tools ">
                  //       <a class="dropdown-toggle font-18 " data-toggle="dropdown "><i class="ti-ticket"></i></a>
                  //       <div class="dropdown-menu dropdown-menu-right ">
                  //           <a class="dropdown-item "><i class="ti-pencil mr-2 "></i>Create</a>
                  //           <a class="dropdown-item "><i class="ti-pencil-alt mr-2 "></i>Edit</a>
                  //           <a class="dropdown-item "><i class="ti-close mr-2 "></i>Remove</a>
                  //       </div>
                  //   </div>

                  // Inside divSlimScroll
                  // <div class="slimScrollBar " style="background: rgb(113, 128, 143) none repeat scroll 0% 0%; width: 4px; position: absolute; top: 0px; opacity: 0.4; display: none; border-radius: 7px; z-index: 99; right: 1px; height: 437.426px; "></div>
                  // <div class="slimScrollRail " style="width: 4px; height: 100%; position: absolute; top: 0px; display: none; border-radius: 7px; background: rgb(51, 51, 51) none repeat scroll 0% 0%; opacity: 0.9; z-index: 90; right: 1px; "></div>

            };

            html();
      };


})();
