
KarmaFieldsAlpha.field.tableGrid = class extends KarmaFieldsAlpha.field.table {

  async request(subject, content, ...path) {

    switch (subject) {

      case "export-cells":
        return this.exportCells(content.rectangle);

      case "import-cells":
        await this.importCells(content.data, content.rectangle);
        break;

      default:
        return super.request(subject, content, ...path);

    }

  }

  isModalOpen() {
    return Boolean(this.resource.modal && (this.resource.modal.keepAlive || this.interface.selectionBuffer.get()));
  }

  async exportCells(rectangle) {

    const data = [];
    const colIndexes = this.getColumns();
    const ids = this.getIds();

    const selectedIds = ids.slice(rectangle.y, rectangle.y + rectangle.height);
    const selectedCols = colIndexes.slice(rectangle.x, rectangle.x + rectangle.width);

    for (let id of selectedIds) {

      const rowField = this.interface.createChild({
        ...this.resource.children,
        key: id,
        type: "row"
      }, id);

      const cols = [];

      for (let index of selectedCols) {

        const field = rowField.createChild(this.resource.children[index], index.toString());
        const value = await field.exportValue();
        cols.push(value || "");

      }

      data.push(cols);

    }

    return data;
  }

  // -> cell selection
  async importCells(data, rectangle) {

    const colIndexes = this.getColumns();
    const ids = this.getIds();

    const selectedIds = ids.slice(rectangle.y, rectangle.y + rectangle.height);
    const selectedCols = colIndexes.slice(rectangle.x, rectangle.x + rectangle.width);



    for (let j = 0; j < selectedIds.length; j++) {

      const id = selectedIds[j];
      const row = data[j%data.length] || [""];

      const rowField = this.interface.createChild({
        ...this.resource.children,
        key: id,
        type: "row"
      }, id);

      for (let i = 0; i < selectedCols.length; i++) {

        const index = selectedCols[i];
        const cell = row[i%row.length];

        const field = rowField.createChild(this.resource.children[index], index.toString());
        await field.importValue(cell);

      }

    }

  }

  // buildContent() {
  //
  //   return {
  //     class: "table grid",
  //     init: async grid => {
  //       if (this.resource.style) {
  //         grid.element.style = this.resource.style;
  //       }
  //     },
  //     update: async grid => {
  //
  //       let ids = this.getIds();
  //       const page = this.getPage();
  //       const ppp = this.getPpp();
  //       const offset = (page - 1)*ppp;
  //       const columns = this.getColumns();
  //
  //       this.clipboard.onInput = dataArray => {
  //         const data = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
  //         this.parent.request("import", {data: data});
  //       }
  //
  //       this.cellClipboard.onInput = async dataArray => {
  //         if (this.cellSelection) {
  //           KarmaFieldsAlpha.History.save();
  //           await this.importCells(dataArray, this.cellSelection);
  //           await this.render();
  //         }
  //       }
  //
  //       this.clipboard.ta.onfocus = event => {
  //         grid.element.classList.add("ta-focus");
  //       }
  //
  //       this.clipboard.ta.onblur = event => {
  //         grid.element.classList.remove("ta-focus");
  //       }
  //
  //       this.cellClipboard.ta.onblur = event => {
  //         if (this.cellSelection) {
  //           const cellManager = new KarmaFieldsAlpha.CellManager(grid.element, columns.length, ids.length, 0, 1);
  //           cellManager.selection = this.cellSelection;
  //           cellManager.unselect();
  //         }
  //       }
  //
  //       const selection = this.selectionBuffer.get() || {};
  //
  //       if (ids.length) {
  //         grid.element.classList.add("filled"); // -> draw table borders
  //         grid.children = [
  //           ...columns.map((colId, colIndex) => {
  //             const child = this.resource.children[colId];
  //             return {
  //               class: "th table-header-cell",
  //               init: th => {
  //                 if (child.style) {
  //                   th.element.style = child.style;
  //                 }
  //                 th.element.tabIndex = -1;
  //               },
  //               update: th => {
  //                 th.children = [
  //                   {
  //                     tag: "a",
  //                     class: "header-cell-title",
  //                     init: a => {
  //                       a.element.textContent = child.label;
  //                     }
  //                   },
  //                   {
  //                     tag: "a",
  //                     class: "header-cell-order",
  //                     child: {
  //                       tag: "span",
  //                       class: "dashicons",
  //                       update: span => {
  //                         const order = KarmaFieldsAlpha.Nav.get("order") || this.params.order;
  //                         const orderby = KarmaFieldsAlpha.Nav.get("orderby") || this.params.orderby;
  //                         const isAsc = orderby === (child.orderby || child.key) && order === "asc";
  //                         const isDesc = orderby === (child.orderby || child.key) && order === "desc";
  //                         span.element.classList.toggle("dashicons-arrow-up", isAsc);
  //                         span.element.classList.toggle("dashicons-arrow-down", isDesc);
  //                         span.element.classList.toggle("dashicons-leftright", !isAsc && !isDesc);
  //                       }
  //                     },
  //                     update: a => {
  //                       a.element.classList.toggle("hidden", !child.sortable);
  //                       if (child.sortable) {
  //                         a.element.onclick = async event => {
  //                           event.preventDefault();
  //                           a.element.parentNode.classList.add("loading");
  //                           KarmaFieldsAlpha.History.save();
  //                           this.toggleOrder(this.resource.orderby || this.resource.key, this.resource.order);
  //                           this.interface.selectionBuffer.change(null);
  //                           await this.queryIds();
  //                           await this.render();
  //                           a.element.parentNode.classList.remove("loading");
  //                         };
  //                       }
  //                     }
  //                   }
  //                 ];
  //                 if (child.sortable) {
  //                   th.children.push(this.createChild({
  //                     type: "sorter",
  //                     id: "sorter-"+(child.orderby || child.key),
  //                     key: child.orderby || child.key,
  //                     order: child.order
  //                   }).build());
  //                 }
  //
  //                 th.element.onmousedown = async event => {
  //                   if (event.buttons === 1) {
  //                     const cellManager = new KarmaFieldsAlpha.CellManager(grid.element, columns.length, ids.length, 0, 1);
  //                     cellManager.selection = this.cellSelection;
  //                     cellManager.onSelect = async selection => {
  //                       this.cellSelection = selection;
  //                       const dataArray = await this.exportCells(selection);
  //                       this.cellClipboard.setData(dataArray);
  //                       this.cellClipboard.focus();
  //                     };
  //                     cellManager.selectHeaders(event, colIndex);
  //                   }
  //                 }
  //
  //               }
  //             };
  //           }),
  //           ...ids.reduce((children, id, rowIndex) => {
  //
  //             const row = this.createChild({
  //               key: id,
  //               type: "row",
  //               children: this.resource.children || []
  //             }, id.toString());
  //
  //             row.index = offset + rowIndex + 1;
  //             row.isSelected = KarmaFieldsAlpha.Segment.contain(selection, rowIndex);
  //             row.rowIndex = rowIndex;
  //
  //             const isSelected = KarmaFieldsAlpha.Segment.contain(selection, rowIndex);
  //
  //             return [
  //               ...children,
  //               ...columns.map((colId, colIndex) => {
  //                 const child = this.resource.children[colId];
  //                 const field = row.createChild(child, colId.toString());
  //
  //                 return {
  //                   class: "td table-cell",
  //                   init: td => {
  //                     if (child.style) {
  //                       td.element.style = child.style;
  //                     }
  //                     td.element.tabIndex = -1;
  //                   },
  //                   update: td => {
  //
  //                     td.element.classList.toggle("selected", isSelected);
  //
  //                     td.element.onmousedown = async event => {
  //
  //                       if (event.buttons === 1) {
  //
  //                         const cellManager = new KarmaFieldsAlpha.CellManager(td.element.parentNode, columns.length, ids.length, 0, 1);
  //                         const selectionManager = new KarmaFieldsAlpha.SelectionManager(td.element.parentNode, columns.length, ids.length, 0, 1);
  //
  //                         cellManager.selection = this.cellSelection;
  //                         selectionManager.selection = this.selectionBuffer.get();
  //
  //                         if (field.selectMode !== "row") {
  //
  //                           cellManager.onSelect = async selection => {
  //                             this.cellSelection = selection;
  //                             const dataArray = await this.exportCells(selection);
  //                             this.cellClipboard.setData(dataArray);
  //                             this.cellClipboard.focus();
  //                           };
  //
  //                           cellManager.selectCells(event, colIndex, rowIndex);
  //
  //                         } else {
  //
  //                           cellManager.clear();
  //
  //                           selectionManager.onSelect = async selection => {
  //                             KarmaFieldsAlpha.History.save();
  //                             this.selectionBuffer.change(selection);
  //                             const data = await this.export();
  //                             this.clipboard.setJson(data);
  //                             this.clipboard.focus();
  //                             await this.render();
  //                           };
  //
  //                           selectionManager.select(event, colIndex, rowIndex);
  //
  //                         }
  //
  //                       }
  //
  //                     }
  //
  //                   },
  //                   child: field.build()
  //                 };
  //               })
  //             ];
  //           }, [])
  //         ];
  //
  //         grid.element.style.gridTemplateColumns = columns.map(index => this.resource.children[index].width || "auto").join(" ");
  //
  //       } else {
  //         grid.children = [];
  //         grid.element.classList.remove("filled");
  //       }
  //     },
  //     complete: async grid => {
  //       if (document.activeElement === document.body && this.getSelection()) {
  //         const data = await this.parent.request("export");
  //         this.clipboard.setJson(data);
  //       }
  //     }
  //   };
  // }


  static interface = class extends KarmaFieldsAlpha.field.table.interface {

    constructor(...args) {
      super(...args);

      // this.clipboard = new KarmaFieldsAlpha.Clipboard();
      // this.cellClipboard = new KarmaFieldsAlpha.Clipboard();

      this.selectionBuffer = new KarmaFieldsAlpha.Buffer("state", this.resource.context, "selection");

      this.clipboard = this.createChild("clipboard");
      this.cellClipboard = this.createChild("clipboard");

    }

    async release() {
      // const selection = this.selectionBuffer.get();
      //
      // if (selection) {
      //   KarmaFieldsAlpha.History.save();
      //   this.selectionBuffer.change(null);
      //   await this.parent.request("render");
      // }
      //
      // this.clipboard.set("");
    }

    build() {

      return {
        class: "karma-field-table-grid-container karma-field-frame karma-field-group final",
        init: body => {
          body.element.tabIndex = -1;
          body.element.onfocus = async event => {
            const selection = this.selectionBuffer.get();
            if (selection) {
              KarmaFieldsAlpha.History.save();
              this.selectionBuffer.change(null);
              await this.parent.request("render");
            }
            this.clipboard.output("");
            this.clipboard.focus();
          }
        },
        children: [
          this.cellClipboard.build(),
          this.clipboard.build(),
          {
            class: "table grid",
            init: async grid => {
              if (this.resource.style) {
                grid.element.style = this.resource.style;
              }
            },
            update: async grid => {

              const ids = await this.parent.request("ids");
              const page = await this.parent.request("page");
              const ppp = await this.parent.request("ppp");
              const offset = (page - 1)*ppp;
              const columns = await this.parent.request("columns");

              this.clipboard.onInput = value => {
                const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
                const data = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
                this.parent.request("import", {data: data});
              }

              this.cellClipboard.onInput = async dataArray => {
                if (this.cellSelection) {
                  KarmaFieldsAlpha.History.save();
                  const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
                  await this.parent.request("import-cells", {data: dataArray, rectangle: this.cellSelection});
                  await this.parent.request("render");
                }
              }

              // this.clipboard.ta.onfocus = event => {
              //   grid.element.classList.add("ta-focus");
              // }
              //
              // this.clipboard.ta.onblur = event => {
              //   grid.element.classList.remove("ta-focus");
              // }

              this.cellClipboard.onBlur = event => {
                if (this.cellSelection) {
                  const cellManager = new KarmaFieldsAlpha.CellManager(grid.element, columns.length, ids.length, 0, 1);
                  cellManager.selection = this.cellSelection;
                  cellManager.clear();
                  console.log("clear");
                }
              }

              const selection = this.selectionBuffer.get();

              if (ids.length) {
                grid.element.classList.add("filled"); // -> draw table borders
                grid.children = [
                  ...columns.map((colId, colIndex) => {
                    const child = this.resource.children[colId];
                    return {
                      class: "th table-header-cell",
                      init: th => {
                        if (child.style) {
                          th.element.style = child.style;
                        }
                        th.element.tabIndex = -1;
                      },
                      update: th => {
                        th.children = [
                          {
                            tag: "a",
                            class: "header-cell-title",
                            init: a => {
                              a.element.textContent = child.label;
                            }
                          },
                          {
                            tag: "a",
                            class: "header-cell-order",
                            child: {
                              tag: "span",
                              class: "dashicons",
                              update: async span => {
                                const order = await this.parent.request("order");
                                const orderby = await this.parent.request("orderby");
                                const isAsc = orderby === (child.orderby || child.key) && order === "asc";
                                const isDesc = orderby === (child.orderby || child.key) && order === "desc";
                                span.element.classList.toggle("dashicons-arrow-up", isAsc);
                                span.element.classList.toggle("dashicons-arrow-down", isDesc);
                                span.element.classList.toggle("dashicons-leftright", !isAsc && !isDesc);
                              }
                            },
                            update: a => {
                              a.element.classList.toggle("hidden", !child.sortable);
                              if (child.sortable) {
                                a.element.onmousedown = event => {
                                  event.stopPropagation(); // -> prevent header selection
                                }
                                a.element.onclick = async event => {
                                  event.preventDefault();
                                  a.element.parentNode.classList.add("loading");
                                  await this.parent.request("toggle-order", {key: child.orderby || child.key, order: child.order});
                                  a.element.parentNode.classList.remove("loading");
                                };
                              }
                            }
                          }
                        ];

                        th.element.onmousedown = async event => {
                          if (event.buttons === 1) {
                            const cellManager = new KarmaFieldsAlpha.CellManager(grid.element, columns.length, ids.length, 0, 1);
                            cellManager.selection = this.cellSelection;
                            cellManager.onSelect = async selection => {
                              this.cellSelection = selection;
                              const dataArray = await this.parent.request("export-cells", {rectangle: selection});
                              const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                              this.cellClipboard.output(value);
                              this.cellClipboard.focus();
                            };
                            cellManager.selectHeaders(event, colIndex);
                          }
                        }

                      }
                    };
                  }),
                  ...ids.reduce((children, id, rowIndex) => {

                    const row = this.createChild({
                      key: id,
                      type: "row",
                      children: this.resource.children || []
                    });

                    const isSelected = selection && KarmaFieldsAlpha.Segment.contain(selection, rowIndex);

                    row.index = offset + rowIndex + 1;
                    row.isSelected = isSelected;
                    row.rowIndex = rowIndex;

                    return [
                      ...children,
                      ...columns.map((colId, colIndex) => {
                        const child = this.resource.children[colId];
                        const field = row.createChild(child);
                        return {
                          class: "td table-cell",
                          init: td => {
                            if (child.style) {
                              td.element.style = child.style;
                            }
                            td.element.tabIndex = -1;
                          },
                          update: td => {
                            td.element.classList.add("loading");
                            td.element.classList.toggle("selected", Boolean(isSelected));
                            td.element.onmousedown = async event => {

                              if (event.buttons === 1) {

                                const cellManager = new KarmaFieldsAlpha.CellManager(grid.element, columns.length, ids.length, 0, 1);
                                const selectionManager = new KarmaFieldsAlpha.SelectionManager(grid.element, columns.length, ids.length, 0, 1);

                                cellManager.selection = this.cellSelection;
                                selectionManager.selection = this.selectionBuffer.get();

                                if (field.resource.selectMode !== "row") {

                                  cellManager.onSelect = async selection => {

                                    this.cellSelection = selection;

                                    if (selection.width*selection.height > 1) {

                                      const dataArray = await this.parent.request("export-cells", {rectangle: selection});
                                      const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                                      this.cellClipboard.output(value);
                                      this.cellClipboard.focus();

                                    } else {

                                      cellManager.clear(selection);

                                    }


                                  };

                                  cellManager.selectCells(event, colIndex, rowIndex);

                                } else {

                                  cellManager.clear();

                                  selectionManager.onSelect = async (selection, hasChange) => {
                                    if (hasChange) {
                                      KarmaFieldsAlpha.History.save();
                                      this.selectionBuffer.change(selection);
                                    }

                                    // const data = await this.export();
                                    const jsonData = await this.parent.request("export");
                                    const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                                    const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                                    this.clipboard.output(value);
                                    this.clipboard.focus();
                                    await this.parent.request("render");

                                  };

                                  selectionManager.select(event, colIndex, rowIndex);

                                }

                              }

                            }

                          },
                          complete: td => {
                            td.element.classList.remove("loading");
                          },
                          child: field.build()
                        };
                      })
                    ];
                  }, [])
                ];

                grid.element.style.gridTemplateColumns = columns.map(index => this.resource.children[index].width || "auto").join(" ");

              } else {
                grid.children = [];
                grid.element.classList.remove("filled");
              }
            },
            complete: async grid => {
              if (document.activeElement === document.body) {
                const jsonData = await this.parent.request("export");
                const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                this.clipboard.output(value);
                this.clipboard.focus();
              }
            }
          }
        ]
      }

    }

    // static clipboard = class extends KarmaFieldsAlpha.field {
    //
    //   onInput() {
    //     //noop
    //   }
    //
    //   output() {
    //     // noop
    //   }
    //
    //   onBlur() {
    //     // noop
    //   }
    //
    //   focus() {
    //     // noop
    //   }
    //
    //   build() {
    //     return {
    //       tag: "textarea",
    //       class: "clipboard",
    //       update: ta => {
    //         ta.element.onInput = event => {
    //           switch (event.inputType) {
    //             case "deleteByCut":
    //             case "deleteContentBackward":
    //             case "deleteContentForward":
    //             case "deleteContent":
    //             case "insertFromPaste": {
    //               // const dataArray = KarmaFieldsAlpha.Clipboard.parse(ta.element.value);
    //               // const data = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
    //               // return this.parent.request("import", {data: data});
    //               this.onInput(ta.element.value);
    //             }
    //           }
    //         };
    //         ta.element.onblur = event => {
    //           this.onBlur();
    //         };
    //         this.output = value => {
    //           ta.element.value = value;
    //         }
    //         this.focus = value => {
    //           ta.element.focus();
    //           ta.element.select();
    //         }
    //       }
    //     };
    //   }
    // }


    // static headerCell = class extends KarmaFieldsAlpha.field {
    //
    //   build() {
    //     return {
    //       class: "th table-header-cell",
    //       init: th => {
    //         if (this.resource.style) {
    //           th.element.style = this.resource.style;
    //         }
    //         th.element.tabIndex = -1;
    //       },
    //       update: th => {
    //         th.children = [
    //           {
    //             tag: "a",
    //             class: "header-cell-title",
    //             init: a => {
    //               a.element.textContent = this.resource.label;
    //             }
    //           },
    //           {
    //             tag: "a",
    //             class: "header-cell-order",
    //             child: {
    //               tag: "span",
    //               class: "dashicons",
    //               update: async span => {
    //                 const order = await this.parent.request("order");
    //                 const orderby = await this.parent.request("orderby");
    //                 const isAsc = orderby === (this.resource.orderby || this.resource.key) && order === "asc";
    //                 const isDesc = orderby === (this.resource.orderby || this.resource.key) && order === "desc";
    //                 span.element.classList.toggle("dashicons-arrow-up", isAsc);
    //                 span.element.classList.toggle("dashicons-arrow-down", isDesc);
    //                 span.element.classList.toggle("dashicons-leftright", !isAsc && !isDesc);
    //               }
    //             },
    //             update: a => {
    //               a.element.classList.toggle("hidden", !this.resource.sortable);
    //               if (this.resource.sortable) {
    //                 a.element.onmousedown = event => {
    //                   event.stopPropagation(); // -> prevent header selection
    //                 }
    //                 a.element.onclick = async event => {
    //                   event.preventDefault();
    //                   a.element.parentNode.classList.add("loading");
    //
    //                   await this.parent.request("toggle-order", {key: this.resource.orderby || this.resource.key, order: this.resource.order});
    //
    //                   a.element.parentNode.classList.remove("loading");
    //                 };
    //               }
    //             }
    //           }
    //         ];
    //
    //         th.element.onmousedown = async event => {
    //           if (event.buttons === 1) {
    //             const cellManager = new KarmaFieldsAlpha.CellManager(th.element.parentNode, this.resource.numCol, this.resource.numRow, 0, 1);
    //             cellManager.selection = this.cellSelection;
    //             cellManager.onSelect = async selection => {
    //               this.cellSelection = selection;
    //               // const dataArray = await this.exportCells(selection);
    //               const dataArray = await this.parent.request("export-cells", {rectangle: selection});
    //               const value = this.constructor.unparse(dataArray);
    //               this.cellClipboard.output(value);
    //               this.cellClipboard.focus();
    //             };
    //             cellManager.selectHeaders(event, this.resource.col);
    //           }
    //         }
    //
    //       }
    //     };
    //   }
    // }
    //
    // static cell = class extends KarmaFieldsAlpha.field.group {
    //
    //   selectCell(event, container, numCol, numRow, col, row, selectMode) {
    //
    //     const cellManager = new KarmaFieldsAlpha.CellManager(container, numCol, numRow, 0, 1);
    //     const selectionManager = new KarmaFieldsAlpha.SelectionManager(container, numCol, numRow, 0, 1);
    //
    //     cellManager.selection = this.cellSelection;
    //     selectionManager.selection = this.selectionBuffer.get();
    //
    //     if (selectMode !== "row") {
    //
    //       cellManager.onSelect = async selection => {
    //         this.cellSelection = selection;
    //
    //         const dataArray = await this.parent.request("export-cells", {rectangle: selection});
    //         const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
    //         this.cellClipboard.output(value);
    //         this.cellClipboard.focus();
    //       };
    //
    //       cellManager.selectCells(event, colIndex, rowIndex);
    //
    //     } else {
    //
    //       cellManager.clear();
    //
    //       selectionManager.onSelect = async (selection, hasChange) => {
    //         if (hasChange) {
    //           KarmaFieldsAlpha.History.save();
    //           this.selectionBuffer.change(selection);
    //         }
    //
    //         // const data = await this.export();
    //         const jsonData = await this.parent.request("export");
    //         const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
    //         const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
    //         this.clipboard.output(value);
    //         this.clipboard.focus();
    //         await this.parent.request("render");
    //       };
    //
    //       selectionManager.select(event, col, row);
    //
    //     }
    //
    //   }
    //
    //   build(container, childResource, numCol, numRow, col, row) {
    //     return {
    //       class: "td table-cell",
    //       init: td => {
    //         if (this.resource.style) {
    //           td.element.style = this.resource.style;
    //         }
    //         td.element.tabIndex = -1;
    //       },
    //       update: td => {
    //
    //         td.element.classList.add("loading");
    //
    //         td.element.classList.toggle("selected", Boolean(isSelected));
    //
    //         td.element.onmousedown = async event => {
    //
    //           if (event.buttons === 1) {
    //
    //             const cellManager = new KarmaFieldsAlpha.CellManager(this.container, this.resource.numCol, this.resource.numRow, 0, 1);
    //             const selectionManager = new KarmaFieldsAlpha.SelectionManager(this.container, this.resource.numCol, this.resource.numRow, 0, 1);
    //
    //             cellManager.selection = this.cellSelection;
    //             selectionManager.selection = this.selection;
    //
    //             if (this.selectMode !== "row") {
    //
    //               cellManager.onSelect = async selection => {
    //                 this.cellSelection = selection;
    //
    //                 const dataArray = await this.parent.request("export-cells", {rectangle: selection});
    //                 const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
    //                 this.cellClipboard.output(value);
    //                 this.cellClipboard.focus();
    //               };
    //
    //               cellManager.selectCells(event, colIndex, rowIndex);
    //
    //             } else {
    //
    //               cellManager.clear();
    //
    //               selectionManager.onSelect = async (selection, hasChange) => {
    //                 if (hasChange) {
    //                   KarmaFieldsAlpha.History.save();
    //                   this.selectionBuffer.change(selection);
    //                 }
    //
    //                 // const data = await this.export();
    //                 const jsonData = await this.parent.request("export");
    //                 const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
    //                 const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
    //                 this.clipboard.output(value);
    //                 this.clipboard.focus();
    //                 await this.parent.request("render");
    //               };
    //
    //               selectionManager.select(event, colIndex, rowIndex);
    //
    //             }
    //
    //           }
    //
    //         }
    //
    //       },
    //       complete: td => {
    //         td.element.classList.remove("loading");
    //       },
    //       child: this.createChild(this.resource.children[0]).build()
    //     };
    //   }
    // }



    // static row = class extends KarmaFieldsAlpha.field.group {
    //
    //
    //   // -> extends group instead.
    //
    //   async request(subject, content, ...path) {
    //
    //     switch (subject) {
    //
    //       case "index":
    //         return this.index;
    //
    //       default:
    //         return super.request(subject, content, ...path); // -> extends group
    //     }
    //
    //   }
    //
    //   static modalHandle = class extends KarmaFieldsAlpha.field.text {
    //
    //     constructor(resource) {
    //       super({
    //         selectMode: "row",
    //         ...resource
    //       });
    //     }
    //
    //     build() {
    //       return {
    //         tag: this.resource.tag,
    //         class: "text karma-field modal-btn",
    //         init: node => {
    //           // node.element.tabIndex = -1;
    //         },
    //         update: async node => {
    //           node.element.innerHTML = await this.getContent();
    //         }
    //       };
    //     }
    //
    //   }
    //
    //   static tableIndex = class extends this.modalHandle {
    //
    //     constructor(resource) {
    //       super({
    //         width: "40px",
    //         selectMode: "row",
    //         ...resource
    //       });
    //
    //     }
    //
    //     build() {
    //       return {
    //         class: "karma-field text",
    //         update: async container => {
    //           container.element.textContent = await this.parent.request("index");
    //         }
    //       };
    //     }
    //
    //   }
    //
    //
    // }


  }

}
