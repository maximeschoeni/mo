
KarmaFieldsAlpha.field.layout.collection = class extends KarmaFieldsAlpha.field.layout.table {

  constructor(resource) {
    super(resource);

    // this.idsBuffer = new KarmaFieldsAlpha.Buffer("state", this.resource.id || this.resource.driver, "ids");

    // this.selectionBuffer = new KarmaFieldsAlpha.Buffer("state", this.resource.id || this.resource.driver, "selection");
    this.selectionBuffer = new KarmaFieldsAlpha.Buffer("state", "selection");



    // this.clipboard = this.createChild("clipboard");
    // this.cellClipboard = this.createChild("clipboard");
  }

  // -> compat
  async queryIds() {
    return this.load();
  }

  async load() {
    const ids = this.idsBuffer.get() || [];
    const params = this.getParams();
    // const newIds = await this.parent.request("query", params);
    const results = await this.query(params);
    const newIds = results.map(item => item.id);

    this.idsBuffer.change(newIds, ids);

    // this.expressionCache.remove();

    // -> for table transfers
    // if (KarmaFieldsAlpha.Nav.has("selection")) {
    //   const selectedIds = KarmaFieldsAlpha.Nav.get("selection").split(",");
    //   const currentSelection = this.selectionBuffer.get();
    //   const newSelection = KarmaFieldsAlpha.Segment.fromArrays(newIds, selectedIds);
    //   if (newSelection && !KarmaFieldsAlpha.Segment.compare(newSelection, currentSelection)) {
    //     // this.interface.select(newSelection.index, newSelection.length);
    //     this.selectionBuffer.change(newSelection);
    //   }
    // }

    return ids;
  }

  unload() {
    this.idsBuffer.change(null);
  }

  getParams() {

    const {id, table, selection, language, ...params} = {
      page: 1,
      ppp: 10,
      ...this.resource.params,
      ...KarmaFieldsAlpha.Nav.get()
    };

    return params;

  }

  getCountParams() {

    const {page, ppp, orderby, order, ...params} = this.getParams();

    return params || {};

  }

  async getCount() {

    // const paramString = this.getCountParamString();
    const params = this.getCountParams();
    // const paramString = KarmaFieldsAlpha.Nav.toString(params);
    // const count = await this.server.store.count(paramString);
    const count = await this.count(params);

    return Number(count || 0);
  }

  getPpp() {
    // return this.getParam("ppp") || this.resource.ppp || 10;
    return Number(KarmaFieldsAlpha.Nav.get("ppp") || this.resource.params && this.resource.params.ppp || 10);
  }

  getColumns() {
    // return this.optionsBuffer.get("columns") || this.resource.children.map((column, index) => index.toString()) || [];
    return this.resource.children.map((column, index) => index.toString()) || [];
  }

  async getNumPage() {
    const count = await this.getCount();
    const ppp = this.getPpp();
    return Math.max(1, Math.ceil(count/ppp));
  }

  getPage() {
    if (KarmaFieldsAlpha.Nav.has("page")) {
      return Number(KarmaFieldsAlpha.Nav.get("page"));
    }
    return 1;
  }

  async changePage(page) {
    const current = this.getPage();

    if (page !== current) {
      KarmaFieldsAlpha.History.save();
      KarmaFieldsAlpha.Nav.change(page, current, "page");
      this.unselect();
      await this.load();
      await this.parent.request("render");
    }
  }

  getOrder() {
    return KarmaFieldsAlpha.Nav.get("order") || this.resource.params.order;
  }

  getOrderby() {
    return KarmaFieldsAlpha.Nav.get("orderby") || this.resource.params.orderby;
  }

  toggleOrder(key, order) {

    let orderby = this.getOrderby();

    if (orderby === key) {

      order = (this.getOrder() || order || "asc") === "asc" ? "desc" : "asc";
      KarmaFieldsAlpha.Nav.change(order, undefined, "order");

    } else {

      KarmaFieldsAlpha.Nav.change(order || "asc", undefined, "order");
      KarmaFieldsAlpha.Nav.change(key, undefined, "orderby");

    }

  }


  getIds() {
    return this.idsBuffer.get() || [];
  }

  // isModalOpen() {
  //   return Boolean(this.resource.modal && this.resource.modal.keepAlive);
  // }

  async exportSelection(keys = []) {

    const selection = this.selectionBuffer.get();

    if (selection) {

      return this.export(keys, selection.index, selection.length);

    }

    return [];
  }

  async importSelection(data) {

    const selection = this.selectionBuffer.get();

    if (selection) {

      await this.import(data, selection.index, selection.length);

    }

  }

  async export(keys = [], index = 0, length = this.getIds().length) {

    // const ids = this.getIds();
    //
    // segment ||= this.selectionBuffer.get() || {index: 0, length: ids.length};

    const ids = this.getIds().slice(index, index + length);

    const rows = [];

    for (let id of ids) {

      const rowField = this.createChild({
        children: this.resource.children,
        key: id,
        type: "row"
      });

      let row = await rowField.export(keys);

      if (this.resource.modal) {

        const modal = this.createChild({
          ...this.resource.modal,
          key: id,
          type: "row"
        });

        const modalObject = await modal.export(keys);

        row = {...row, ...modalObject};

      }


      rows.push(row);
    }

    return rows;
  }

  // async import(data, ids) { // expect json array
  //
  //   for (let i = 0; i < ids.length; i++) {
  //
  //     const id = ids[i];
  //     const object = data[i%data.length];
  //     // await this.interface.importRow(data[i]);
  //
  //     const rowField = this.createChild({
  //       children: this.resource.children,
  //       key: id,
  //       type: "row"
  //     }, id);
  //
  //     await rowField.import(object);
  //
  //     if (this.resource.modal) {
  //
  //       const modal = this.createChild({
  //         ...this.resource.modal.body,
  //         key: id,
  //         type: "row"
  //       });
  //
  //       await modal.import(object);
  //
  //     }
  //
  //   }
  //
  //
  //
  // }

  async import(data, index = this.getIds().length, length = 0) { // expect json array

    // segment = segment || this.getSelection() || {index: this.getIds().length, length: 0};

    if (data.length < length) {

      await this.remove(index + data.length, length);

    } else if (data.length > length) {

      await this.addMultiple(data.length - length, {}, index + length);

    }

    if (data.length > 0) {

      const ids = this.getIds().slice(index, index + data.length);

      for (let i = 0; i < ids.length; i++) {

        const id = ids[i];
        const object = data[i%data.length];

        const rowField = this.createChild({
          children: this.resource.children,
          key: id,
          type: "row"
        });

        await rowField.import(object);

        if (this.resource.modal) {

          const modal = this.createChild({
            ...this.resource.modal,
            key: id,
            type: "row"
          });

          await modal.import(object);

        }

      }

    }

  }

  async addMultiple(num, params, index) {

    const ids = [];

    for (let i = 0; i < num; i++) {

      const id = await this.add(params, index+i);

      ids.push(id);

    }

    return ids;
  }

  async add(params = {}, index = 0) {

    let createdId = await KarmaFieldsAlpha.Gateway.post("add/"+this.resource.driver, params);

    const id = KarmaFieldsAlpha.Type.toString(createdId);

    this.buffer.change(["0"], null, id, "trash");

    const rowField = this.createChild({
      children: this.resource.children,
      type: "row"
    });

    const defaults = await rowField.getDefault();

    params = {...defaults, ...params};

    if (this.resource.modal) {

      const modal = this.createChild({
        ...this.resource.modal,
        key: id,
        type: "row"
      });

      const modalDefaults = await modal.getDefault();

      params = {...modalDefaults, ...params};

    }

    for (let key in params) {

      this.buffer.change([params[key]], null, id, key);

    }

    const ids = [...this.getIds()];

    ids.splice(index, 0, id);

    this.idsBuffer.change(ids);

    return id;
  }

  async remove(index, length) {

    const ids = this.idsBuffer.get() || [];
    const clones = ids.slice();
    const removeIds = clones.splice(index, length);

    // const removeIds = ids.slice(index, index + length);

    for (let id of removeIds) {

      // this.server.trashBuffer.set({
      //   ...this.server.buffer.get(id),
      //   trash: ["1"]
      // }, id);

      // await this.parent.request("trash", {data: {
      //   ...this.server.buffer.get(id),
      //   trash: ["1"]
      // }}, id);

      this.trashBuffer.set({
        ...this.initialBuffer.get(id),
        trash: ["1"]
      }, id);

      this.buffer.change(["1"], ["0"], id, "trash");

    }

    // const ids = this.getIds().filter(id => !removeIds.includes(id));

    this.idsBuffer.change(clones);

  }


  // async read(ids) {
  //   const data = [];
  //
  //   for (let i = 0; i < ids.length; i++) {
  //
  //     const bufferData = await this.parent.request("get", {});
  //     const formBufferData = this.buffer.get(ids);
  //
  //     const clone = {};
  //
  //     KarmaFieldsAlpha.DeepObject.merge(clone, bufferData);
  //     KarmaFieldsAlpha.DeepObject.merge(clone, formBufferData);
  //
  //     data.push(clone);
  //
  //   }
  //
  //   return data;
  // }
  //
  // write(data, ids) {
  //
  //   const filterParams = this.getFilterParams();
  //
  //   for (let i = 0; i < ids.length; i++) {
  //
  //     const id = ids[i];
  //     const item = data[i%data.length];
  //
  //     for (let key in filterParams) {
  //       item[key] = [key[filterParams]];
  //     }
  //
  //     delete item.id;
  //     delete item.trash;
  //
  //     // this.grid.buffer.backup(item, id);
  //     // this.grid.buffer.set(item, id);
  //     this.interface.buffer.change(item, undefined, id);
  //
  //   }
  //
  // }

  async duplicate(index, length = 1) {

    // const ids = this.getIds().slice(index, index + length);

    const data = await this.export([], index, length);

    // const ids = await this.addMultiple(length);

    // const data = this.read(ids);


    // this.write(data, cloneIds);
    await this.import(data, index + length, 0);

    // return ids;
  }


  getSelectedIds(selection) {

    if (!selection) {

      selection = this.selectionBuffer.get();

    }

    if (selection) {

      const ids = this.idsBuffer.get() || [];

      return ids.slice(selection.index, selection.index + selection.length);

    }

    return [];
  }

  select(index, length) {

    const newSelection = {index: index, length: length};
    const currentSelection = this.selectionBuffer.get() || {};

    if (!KarmaFieldsAlpha.Segment.equals(currentSelection, newSelection)) {

      this.selectionBuffer.change(newSelection, currentSelection);

    }

  }

  unselect() {

    this.selectionBuffer.change();

  }

  createSelection(ids) {

    const first = this.getIds().indexOf(ids[0]);

    // -> todo: handle unconsecutive ids

    if (first > -1) {

      return {index: first, length: ids.length};

    }

  }

  getSelection() {
    return this.selectionBuffer.get();
  }

  // override form.send()
  async send(data) {

    const selectedIds = this.getSelectedIds();

    await super.send(data);

    if (this.cache) {

      this.cache.empty(); // buffer need to stay for history

    }

    await this.load();

    if (selectedIds.length) {

      const selection = this.createSelection(selectedIds);

      this.selectionBuffer.change(selection);

    }

  }

  async request(subject, content, ...path) {

    switch (subject) {

      // case "edit":
      //   return this.parent.request("render-controls");

      case "selectedIds": {
        const selection = this.selectionBuffer.get();
        if (selection) {
          return this.getIds().slice(selection.index, selection.index + selection.length);
        }
        return [];
      }

      case "selection": {
        return this.getSelection();
      }

      case "unselect": {
        if (this.selectionBuffer.get()) {
          KarmaFieldsAlpha.History.save();
          this.selectionBuffer.change(null);
          await this.parent.request("render");
        }
        break;
      }

      case "export": {
        return this.export(content.keys, content.index, content.length);
      }

      // case "submit": {
      //
      //   await this.submit();
      //
      //   await this.parent.request("render");
      //
      // }

      // case "query": {
			// 	return this.query(content);
			// }
      //
			// case "count": {
			// 	return this.count(content);
			// }


      // case "export-cells":
      //   return this.exportCells(content.rectangle);
      //
      // case "import-cells":
      //   await this.importCells(content.data, content.rectangle);
      //   break;

      default:
        return super.request(subject, content, ...path);

    }

  }

  // isModalOpen() {
  //   return Boolean(this.resource.modal && (this.resource.modal.keepAlive || this.interface.selectionBuffer.get()));
  // }

  async exportCells(rectangle) {

    const data = [];
    const colIndexes = this.getColumns();
    const ids = this.getIds();

    const selectedIds = ids.slice(rectangle.y, rectangle.y + rectangle.height);
    const selectedCols = colIndexes.slice(rectangle.x, rectangle.x + rectangle.width);

    for (let id of selectedIds) {

      const rowField = this.createChild({
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

      const rowField = this.createChild({
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



  build() {

    return {
      class: "karma-field-table-grid-container karma-field-frame karma-field-group final",
      init: body => {
        body.element.tabIndex = -1;
      },
      update: body => {
        this.clipboard = this.createChild("clipboard");
        this.cellClipboard = this.createChild("clipboard");
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
        body.children = [
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

              const ids = this.getIds();
              const page = this.getPage();
              const ppp = this.getPpp();
              const offset = (page - 1)*ppp;
              const columns = this.getColumns();

              this.clipboard.onInput = async value => {
                const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
                const data = KarmaFieldsAlpha.Clipboard.toJson(dataArray);

                // this.parent.request("import", {data: data});

                const selection = this.selectionBuffer.get() || {};

                if (selection.length || data.length) {
                  KarmaFieldsAlpha.History.save();
                  await this.import(data, selection.index, selection.length);
                  this.selectionBuffer.change(null);
                  await this.parent.request("render");
                }

              }

              this.cellClipboard.onInput = async value => {
                if (this.cellSelection) {
                  KarmaFieldsAlpha.History.save();
                  const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
                  // await this.parent.request("import-cells", {data: dataArray, rectangle: this.cellSelection});
                  await this.importCells(dataArray, this.cellSelection);
                  await this.parent.request("render");
                }
              }

              this.cellClipboard.onBlur = event => {
                if (this.cellSelection) {
                  const selectionManager = new KarmaFieldsAlpha.CellManager(grid.element);
                  selectionManager.clearCells(this.cellSelection);
                }
              }

              const selection = this.selectionBuffer.get();

              grid.element.colCount = columns.length;
              grid.element.rowCount = ids.length;
              grid.element.colHeader = 1;
              grid.element.rowHeader = 0;


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
                                // const order = await this.parent.request("order");
                                // const order = KarmaFieldsAlpha.Nav.get("order") || this.resource.params.order;
                                const order = this.getOrder() || child.order || "asc";
                                // const orderby = await this.parent.request("orderby");
                                // const orderby = KarmaFieldsAlpha.Nav.get("orderby") || this.resource.params.orderby;
                                const orderby = this.getOrderby();
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
                                  // await this.parent.request("toggle-order", {key: child.orderby || child.key, order: child.order});

                                  KarmaFieldsAlpha.History.save();

                                  this.toggleOrder(child.orderby || child.key, child.order);
                                  this.unselect();

                                  await this.queryIds();
                                  await this.parent.request("render");

                                  a.element.parentNode.classList.remove("loading");
                                };
                              }
                            }
                          }
                        ];

                        th.element.colIndex = colIndex;
                        th.element.colHeader = true;

                        th.element.onmousedown = async event => {
                          if (event.buttons === 1) {
                            const selectionManager = new KarmaFieldsAlpha.CellManager(grid.element);
                            selectionManager.cellSelection = this.cellSelection;
                            selectionManager.onSelectCells = async cellSelection => {
                              this.cellSelection = cellSelection;
                              // const dataArray = await this.parent.request("export-cells", {rectangle: selection});
                              const dataArray = await this.exportCells(cellSelection);
                              const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                              this.cellClipboard.output(value);
                              this.cellClipboard.focus();
                            };
                            selectionManager.selectHeaders(event, colIndex);
                          }
                        }

                      }
                    };
                  }),
                  ...ids.reduce((children, id, rowIndex) => {

                    const row = this.createChild({
                      key: id,
                      type: "row",
                      children: this.resource.children || [],
                      index: offset + rowIndex + 1
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
                            td.element.classList.remove("selecting-cell");

                            td.element.rowIndex = rowIndex;
                            td.element.colIndex = colIndex;
                            td.element.multiSelectable = true;
                            td.element.cellSelectable = field.resource.selectMode !== "row";

                            td.element.onmousedown = async event => {

                              if (event.buttons === 1) {

                                // const cellManager = new KarmaFieldsAlpha.CellManager(grid.element, columns.length, ids.length, 0, 1);
                                // const selectionManager = new KarmaFieldsAlpha.SelectionManager(grid.element, columns.length, ids.length, 0, 1);
                                //
                                // cellManager.selection = this.cellSelection;
                                // selectionManager.selection = this.selectionBuffer.get();
                                //
                                // if (field.resource.selectMode !== "row") {
                                //
                                //   cellManager.onSelect = async selection => {
                                //
                                //     this.cellSelection = selection;
                                //
                                //     if (selection.width*selection.height > 1) {
                                //
                                //       // const dataArray = await this.parent.request("export-cells", {rectangle: selection});
                                //       const dataArray = await this.exportCells(selection);
                                //       const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                                //       this.cellClipboard.output(value);
                                //       this.cellClipboard.focus();
                                //
                                //     } else {
                                //
                                //       cellManager.clear(selection);
                                //
                                //     }
                                //
                                //
                                //   };
                                //
                                //   cellManager.selectCells(event, colIndex, rowIndex);
                                //
                                // } else {
                                //
                                //   cellManager.clear();
                                //
                                //   selectionManager.onSelect = async (selection, hasChange) => {
                                //     if (hasChange) {
                                //       KarmaFieldsAlpha.History.save();
                                //       this.selectionBuffer.change(selection);
                                //     }
                                //
                                //     // const jsonData = await this.parent.request("export");
                                //     const jsonData = await this.export([], selection.index, selection.length);
                                //     const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                                //     const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                                //     this.clipboard.output(value);
                                //     this.clipboard.focus();
                                //     await this.parent.request("render");
                                //
                                //   };
                                //
                                //   selectionManager.select(event, colIndex, rowIndex);
                                //
                                // }

                                const selectionManager = new KarmaFieldsAlpha.CellManager(grid.element);

                                const currentSelection = selectionManager.selection = this.selectionBuffer.get();

                                selectionManager.onSelectCells = async cellSelection => {

                                  this.cellSelection = cellSelection;

                                  const dataArray = await this.exportCells(cellSelection);
                                  const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                                  this.cellClipboard.output(value);
                                  this.cellClipboard.focus();

                                };

                                selectionManager.onSelect = async (selection) => {

                                  if (!KarmaFieldsAlpha.Segment.compare(currentSelection, selection)) {
                                    KarmaFieldsAlpha.History.save();
                                    this.selectionBuffer.change(selection, currentSelection);
                                  }

                                  // const jsonData = await this.parent.request("export");
                                  const jsonData = await this.export([], selection.index, selection.length);
                                  const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                                  const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                                  this.clipboard.output(value);
                                  this.clipboard.focus();
                                  await this.parent.request("render");

                                };

                                selectionManager.select(event, colIndex, rowIndex, field.resource.selectMode !== "row");

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
                // const jsonData = await this.parent.request("export");
                const jsonData = await this.exportSelection();
                const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                this.clipboard.output(value);
                this.clipboard.focus();
              }
            }
          }
        ];
      }
    }

  }



  // static row = class extends KarmaFieldsAlpha.field {
  //
  //   async request(subject, content, ...path) {
  //
  //     switch (subject) {
  //
  //       case "index":
  //         return this.index;
  //
  //       default:
  //         return super.request(subject, content, this.getKey(), ...path);
  //     }
  //
  //   }
  //
  //   getKeys() {
  //
  //     let keys = new Set();
  //
  //     for (let resource of this.resource.children) {
  //
  //       keys = new Set([...keys, ...this.createChild(resource).getKeys()]);
  //
  //     }
  //
  //     return keys;
  //   }
  //
  //   async getDefault() {
  //
  //     let defaults = {};
  //
  //     for (let index in this.resource.children) {
  //
  //       const child = this.createChild(this.resource.children[index]);
  //
  //       defaults = {
  //         ...defaults,
  //         ...await child.getDefault()
  //       };
  //
  //     }
  //
  //     return defaults;
  //   }
  //
  //   async export(keys = []) {
  //
  //     let object = {};
  //
  //     for (let resource of this.resource.children) {
  //
  //       const child = this.createChild(resource);
  //
  //       object = {
  //         ...object,
  //         ...await child.export(keys)
  //       };
  //
  //     }
  //
  //     return object;
  //   }
  //
  //   async import(object) {
  //
  //     for (let resource of this.resource.children) {
  //
  //       const child = this.createChild(resource);
  //
  //       await child.import(object);
  //
  //     }
  //
  //   }
  //
  //
  //
  //   static handle = class extends KarmaFieldsAlpha.field.text {
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
  //   static modalHandle = class extends this.handle {}; // -> compat
  //
  //   static tableIndex = class extends this.handle {
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


  // static modal = class extends KarmaFieldsAlpha.field.table.modal {
  //
  //   async request(subject, content, ...path) {
  //
  //     switch (subject) {
  //
  //       case "close": {
  //         return this.parent.request("unselect");
  //       }
  //
  //       case "state": {
  //
  //         const ids = await this.parent.request("selectedIds");
  //
  //         if (ids.length === 1) {
  //
  //           return this.parent.request("state", {}, ids[0], ...path);
  //
  //         } else if (ids.length > 1) {
  //
  //           const response = {
  //             values: [],
  //             multi: true
  //           };
  //
  //           for (id of ids) {
  //
  //             const state = await this.parent.request("state", {}, id, ...path);
  //
  //             response.values.push(state.value);
  //
  //             if (response.value === undefined || KarmaFieldsAlpha.DeepObject.equal(response.value, state.value)) {
  //
  //               response.value = state.value;
  //
  //             } else {
  //
  //               response.value = null;
  //
  //             }
  //
  //             response.alike = response.value !== null;
  //             response.modified = Boolean(response.modified || state.modified);
  //
  //           }
  //
  //           return response;
  //
  //         } else {
  //
  //           return {};
  //
  //         }
  //
  //       }
  //
  //       default: {
  //         const [id] = await this.parent.request("selectedIds");
  //
  //         if (id) {
  //
  //           path = [id, ...path];
  //
  //         }
  //
  //         return this.parent.request(subject, content, ...path);
  //       }
  //
  //     }
  //
  //   }
  //
  // }

}
