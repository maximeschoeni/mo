
KarmaFieldsAlpha.fields.array = class extends KarmaFieldsAlpha.fields.field {

  initField() {
    // this.registerType("json");


    this.resource.columns = (this.resource.columns || []).map(column => typeof column === "string" && {type: column} || column);
	}

  fetchArray(...path) {
    return this.fetchValue("array", ...path);
  }

  async fetchValue(expectedType, ...path) {

    let array = await super.fetchValue("array") || [];

    if (path.length) {
      array = KarmaFieldsAlpha.DeepObject.get(array, ...path);
      array = this.format(array, expectedType);
    }

    return array;
  }

  async setValue(value, ...path) {

    if (path.length) {
      let array = await super.fetchValue("array") || [];


      KarmaFieldsAlpha.DeepObject.assign(array, value, ...path);
  		return super.setValue(array);
		}
    return super.setValue(value);
  }

  backup(...path) {
    return super.backup();
  }

  async * columnFields(rowField) {

    let index = 0;

    yield rowField[index++];

	}

  async * columnFieldIndex(index = 0) {

    yield index++;

	}


  async edit(hard) {

    await super.edit();

    // await this.render(hard);
  }

  async submit() {
    await this.render(true);
  }

  hasUniqueColumn() {
    if (this.resource.unique !== undefined) {
      return this.resource.unique;
    } else {
      return this.resource.columns.filter(function(column) {
        return (column.type === "value" || !column.type) && column.field && column.field.key;
      }).length === 1;
    }
  }


  // getColumns() {
  //   if (!this.columns) {
  //     this.columns = (this.resource.columns || []).slice();
  //     if (this.resource.index && !this.resource.columns.some(column => column.type === "index")) {
  //       this.columns.unshift({
  //         type: "index",
  //         width: "30px"
  //       });
  //     }
  //     if (!this.resource.columns.some(column => column.type === "delete")) {
  //       this.columns.push({
  //         type: "delete",
  //         width: "50px"
  //       });
  //     }
  //   }
  //   return this.columns;
  //   // return (this.resource.columns || []).filter(column => column.field);
  // }
  //
  // hasHeader() {
  //   return this.getColumns().some(column => column.header);
  // }
  //
  // hasIndex() {
  //   return true;
  // }
  //
  // hasDelete() {
  //   return true;
  // }

  async swap(index1, index2) {
    const values = await this.fetchArray();
    const item1 = values[index1];
    values[index1] = values[index2];
    values[index2] = item1;
    return this.setValue(values);
  }

  async delete(rowIndex) {
    const values = await this.fetchArray();
    values.splice(rowIndex, 1);
    return this.setValue(values);
  }

  async add() {
    const values = await this.fetchArray();
    values.push({});
    return this.setValue(values);
  }

  // buildContent(values) {
  //   return [
  //     {
  //       class:"array-table-container",
  //       update: container => {
  //         container.child = {
  //           class: "array",
  //           init: table => {
  //             this.manager = new KarmaFieldsAlpha.Orderer(table.element);
  //
  //             this.manager.events.change = async (index, originalIndex) => {
  //               await this.swap(index, originalIndex);
  //               return super.edit();
  //             }
  //             if (this.resource.gridTemplateRows) {
  //               table.element.style.gridTemplateRows = this.resource.gridTemplateRows;
  //             }
  //             if (this.resource.gridAutoRows) {
  //               table.element.style.gridAutoRows = this.resource.gridAutoRows;
  //             }
  //           },
  //           update: table => {
  //             table.children = [];
  //
  //             // CSS Grid Layout
  //             table.element.style.gridTemplateColumns = this.resource.columns.map(column => column.width || "auto").join(" ");
  //
  //             // Header
  //             if (this.resource.columns.some(column => column.header)) {
  //               this.resource.columns.forEach(column => {
  //                 table.children.push({
  //                   class: "th",
  //                   init: th => {
  //                     th.element.textContent = column.header || "";
  //                   }
  //                 });
  //               });
  //             }
  //
  //             // Body
  //
  //             if (values.length) {
  //
  //               values.forEach((value, rowIndex) => {
  //
  //                 const rowField = this.getChild(rowIndex.toString()) || this.createChild({
  //                   key: rowIndex.toString(),
  //                   type: "container"
  //                 });
  //
  //                 let fieldIndex = 0;
  //
  //                 // let colIndex = 0;
  //                 //
  //                 // if (this.hasIndex()) {
  //                 //
  //                 //   table.children.push({
  //                 //     class: "td array-index",
  //                 //     init: td => {
  //                 //       this.manager.registerItem(td.element, 0, rowIndex, "index");
  //                 //     },
  //                 //     update: td => {
  //                 //       td.element.textContent = rowIndex+1;
  //                 //     }
  //                 //   });
  //                 //
  //                 //   colIndex++;
  //                 // }
  //
  //                 this.resource.columns.forEach((column, colIndex) => {
  //
  //                   if (column.type === "index") {
  //
  //                     table.children.push({
  //                       class: "td array-index",
  //                       init: td => {
  //                         this.manager.registerItem(td.element, 0, rowIndex, "index");
  //                         if (column.style) {
  //                           td.element.style = column.style;
  //                         }
  //                       },
  //                       update: td => {
  //                         td.element.textContent = rowIndex+1;
  //                       }
  //                     });
  //
  //                   } else if (column.type === "delete") {
  //
  //                     table.children.push({
  //                       class: "td array-delete",
  //                       init: td => {
  //                         this.manager.registerItem(td.element, colIndex, rowIndex, "delete");
  //                         if (column.style) {
  //                           td.element.style = column.style;
  //                         }
  //                       },
  //                       child: {
  //                         tag: "button",
  //                         class: "karma-button",
  //                         init: button => {
  //                           button.element.onclick = async (event) => {
  //                             event.preventDefault();
  //                             this.backup();
  //                             button.element.classList.add("loading");
  //                             await this.delete(rowIndex);
  //                             await this.edit();
  //                             await this.render();
  //                             button.element.classList.remove("loading");
  //
  //                           };
  //                           button.element.innerHTML = '<span>'+(this.resource.delete_button_name || "Delete")+'</span>';
  //                         }
  //                       }
  //                     });
  //
  //
  //                   } else if (column.field) {
  //
  //                     const cellField = rowField.children[fieldIndex] || rowField.createChild(column.field);
  //
  //                     table.children.push({
  //                       class: "td array-cell karma-field-frame",
  //                       init: td => {
  //                         this.manager.registerItem(td.element, colIndex, rowIndex, "field");
  //                         if (column.style) {
  //                           td.element.style = column.style;
  //                         }
  //                       },
  //                       update: async td => {
  //
  //                         if (column.condition) {
  //
  //                 					const match = await cellField.match(column.condition);
  //                 					td.element.classList.toggle("hidden", !match);
  //                 				}
  //                       },
  //                       child: cellField.build()
  //                     });
  //
  //                     fieldIndex++;
  //
  //                   }
  //
  //                 });
  //
  //               });
  //             }
  //             table.children.push({
  //               class:"array-more",
  //               child: {
  //                 tag: "button",
  //                 class: "button",
  //                 init: button => {
  //                   button.element.innerHTML = '<span>'+(this.resource.add_button_name || "Add Row")+'</span>';
  //                   button.element.onclick = async (event) => {
  //                     event.preventDefault();
  //                     // debugger;
  //
  //                     this.backup();
  //                     button.element.classList.add("loading");
  //                     await this.add();
  //                     await this.render(true);
  //                     await this.edit();
  //                     button.element.classList.remove("loading");
  //
  //                   };
  //                 }
  //               }
  //             });
  //
  //
  //
  //           }
  //         };
  //       }
  //     }
  //   ];
  // }


  build() {
    return {
      class: "array",
      init: table => {
        this.render = table.render;

        this.manager = new KarmaFieldsAlpha.Orderer(table.element);

        this.manager.events.change = async (index, originalIndex) => {
          await this.swap(index, originalIndex);
          await this.edit();
        }
        // if (this.resource.gridTemplateRows) {
        //   table.element.style.gridTemplateRows = this.resource.gridTemplateRows;
        // }
        // if (this.resource.gridAutoRows) {
        //   table.element.style.gridAutoRows = this.resource.gridAutoRows;
        // }
      },
      update: async table => {
        const values = await this.fetchArray();

        table.children = [];

        // CSS Grid Layout
        table.element.style.gridTemplateColumns = this.resource.columns.map(column => {
          return column.width || column.type === "index" && "100px" || "auto";
        }).join(" ");

        // Header
        if (values.length && this.resource.columns.some(column => column.header)) {

          for (let column of this.resource.columns) {

            table.children.push({
              class: "th",
              init: th => {
                th.element.textContent = column.header || "";
              }
            });

          }

        }

        // Body


        if (values.length) {

          // values.forEach((value, rowIndex) => {

          for (const [rowIndex, value] of values.entries()) {

            const rowField = this.getChild(rowIndex.toString()) || this.createChild({
              key: rowIndex.toString(),
              type: "container"
            });

            const columnFields = this.columnFields(rowField);
            const columnFieldIndex = this.columnFieldIndex();

            // this.resource.columns.forEach((column, colIndex) => {

            for (const [colIndex, column] of this.resource.columns.entries()) {

              if (column.type === "index") {

                table.children.push({
                  class: "td array-index",
                  init: td => {
                    this.manager.registerItem(td.element, 0, rowIndex, "index");
                    if (column.style) {
                      td.element.style = column.style;
                    }

                  },
                  update: td => {
                    td.element.textContent = rowIndex+1;
                  }
                });

              } else if (column.type === "delete") {

                table.children.push({
                  class: "td array-delete",
                  init: td => {
                    this.manager.registerItem(td.element, colIndex, rowIndex, "delete");
                    if (column.style) {
                      td.element.style = column.style;
                    }
                  },
                  child: {
                    tag: "button",
                    class: "karma-button",
                    init: button => {
                      button.element.onclick = async (event) => {
                        event.preventDefault();
                        await this.backup();
                        button.element.classList.add("loading");
                        await this.delete(rowIndex);
                        await this.edit();
                        // await this.render(true);
                        await this.submit();
                        button.element.classList.remove("loading");

                      };
                      button.element.innerHTML = '<span>'+(this.resource.delete_button_name || "Delete")+'</span>';
                    }
                  }
                });

              } else if (column.field) {

                // const cellField = rowField.children[fieldIndex] || rowField.createChild(column.field);

                const fieldIndex = columnFieldIndex.next().value;
                const cellField = rowField.children[fieldIndex] || rowField.createChild(column.field);

                let match = !column.condition || await cellField.match(column.condition);

                if (match) {

                  table.children.push({
                    class: "td array-cell karma-field-frame karma-field-"+column.field.type,
                    init: td => {
                      this.manager.registerItem(td.element, fieldIndex, rowIndex, "field");
                      if (column.style) {
                        td.element.style = column.style;
                      }
                    },
                    update: async td => {

                      // if (column.condition) {
                      //
                      //   const match = await cellField.match(column.condition);
                      //   td.element.classList.toggle("hidden", !match);
                      // }
                    },
                    child: cellField.build()
                  });


                }

              }

            }

            // rowIndex++;
          }
        }
        table.children.push({
          class:"array-more",
          child: {
            tag: "button",
            class: "button",
            init: button => {
              button.element.innerHTML = '<span>'+(this.resource.add_button_name || "Add Row")+'</span>';
              button.element.onclick = async (event) => {
                event.preventDefault();

                await this.backup();
                button.element.classList.add("loading");

                await this.add();
                // await this.render(true);
                await this.edit();
                await this.submit();
                button.element.classList.remove("loading");

              };
            }
          }
        });



      }
    };
  }



  // build() {
  //   return {
  //     class: "karma-field-array",
  //     init: container => {
  //       this.render = container.render;
  //     },
  //     update: async container => {
  //       const values = await this.fetchArray();
  //       container.children = this.buildContent(values);
  //
  //
  //     }
  //   };
  // }



}


// KarmaFieldsAlpha.fields.arrayRow = class extends KarmaFieldsAlpha.fields.container {
//
//   async getValueAsync() {
// 		const values = await Promise.all(this.children.map(child => child.getValueAsync()));
//     return values.reduce((acc, value, index) => {
//       const child = this.children[index];
//       acc[child.resource.key] = value;
//       return acc;
//     }, {});
// 	}
//
//   create(columns) {
//     columns.forEach(column => {
//       if (column.field) {
//         this.createChild(column.field);
//       }
//     });
//   }
//
// }



KarmaFieldsAlpha.Orderer = class {

  constructor(element) {
    const manager = this;

    this.numRow = 0;
    this.map = new Map();
    this.events = {};

    element.onmousedown = function(event) {
      if (event.button === 0) {
        let target = event.target.closest(".array > *");
        let cell = manager.map.get(target);
        if (cell && cell.type === "index") {
          manager.startDrag(cell, target, event, element);
        }
      }
    }
  }

  trigger(eventName, ...params) {
    if (this.events[eventName]) {
      this.events[eventName].call(this, ...params)
    }
  }

  registerItem(element, col, row, type) {
    this.map.set(element, {
      col: col,
      row: row,
      type: type
    });
    this.numRow = Math.max(row+1, this.numRow);
  }

  // -> ordering
  getRow(index) {
    let row = [];
    this.map.forEach(function(value, key) {
      if (value.row === index) {
        row.push(key);
      }
    });
    return row;
  }

  insertBefore(row, prevRow) {
    const manager = this;
    row.forEach(function(cell) {
      // console.log(cell, prevRow[0]);
      cell.parentNode.insertBefore(cell, prevRow[0]);
      manager.map.get(cell).row--;
    });
    prevRow.forEach(function(cell) {
      manager.map.get(cell).row++;
    });
  }

  insertAfter(row, nextRow) {
    const manager = this;
    row.forEach(function(cell) {
      manager.map.get(cell).row++;
    });
    nextRow.forEach(function(cell) {
      cell.parentNode.insertBefore(cell, row[0]);
      manager.map.get(cell).row--;
    });
  }

  // -> ordering
  startDrag(item, targetElement, event, arrayElement) {
    const manager = this;
    const originalIndex = item.row;
    let row = manager.getRow(item.row);
    let mouseX = event.clientX;
    let mouseY = event.clientY;

    let mousemove = function(event) {
      let diffX = event.clientX - mouseX;
      let diffY = event.clientY - mouseY;
      let prevRow;
      let nextRow;

      if (item.row > 0) {
        prevRow = manager.getRow(item.row-1);
      }
      if (item.row < manager.numRow-1) {
        nextRow = manager.getRow(item.row+1);
      }

      if (prevRow && diffY < -prevRow[0].clientHeight/2) {
        manager.insertBefore(row, prevRow);
        mouseY -= prevRow[0].clientHeight;
        diffY = event.clientY - mouseY;
      }
      if (nextRow && diffY > nextRow[0].clientHeight/2) {
        manager.insertAfter(row, nextRow);
        mouseY += nextRow[0].clientHeight;
        diffY = event.clientY - mouseY;
      }
      row.forEach(function(cell) {
        cell.style.transform = "translate("+diffX+"px, "+diffY+"px)";
      });
    };
    let mouseup = function() {
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
      row.forEach(function(cell) {
        cell.style.transform = "none";
      });
      if (item.row !== originalIndex) {
        setTimeout(function() {
          manager.trigger("change", item.row, originalIndex);
        }, 200);
      }

      targetElement.classList.remove("grabbing");
      arrayElement.classList.remove("dragging");
      row.forEach(function(cell) {
        cell.classList.remove("drag");
      });
    };

    targetElement.classList.add("grabbing");
    arrayElement.classList.add("dragging");
    row.forEach(function(cell) {
      cell.classList.add("drag");
    });
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
  }


}
