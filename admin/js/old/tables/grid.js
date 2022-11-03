KarmaFieldsAlpha.tables.grid = function(manager) {
  return {
    class: "karma-field-table karma-fields",
    init: function(container) {
      manager.render = this.render;
      this.element.addEventListener("mouseup", function() {
        // handle outside mouseup
        if (manager.select && manager.select.onClick) {
          manager.select.onClick();
        }
      });
    },
    children: [
      {
        class: "table-header",
        init: function() {
          manager.renderHeader = this.render;
          if (manager.resource.filter) {
            var filterField = manager.field.createChild({
              buffer: "filters"
            });
            filterField.events.submit = function() {
              manager.setPage(1);
              manager.request();
            }
            filterField.events.updateFooter = function() {
              manager.renderFooter();
            }
            this.children = filterField.createChild(manager.resource.filter).build();
          }
        }
      },
      {
        class: "table-body",
        child: {
          tag: "table",
          class: "grid",
          init: function() {
            manager.renderBody = this.render;

            // manager.history.write("inner", ["table", "items"], []);

            manager.request();

            if (manager.resource.width) {
              this.element.style.width = manager.resource.width;
            }
            if (manager.resource.style) {
              this.element.style = manager.resource.style;
            }
          },
          update: function() {
            manager.select.init(); // = KarmaFieldsAlpha.selectors.grid(manager);
            manager.fields = {};
          },
          children: [
            {
              tag: "thead",
              child: {
                tag: "tr",
                update: function() {
                  this.children = manager.resource.children.filter(function(column) {
                    return true;
                  }).map(function(column, colIndex) {
                    return {
                      tag: "th",
                      init: function() {
                        if (column.main) {
                          this.element.classList.add("main");
                        }
                        if (column.style) {
                          this.element.style = column.style;
                        }
                        if (column.width) {
                          this.element.style.width = column.width;
                        }
                        this.element.addEventListener("mousedown", function(event) {
                    			manager.select.onHeaderMouseDown(colIndex);
                    		});
                    		this.element.addEventListener("mousemove", function(event) {
                    			manager.select.onHeaderMouseMove(colIndex);
                    		});
                    		this.element.addEventListener("mouseup", function(event) {
                    			manager.select.onHeaderMouseUp(colIndex);
                    			event.stopPropagation();
                    		});
                      },
                      update: function() {
                        // manager.select.addCol(this.element, colIndex);
                      },
                      child: {
                        class: "header-cell",
                        children: [
                          {
                            tag: "a",
                            class: "header-cell-title",
                            init: function() {
                              this.element.textContent = column.title;
                            }
                          },
                          column.sortable && {
                            tag: "a",
                            class: "header-cell-order",
                            child: {
                              class: "order-icon change-order",
                            },
                            init: function() {
                              this.element.addEventListener("click", function() {
                                manager.reorder(column.key, column.driver, column.default_order);
                                // manager.request();
                              });
                            },
                            update: function() {
                              // var orderby = manager.history.request("inner", ["options", "orderby"]);
                              // var order = manager.history.read("inner", ["options", "order"]);
                              var orderby = manager.history.request(["order", "orderby"]);
                        			var order = manager.history.request(["order", "order"]);
                              this.element.classList.toggle("asc", orderby === column.key && order === "asc");
                              this.element.classList.toggle("desc", orderby === column.key && order === "desc");
                            }
                          }
                        ]
                      }
                    };
                  });
                  if (manager.resource.index) {
                    this.children.unshift({
                      tag: "th",
                      class: "table-header-index",
                      init: function(element) {
                        if (manager.resource.index.title) {
                          this.element.textContent = manager.resource.index.title;
                        }
                        if (manager.resource.index.width) {
                          this.element.style.width = manager.resource.index.width;
                        }
                        this.element.addEventListener("mousedown", function(event) {
                    			manager.select.onIndexHeaderMouseDown();
                    		});
                    		this.element.addEventListener("mousemove", function(event) {
                    			manager.select.onIndexHeaderMouseMove();
                    		});
                    		this.element.addEventListener("mouseup", function(event) {
                    			manager.select.onIndexHeaderMouseUp();
                    			event.stopPropagation();
                    		});
                      },
                      update: function() {
                        // manager.select.addIndexHeader(this.element);
                      }
                    });
                  }
                }
              }
            },
            {
              tag: "tbody",
              update: function() {
                var uris = manager.getItems();

                var tableField = manager.history.createFieldManager({
                  buffer: "input",
                  outputBuffer: "output"
                });
                tableField.events.updateFooter = function() {
                  manager.renderFooter();
                }
                this.children = uris && uris.filter(function(uri) {
                  return uri;
                }).map(function(uri, rowIndex) {
                  return {
                    tag: "tr",
                    update: function(row) {
                      this.children = manager.resource.children.filter(function(column) {
                        return true;
                      }).map(function(column, colIndex) {
                        return {
                          tag: "td",
                          init: function(cell) {
                            this.element.addEventListener("mousedown", function(event) {
                              manager.select.onCellMouseDown(colIndex, rowIndex);
                            });
                            this.element.addEventListener("mousemove", function() {
                              manager.select.onCellMouseMove(colIndex, rowIndex);
                            });
                            this.element.addEventListener("mouseup", function(event) {
                              manager.select.onCellMouseUp(colIndex, rowIndex);
                              event.stopPropagation();
                            });
                            if (column.container_style) {
                              this.element.style = column.container_style;
                            }
                          },
                          update: function(cell) {
                            var field = tableField.createChild(column);
                            field.uri = uri;
                            field.events.update = function() {
                              manager.renderFooter();
                            }
                            field.events.modify = function() {
                              cell.element.classList.toggle("modified", field.isModified());
                            }
                            field.events.render = function() {
                              cell.render();
                            }
                            manager.select.addField(colIndex, rowIndex, this.element, field);
                            field.trigger("modify");
                            this.child = field.buildSingle(); // should only do this if there is actual change
                          }
                        };
                      });

                      if (manager.resource.index) {
                        this.children.unshift({
                          tag: "th",
                          init: function() {
                            this.element.addEventListener("mousedown", function(event) {
                      				manager.select.onIndexCellMouseDown(rowIndex);
                      			});
                      			this.element.addEventListener("mousemove", function() {
                      				manager.select.onIndexCellMouseMove(rowIndex);
                      			});
                      			this.element.addEventListener("mouseup", function(event) {
                      				manager.select.onIndexCellMouseUp(rowIndex);
                      				event.stopPropagation();
                      			});
                          },
                          update: function() {
                            manager.select.addRowIndex(this.element, rowIndex);
                          },
                          child: {
                            class: "row-index",
                            update: function() {
                              var page = manager.getPage();
                              var ppp = manager.getPpp();
                              this.element.textContent = ((page-1)*ppp)+rowIndex+1;
                            },
                          }
                        });
                      }
                    }
                  };
                });
              }
            }
          ]
        }
      },
      KarmaFieldsAlpha.tables.footer(manager)

    ]
  };
}
