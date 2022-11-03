KarmaFieldsAlpha.tables.pagination = function(manager) {
  return {
    class: "footer-group table-pagination",
    update: function() {


      // var options = manager.history.read(["options"]);
      // var ppp = parseInt(options.ppp || Number.MAX_SAFE_INTEGER);
      // var page = parseInt(options.page || 1);
      // var num = parseInt(manager.history.read(["table", "count"]) || 0);

      this.children = [
        {
          tag: "p",
          class: "footer-item",
          update: function() {
            var num = manager.getCount();
            this.element.textContent = num ? num+" items" : "";
          }
        },
        {
          tag: "button",
          class: "button footer-item",
          init: function() {
            this.element.innerText = "«";
            this.element.addEventListener("click", function() {
              // manager.options.page = 1;
              // manager.history.write(["options", "page"], "1");
              manager.setPage(1);
              manager.request();
            });
          },
          update: function() {
            var num = manager.getCount();
            var ppp = manager.getPpp();
            var page = manager.getPage();
            this.element.style.display = num > ppp ? "block" : "none";
            this.element.disabled = (page === 1);
          }
        },
        {
          tag: "button",
          class: "button footer-item",
          init: function() {
            var page = manager.getPage();
            this.element.innerText = "‹";
            if (page === 1) {
              this.element.disabled = true;
            }
            this.element.addEventListener("click", function() {
              manager.setPage(manager.getPage()-1);
              // manager.history.write(["options", "page"], (page-1).toString());
              manager.request();
            });
          },
          update: function() {
            var num = manager.getCount();
            var ppp = manager.getPpp();
            var page = manager.getPage();
            this.element.style.display = num > ppp ? "block" : "none";
            this.element.disabled = (page === 1);
          }
        },
        {
          class: "current-page footer-item",
          update: function() {
            var num = manager.getCount();
            var ppp = manager.getPpp();
            var page = manager.getPage();
            this.element.style.display = num > ppp ? "block" : "none";
            this.element.textContent = num && page+" / "+Math.ceil(num/ppp) || "";
          }
        },
        {
          tag: "button",
          class: "button footer-item",
          init: function() {
            this.element.innerText = "›";
            this.element.addEventListener("click", function() {
              // page++;
              // manager.history.write(["options", "page"], page.toString());
              manager.setPage(manager.getPage()+1);
              manager.request();
            });
          },
          update: function() {
            var num = manager.getCount();
            var ppp = manager.getPpp();
            var page = manager.getPage();
            this.element.style.display = num > ppp ? "block" : "none";
            this.element.disabled = page >= Math.ceil(num/ppp);
          }
        },
        {
          tag: "button",
          class: "button footer-item",
          init: function(element) {
            this.element.innerText = "»";
            this.element.addEventListener("click", function() {
              var num = manager.getCount();
              var ppp = manager.getPpp();
              // manager.options.page = maxPage;
              manager.setPage(Math.ceil(num/ppp));
              // manager.history.write(["options", "page"], Math.ceil(num/ppp));
              manager.request();
            });
          },
          update: function() {
            var num = manager.getCount();
            var ppp = manager.getPpp();
            var page = manager.getPage();
            this.element.style.display = num > ppp ? "block" : "none";
            this.element.disabled = page >= Math.ceil(num/ppp);
          }
        }
      ];
    }
  };
}
