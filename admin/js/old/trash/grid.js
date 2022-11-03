

KarmaFieldsAlpha.fields = KarmaFieldsAlpha.fields || {};
KarmaFieldsAlpha.fields.grid = KarmaFieldsAlpha.fields.grid || {};


KarmaFieldsAlpha.fields.grid.create = function(resource) {
  let field = KarmaFieldsAlpha.Field(resource);
  field.data.createCell = function() {
    return rowField.createChild({
      type: "input"
    });
  };
  field.data.createRow = function() {
    return KarmaFieldsAlpha.createField({
      key: j,
      type: "input"
    }, rowField);
  }
  field.setValue = function(value, context) {

    if (!value && this.resource.value) {
      value = this.resource.value;
    }
    console.log(value);
    // if (Array.isArray(value) && value.length) {
    //   value.height = value.length;
    //   value.width = value[0].length;
    // }
    if (context === "set") {
      for (let i = 0; i < value.height; i++) {
        let rowField = field.children[i] || field.createChild({});
        for (let j = 0; j < value.width; j++) {
          let cellField = rowField.children[j] || rowField.createChild({
            type: "input"
          });
          cellField.setValue(value[i] && value[i][j] || "", "set");
        }
      }
    }
    field.trigger("render");
  };
  field.getValue = function() {
    let value = this.children.reduce(function(value, item, index, array) {
      value[index] = item.children.reduce(function(row, item, index, array) {
        row[index] = item.getValue();
        value.width = array.length;
        return row;
      }, {});
      value.height = array.length;
      return value;
    }, {});
    return value;
  };
  field.getModifiedValue = field.getValue;
  field.data.select = KarmaFieldsAlpha.selectors.grid();


  field.data.addRow = function(index) {
    if (field.children.length) {
      const rowField = KarmaFieldsAlpha.createField({});
      for (let j = 0; j < field.children[0].children.length; j++) {
        rowField.createChild({
          type: "input"
        });
      }
      rowField.parent = field;
      field.children.splice(index, 0, rowField);
    }
    field.triggerEvent("change", true);
    field.triggerEvent("render");
  };
  field.data.addCol = function(index) {
    field.children.forEach(function(rowField) {
      rowField.children.splice(index, 0, KarmaFieldsAlpha.createField({
        type: "input"
      }));
    });
    field.triggerEvent("change", true);
    field.triggerEvent("render");
  };
  field.data.deleteRows = function(rows) {
    field.children = field.children.filter(function(rowField, index) {
      return rows.indexOf(index) === -1;
    });
    field.triggerEvent("change", true);
    field.triggerEvent("render");
  };
  field.data.deleteCols = function(cols) {
    field.children.forEach(function(rowField) {
      rowField.children = rowField.children.filter(function(cellField, index) {
        return cols.indexOf(index) === -1;
      });
    });
    field.triggerEvent("change", true);
    field.triggerEvent("render");
  };



  addEventListener("click", function(event) {
    let rect = field.data.select.getSelectionRect();
    if (rect.height && rect.width) {
      field.triggerEvent("clickOut", false, field, event.target);
    }
  }, true);



  field.events.focus = function() {
    if (KarmaFieldsAlpha.currentFieldFocus !== field) {
      KarmaFieldsAlpha.currentFieldFocus = field;
      KarmaFieldsAlpha.events.onCopy = function(event) {
        field.data.select.onCopy(event);
      }
      KarmaFieldsAlpha.events.onPast = function(event) {
        field.data.select.onPast(event);
      }
      KarmaFieldsAlpha.events.onDelete = function(event) {
        if (document.activeElement === document.body) {
          var rows = select.getSelectedRows();
          var cols = select.getSelectedCols();
          if (rows.length) {
            field.data.deleteRows(rows);
            event.preventDefault();
          } else if (cols.length) {
            field.data.deleteCols(cols);
            event.preventDefault();
          }
        }
      };
      KarmaFieldsAlpha.events.onSelectAll = function(event) {
        field.data.select.onSelectAll(event);
      };
      KarmaFieldsAlpha.events.onClick = function(event) {
        // field.data.select.onClick();
      };
      // KarmaFieldsAlpha.events.onArrowUp = function(event) {
      //   var rect = select.getSelectionRect();
      //   if (rect.top > 0) {
      //     rect.top--;
      //     rect.width = 1;
      //     rect.height = 1;
      //     select.select(rect);
      //   }
      // };
      // KarmaFieldsAlpha.events.onArrowDown = function(event) {
      //   var rect = select.getSelectionRect();
      //   if (rect.top + rect.height < select.rect.height) {
      //     rect.top = rect.top + rect.height;
      //     rect.width = 1;
      //     rect.height = 1;
      //     select.select(rect);
      //   }
      // };
      // KarmaFieldsAlpha.events.onArrowLeft = function(event) {
      //   var rect = select.getSelectionRect();
      //   if (rect.left > 0) {
      //     rect.left--;
      //     rect.width = 1;
      //     rect.height = 1;
      //     select.select(rect);
      //   }
      // };
      // KarmaFieldsAlpha.events.onArrowRight = function(event) {
      //   var rect = select.getSelectionRect();
      //   if (rect.left + rect.width < select.rect.width) {
      //     rect.left = rect.left + rect.width;
      //     rect.width = 1;
      //     rect.height = 1;
      //     select.select(rect);
      //   }
      // };
    }

  }

  field.data.creationForm = KarmaFieldsAlpha.createField({
    children: [
      {
        type: "header",
        value: "Create Table",
      },
      {
        display: "flex",
        children: [
          {
            type: "input",
            input: {
              type: "number"
            },
            label: "Column count",
            key: 'width',
            value: 2
          },
          {
            type: "input",
            input: {
              type: "number"
            },
            label: "Row count",
            key: 'height',
            value: 2
          },
        ]
      },
      {
        type: "submit"
      }
    ]
  });

  field.data.creationForm.events.submit = function() {
    field.setValue({
      width: field.data.creationForm.getDescendant("width").getValue() || 1,
      height: field.data.creationForm.getDescendant("height").getValue() || 1
    }, "set");
    field.triggerEvent("render");
  }

  field.data.toolbar = KarmaFieldsAlpha.createField({
    type: "toolbar",
    children: [
      {
        type: "toolbarDropdown",
        icon: "grid-view",
        children: [
          {
            type: "button",
            icon: "table-col-before",
            value: "col-before",
            text: "Insert col before"
          },
          {
            type: "button",
            icon: "table-col-after",
            value: "col-after",
            text: "Insert col after"
          },
          {
            type: "button",
            icon: "table-row-before",
            value: "row-before",
            text: "Insert row before"
          },
          {
            type: "button",
            icon: "table-row-after",
            value: "row-after",
            text: "Insert row after"
          },
          {
            type: "button",
            icon: "table-row-delete",
            value: "row-delete",
            text: "Delete row"
          },
          {
            type: "button",
            icon: "table-col-delete",
            value: "col-delete",
            text: "Delete col"
          }
        ]
      }
    ]
  });

  field.data.toolbar.events.click = function(currentField) {
    var rect = field.data.select.getSelectionRect();
    var value = field.getValue();
    if (value.width && value.height) {
      switch (currentField.value) {
        case "row-before":
          field.data.addRow(rect.height && rect.top || 0);
          break;
        case "row-after":
          field.data.addRow(rect.height && rect.top+rect.height || value.height);
          break;
        case "col-before":
          field.data.addCol(rect.width && rect.left || 0);
          break;
        case "col-after":
          field.data.addCol(rect.width && rect.left+rect.width || value.width);
          break;
        case "row-delete":
          var rows = [];
          for (var i = 0; i < rect.height; i++) {
            rows.push(rect.top + i);
          }
          field.data.deleteRows(rows);
          break;
        case "col-delete":
          var cols = [];
          for (var i = 0; i < rect.width; i++) {
            cols.push(rect.left + i);
          }
          field.data.deleteCols(cols);
          break;

      }
    }
  }

  return field;
}



KarmaFieldsAlpha.fields.grid.build = function(field) {
  return {
    class: "grid-container",
    clear: true,
    init: function(grid) {
      field.events.clickOut = function(field, target) {
				if (!grid.element.children[0].contains(target) && !grid.element.children[1].contains(target)) {
					field.data.select.select();
          grid.render();
				}
			}
    },
    update: function(table) {
      let value = field.getValue();

      if (value && value.width && value.height) {
        this.children = [
          // {
          //   class: "grid-toolbar",
          //   init: function(toolbar) {
          //     field.data.toolbar.events.render = function() {
          //       toolbar.render();
          //     }
          //   },
          //   child: field.data.toolbar.build()
          // },
          field.data.toolbar.build(),
          {
            tag: "table",
            class: "grid",
            child: {
              tag: "tbody",
              update: function() {
                field.data.select.init();
                this.children = field.children.map(function(rowField, y) {
                  return {
                    tag: "tr",
                    update: function() {
                      this.children = rowField.children.map(function(cellField, x) {
                        return {
                          tag: "td",
                          init: function() {
                            this.element.addEventListener("mousedown", function(event) {
                              field.data.select.onCellMouseDown(x, y);
                            });
                            this.element.addEventListener("mousemove", function() {
                              field.data.select.onCellMouseMove(x, y);
                            });
                            this.element.addEventListener("mouseup", function(event) {
                              field.data.select.onCellMouseUp(x, y);
                              // event.stopPropagation();
                            });
                          },
                          update: function(cell) {
                            cellField.events.update = function() {
                              cell.element.classList.toggle("modified", cellField.value !== cellField.originalValue);
                            };
                            cellField.events.render = function() {
                              cell.render();
                            };
                            this.child = cellField.build();
                            field.data.select.addField(x, y, this.element, cellField);
                          }
                        }
                      });
                    }
                  };
                });
              }
            }
          }
        ];
      } else {
        this.children = [{
          class: "grid-creation",
          child: field.data.creationForm.build()
        }];
      }
    }
  };
}


// KarmaFieldsAlpha.fields.grid = function(field) {
//
//
//   return {
//     class: "karma-field-grid",
//     init: function(grid) {
//       var select = KarmaFieldsAlpha.selectors.grid();
//       var gridManager = {
//         getValue: function() {
//           var value = field.getValue();
//           if (!value || !value.length) {
//             value = [[""]];
//           }
//           return value;
//         },
//         addRow: async function(index) {
//           var value = this.getValue();
//           var row = value[0] && value[0].map(function() {
//             return "";
//           }) || [""];
//           value.splice(index, 0, row);
//           field.setValue(value);
//           grid.render();
//         },
//         addCol: function(index) {
//           var value = this.getValue();
//           value.forEach(function(row) {
//             row.splice(index, 0, "");
//           });
//           field.setValue(value);
//           grid.render();
//         },
//         deleteRows: function(rows) {
//           var value = this.getValue().filter(function(row, index) {
//             return rows.indexOf(index) === -1;
//           });
//           if (!value.length) {
//             value = [[""]];
//           }
//           field.setValue(value);
//           select.select();
//           grid.render();
//         },
//         deleteCols: function(cols) {
//           var value = this.getValue().map(function(row) {
//             row = row.filter(function(cell, index) {
//               return cols.indexOf(index) === -1;
//             });
//             if (!row.length) {
//               row = [""];
//             }
//             return row;
//           });
//           field.setValue(value);
//           select.select();
//           grid.render();
//         }
//       };
//       field.onFocus = function() {
//         KarmaFieldsAlpha.events.onCopy = function(event) {
//           select.onCopy(event);
//         }
//         KarmaFieldsAlpha.events.onPast = function(event) {
//           select.onPast(event);
//         }
//         KarmaFieldsAlpha.events.onDelete = function(event) {
//           if (document.activeElement === document.body) {
//             var rows = select.getSelectedRows();
//             var cols = select.getSelectedCols();
//             if (rows.length) {
//               gridManager.deleteRows(rows);
//               event.preventDefault();
//             } else if (cols.length) {
//               gridManager.deleteCols(cols);
//               event.preventDefault();
//             }
//           }
//         };
//         KarmaFieldsAlpha.events.onSelectAll = function(event) {
//           select.onSelectAll(event);
//         };
//         KarmaFieldsAlpha.events.onClick = function(event) {
//           select.onClick();
//         };
//         KarmaFieldsAlpha.events.onArrowUp = function(event) {
//           var rect = select.getSelectionRect();
//           if (rect.top > 0) {
//             rect.top--;
//             rect.width = 1;
//             rect.height = 1;
//             select.select(rect);
//           }
//         };
//         KarmaFieldsAlpha.events.onArrowDown = function(event) {
//           var rect = select.getSelectionRect();
//           if (rect.top + rect.height < select.rect.height) {
//             rect.top = rect.top + rect.height;
//             rect.width = 1;
//             rect.height = 1;
//             select.select(rect);
//           }
//         };
//         KarmaFieldsAlpha.events.onArrowLeft = function(event) {
//           var rect = select.getSelectionRect();
//           if (rect.left > 0) {
//             rect.left--;
//             rect.width = 1;
//             rect.height = 1;
//             select.select(rect);
//           }
//         };
//         KarmaFieldsAlpha.events.onArrowRight = function(event) {
//           var rect = select.getSelectionRect();
//           if (rect.left + rect.width < select.rect.width) {
//             rect.left = rect.left + rect.width;
//             rect.width = 1;
//             rect.height = 1;
//             select.select(rect);
//           }
//         };
//       }
//
//       field.onFocus();
//
//       this.children = [
//         {
//           class: "field-controls",
//           child: {
//             class: "field-controls-group",
//             children: [
//               {
//                 tag: "button",
//                 child: KarmaFieldsAlpha.includes.icon(KarmaFieldsAlpha.icons_url+"/table-row-before.svg"),
//                 init: function() {
//                   this.element.addEventListener("click", function(event) {
//                     event.preventDefault();
//                     var rect = select.getSelectionRect();
//                     if (rect.height) {
//                       select.selectionRect.top++;
//                       gridManager.addRow(rect.top);
//                     } else {
//                       gridManager.addRow(0);
//                     }
//                     grid.render();
//                   });
//                   this.element.addEventListener("mouseup", function(event) {
//                     event.stopPropagation();
//                   });
//                 }
//               },
//               {
//                 tag: "button",
//                 child: KarmaFieldsAlpha.includes.icon(KarmaFieldsAlpha.icons_url+"/table-row-after.svg"),
//                 init: function() {
//                   this.element.addEventListener("click", function(event) {
//                     event.preventDefault();
//                     var rect = select.getSelectionRect();
//                     if (rect.height) {
//                       gridManager.addRow(rect.top+rect.height);
//                     } else {
//                       gridManager.addRow(select.rect.height);
//                     }
//                   });
//                   this.element.addEventListener("mouseup", function(event) {
//                     event.stopPropagation();
//                   });
//                 }
//               },
//               {
//                 tag: "button",
//                 child: KarmaFieldsAlpha.includes.icon(KarmaFieldsAlpha.icons_url+"/table-col-before.svg"),
//                 init: function() {
//                   this.element.addEventListener("click", function(event) {
//                     event.preventDefault();
//                     var rect = select.getSelectionRect();
//                     if (rect.width) {
//                       select.selectionRect.left++;
//                       gridManager.addCol(rect.left);
//                     } else {
//                       gridManager.addCol(0);
//                     }
//                   });
//                   this.element.addEventListener("mouseup", function(event) {
//                     event.stopPropagation();
//                   });
//                 }
//               },
//               {
//                 tag: "button",
//                 child: KarmaFieldsAlpha.includes.icon(KarmaFieldsAlpha.icons_url+"/table-col-after.svg"),
//                 init: function() {
//                   this.element.addEventListener("click", function(event) {
//                     event.preventDefault();
//                     var rect = select.getSelectionRect();
//                     if (rect.width) {
//                       gridManager.addCol(rect.left+rect.width);
//                     } else {
//                       gridManager.addCol(select.rect.width);
//                     }
//                   });
//                   this.element.addEventListener("mouseup", function(event) {
//                     event.stopPropagation();
//                   });
//                 }
//               },
//               {
//                 tag: "button",
//                 child: KarmaFieldsAlpha.includes.icon(KarmaFieldsAlpha.icons_url+"/table-row-delete.svg"),
//                 init: function() {
//                   this.element.addEventListener("click", function(event) {
//                     event.preventDefault();
//                     var rect = select.getSelectionRect();
//                     if (rect.height) {
//                       var rows = [];
//                       for (var i = 0; i < rect.height; i++) {
//                         rows.push(rect.top + i);
//                       }
//                       gridManager.deleteRows(rows);
//                     }
//                   });
//                   this.element.addEventListener("mouseup", function(event) {
//                     event.stopPropagation();
//                   });
//                 }
//               },
//               {
//                 tag: "button",
//                 child: KarmaFieldsAlpha.includes.icon(KarmaFieldsAlpha.icons_url+"/table-col-delete.svg"),
//                 init: function() {
//                   this.element.addEventListener("click", function(event) {
//                     event.preventDefault();
//                     var rect = select.getSelectionRect();
//                     if (rect.width) {
//                       var cols = [];
//                       for (var i = 0; i < rect.width; i++) {
//                         cols.push(rect.left + i);
//                       }
//                       gridManager.deleteCols(cols);
//                     }
//                   });
//                   this.element.addEventListener("mouseup", function(event) {
//                     event.stopPropagation();
//                   });
//                 }
//               }
//             ]
//           }
//         },
//         {
//           tag: "table",
//           class: "grid",
//           child: {
//             tag: "tbody",
//             init: function() {
//               field.fetchValue().then(function(value) {
//                 if (!value && field.resource.default) {
//                   field.setValue(field.resource.default);
// 								}
//                 grid.render();
//               });
//             },
//             update: function() {
//               select.init();
//               var value = gridManager.getValue();
//               this.children = value.map(function(cols, y) {
//                 return {
//                   tag: "tr",
//                   update: function() {
//                     this.children = cols.map(function(cell, x) {
//                       return {
//                         tag: "td",
//                         init: function() {
//                           this.element.addEventListener("mousedown", function(event) {
//                             select.onCellMouseDown(x, y);
//                           });
//                           this.element.addEventListener("mousemove", function() {
//                             select.onCellMouseMove(x, y);
//                           });
//                           this.element.addEventListener("mouseup", function(event) {
//                             select.onCellMouseUp(x, y);
//                             event.stopPropagation();
//                           });
//                         },
//                         update: function(cell) {
//                           var cellField = field.createChild({
//                             field: "textinput",
//                             // driver: "postmetaobject",
//                             child_keys: [y, x],
//                           });
//                           cellField.events.render = function() {
//                             cell.render();
//                           };
//                           this.child = cellField.buildSingle();
//                           select.addField(x, y, this.element, cellField);
//                         }
//                       }
//                     });
//                   }
//                 }
//               });
//             }
//           }
//         }
//       ];
//     },
//   };
// }
