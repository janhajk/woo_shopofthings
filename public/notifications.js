/*global $ */
(function() {

      var notifications;

      var items = [{
                  content: 'Block "SIA 118 Abschnitt 8/23" hat ein Update',
                  time: 1557833176
            },
            {
                  content: 'Block "SIA 118 Abschnitt 8/25" hat ein Update',
                  time: 1557823176
            },
            {
                  content: 'Block "SIA 118 Abschnitt 9/23" hat ein Update',
                  time: 1557813176
            },
            {
                  content: 'Block "SIA 220 Abschnitt 8/23" hat ein Update',
                  time: 1557803176
            },
            {
                  content: 'Block "SIA 118 Abschnitt 8/23" hat ein Update',
                  time: 1547893176
            },
            {
                  content: 'Block "SIA 118 Abschnitt 8/23" hat ein Update',
                  time: 1554883176
            },
      ];

      document.addEventListener('DOMContentLoaded', function() {
            notifications = new Notifications();
            for (let i in items) {
                  notifications.addItem(items[i]);
            }

      });



      /*
       * Oututs:
       * <li class="timeline-item"><i class="ti-check timeline-icon"></i>2 Issue fixed<small class="float-right text-muted ml-2 nowrap">Just now</small></li>
       **/
      var element = function(content, contentSmall, icon) {
            if (icon === undefined) icon = 'ti-info-alt';
            let li = document.createElement('li');
            li.className = 'timeline-item';
            let i = document.createElement('i');
            i.className = ['timeline-icon', icon].join(' ');
            let span = document.createElement('span');
            span.innerHTML = content;
            let small = document.createElement('small');
            small.className = ['float-right', 'text-muted', 'ml-2', 'nowrap'].join(' ');
            small.innerHTML = contentSmall;
            li.appendChild(i);
            li.appendChild(span);
            li.appendChild(small);
            return li;
      };


      var Notifications = function() {
            var self = this;

            this.ul = null;
            this.items = [];

            let content = document.getElementById('content');

            var html = function() {

                  let header = {
                        title: 'Benachrichtigungen'
                  };

                  // Site Header li-Element
                  let li = document.createElement('li');
                  li.className = ['dropdown', 'dropdown-notification'].join(' ');
                  document.getElementById('navbar').appendChild(li);

                  // Icon
                  let icon = document.createElement('a');
                  icon.className = ['nav-link', 'dropdown-toggle', 'toolbar-icon'].join(' ');
                  icon.href = 'javascript:;';
                  icon.setAttribute('data-toggle', 'dropdown');
                  let icon_i = document.createElement('i');
                  icon_i.className = ['ti-bell', 'rel'].join(' ');
                  let icon_span = document.createElement('span');
                  icon_span.className = 'notify-signal';
                  icon_i.appendChild(icon_span);
                  icon.appendChild(icon_i);
                  li.appendChild(icon);

                  // content
                  let div = document.createElement('div');
                  div.className = ['dropdown-menu', 'dropdown-menu-right', 'dropdown-menu-media'].join(' ');
                  li.appendChild(div);

                  // arrow header
                  let arrow = document.createElement('div');
                  arrow.className = 'dropdown-arrow';
                  div.appendChild(arrow);

                  // Header
                  let header_div = document.createElement('div');
                  header_div.className = ['dropdown-header', 'text-center'].join(' ');
                  let header_div_div = document.createElement('div');
                  let header_span = document.createElement('span');
                  header_span.className = 'font-18';
                  header_span.innerHTML = header.title;
                  header_div_div.appendChild(header_span);
                  header_div.appendChild(header_div_div);
                  div.appendChild(header_div);

                  // content
                  let content_div = document.createElement('div');
                  content_div.className = 'p-3';
                  div.appendChild(content_div);

                  // Notification List
                  let ul = document.createElement('ul');
                  ul.className = ['timeline', 'scroller'].join(' ');
                  ul.setAttribute('data-height', '320px');
                  self.ul = ul;
                  content_div.appendChild(ul);
                  $(icon).dropdown();
            };

            html();

            this.addItem = function(item) {
                  let li = element(item.content, timeSince(new Date(item.time * 1000)));
                  self.ul.appendChild(li);
            };
      };



      var timeSince = function(date) {
            var seconds = Math.floor((new Date() - date) / 1000);
            var interval = Math.floor(seconds / 31536000);
            if (interval > 1) {
                  return interval + " Jahre";
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                  return interval + " Monate";
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                  return interval + " Tage";
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                  return interval + " Stunden";
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                  return interval + " Minuten";
            }
            return Math.floor(seconds) + " Sekunden";
      }


})();
