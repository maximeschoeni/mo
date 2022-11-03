KarmaFieldsAlpha.tables = {};

KarmaFieldsAlpha.fields.table = class extends KarmaFieldsAlpha.fields.group {

  constructor(resource, parent, form) {
    super(resource, parent);

    const field = this;



    // window.karma_table = this; // -> debug
    KarmaFieldsAlpha.tables[resource.driver] = this;

    // compat!
    resource.columns = resource.columns.filter(function(column) {
      if (column.type === "index") {
        resource.index = column;
        return false;
      }
      return true;
    });

    // select
    this.select = new KarmaFieldsAlpha.SelectionManager();

    this.select.events.copy = function() {
      field.copy(this.selection);
    }
    this.select.events.cut = async () => {
      await this.cut(this.select.selection);
      await this.render();
    }
    this.select.events.paste = function() {
      field.paste(this.selection).then(function() {
        field.render();
      });
    }

    field.select.events.select = function() {
      field.renderFooter();
    };


    // table managment (extra ids)
    this.tableManagment = new KarmaFieldsAlpha.fields.form({
      driver: resource.driver+"-managment",
      // prefix: "karma",
      fetch: false,
      history: true
    }, this);
    // this.tableManagment.prefix = "karma/managment"



    this.subsections = [];

    // filters
    if (resource.filters) {
      this.filters = new KarmaFieldsAlpha.fields.group(resource.filters, this, this);

      this.filters.fetchValue = (expectedType, ...path) => {
        return KarmaFieldsAlpha.History.getParam(path.join("/"));
      }
      this.filters.getValue = (...path) => {
        return KarmaFieldsAlpha.History.getParam(path.join("/"));
      }
      this.filters.setValue = (value, ...path) => {
        return KarmaFieldsAlpha.History.setParam(path.join("/"), value);
      }
      this.filters.removeValue = (...path) => {
        return KarmaFieldsAlpha.History.removeParam(path.join("/"));
      }
      this.filters.isModified = () => false;
      this.filters.getRelatedValue = () => {};
      this.filters.submit = this.filters.edit = () => {
        KarmaFieldsAlpha.History.setParam("page", 1);
        return this.editParam();
      }
      this.filters.backup = () => {
        KarmaFieldsAlpha.History.backup();
      }
      this.filters.getDriver = () => { // for fetching options (dropdown)
        return this.resource.driver;
      }

      this.subsections.push(this.filters);
    }









    // this.filters = new KarmaFieldsAlpha.fields.group({
    //   children: [resource.filters],
    //   history: false,
    //   fetch: "none"
    // }, this, this);
    //
    // this.filters.edit = () => {
    //   KarmaFieldsAlpha.History.setParam("page", 1);
    //   return this.editParam();
    // };
    //
    // this.filters.getBuffer = () => {
    //
    // }



    // content

    this.content = new KarmaFieldsAlpha.fields.table.tableContent({
      driver: resource.driver
      // prefix: "karma/content"
    }, this);

    this.content.table = this;

    // this.content = new KarmaFieldsAlpha.fields.form({
    //   driver: resource.driver
    //   // prefix: "karma/content"
    // }, this);
    //
    // // this.content.prefix = "karma/content";
    //
    // this.content.edit = async () => {
    //   await field.renderFooter();
    // };
    //
    // this.content.fetchValue = async (expectedType, ...path) => {
    //   let value;
    //   if (expectedType === "array") {
    //     value = await KarmaFieldsAlpha.Gateway.getArrayValue(this.queriedIds, ...path);
    //   }
    //   if (value === undefined) {
    //
    //   }
    // };


    // options
    // this.options = new KarmaFieldsAlpha.fields.form({
    //   driver: resource.driver+"-options",
    //   key: "options",
    //
    //   history: false,
    //   fetch: false,
    //   children: [
    //     {
    //       type: "input"
    //     },
    //     {
    //       type: "submit"
    //     }
    //   ]
    //
    //
    // }, this, this);

    this.options = new KarmaFieldsAlpha.fields.form({
      driver: resource.driver+"-options",
      key: "options",

      history: false,
      fetch: false
      // children: [
      //   {
      //     type: "input"
      //   },
      //   {
      //     type: "submit"
      //   }
      // ]


    }, this, this);


    // this.subsections = (this.resource.subsections || []).map(resource => this.createChild(resource));

    if (this.resource.subsections) {
      this.subsections = this.subsections.concat(this.resource.subsections.map(resource => this.createChild(resource)));
    }



  }

  // updateChildren() {
	// 	this.content.updateChildren();
  //   this.options.updateChildren();
  //   this.tableManagment.updateChildren();
	// }


  getBufferIds() {
    console.error("DEPRECATED getBufferIds");
    const ids = [];
    const rows = this.content.getDeltaValue();
    for (let id in rows) {
      if (rows[id].trash !== "1" && (!this.queriedIds || this.queriedIds.indexOf(id) === -1)) {
        ids.push(id);
      }
    }
    return ids;
  }



  getExtraIds() {
    // if (!this.extraIds) {
    //   const ids = this.tableManagment.getDeltaValue("ids");
    //   this.extraIds = ids && ids.split(",") || [];
    // }
    // return this.extraIds;

    // const ids = this.tableManagment.getDeltaValue("ids");
    const ids = this.tableManagment.getValue("ids");
    return ids && ids.split(",") || [];

  }

  setExtraIds(ids) {
    this.extraIds = null;
    if (ids && ids.length) {
      this.tableManagment.setValue(ids.join(","), "ids");
    } else {
      this.tableManagment.removeValue("ids");
    }
  }

  removeExtraIds() {
    this.extraIds = null;
    this.tableManagment.removeValue("ids");
  }

  // isExtraId(id) {
  //   return this.getExtraIds().indexOf(id) > -1;
  // }


  editFull() {
    return this.render();
  }


  getPage() {
    return Number(KarmaFieldsAlpha.History.getParam("page")) || 1;
  }

  getPpp() {
    // return Number(KarmaFieldsAlpha.History.getParam("ppp")) || this.getDefaultPpp();
    return this.options.getValue("ppp") || this.getDefaultPpp();
  }
  setPpp(ppp) {
    this.options.setValue(ppp, "ppp");
  }

  getDefaultPpp() {
    return this.resource.ppp || "20";
  }

  getDefaultOrderby() {
    return this.resource.default && this.resource.default.orderby || this.resource.orderby;
  }

  getDefaultOrder(orderby) {
    const column = orderby && this.resource.columns.find(column => {
      return column.field && column.field.key === orderby;
    });
    if (column && column.field.order) {
      return column.field.order;
    }
  }




  getTable() {
    return this;
  }


  // hasModifiedValue() {
	// 	return false;
	// }

	// getModifiedValue() {
	// }

  // async fetchValue(keys) {
  //   const path = keys.join("/");
	// 	let value = this.getParam(path);
	// 	return value;
  // }
  //
  // async fetchArray(keys) {
  //   return this.fetchValue(keys);
  // }
  //
  // setValue(value, keys) {
  //   const path = keys.join("/");
  //   this.setParam(path, value);
  // }


  // async update() {
  //   let paramString = this.getParamString();
  //   if (paramString !== this.paramString) {
  //     this.paramString = paramString;
  //     await this.query(paramString);
  //     this.modified = true;
  //   } else {
  //     this.modified = false;
  //   }
  // }

  async render() {
    //
  }
  async renderFooter() {
    //
  }
  async renderModal() {
    //
  }

  getParamString() {

    let paramString = KarmaFieldsAlpha.History.getParamString();
    const params = new URLSearchParams(paramString);

    if (!params.get("page")) {
      params.set("page", "1");
    }

    if (!params.get("ppp")) {
      // params.set("ppp", this.getDefaultPpp() || "");
      params.set("ppp", this.getPpp());
    }

    // if (!params.get("orderby")) {
    //   const orderby = this.getDefaultOrderby();
    //   if (orderby) {
    //     params.set("orderby", orderby);
    //   }
    // }
    //
    // if (!params.get("order")) {
    //   const order = this.getDefaultOrder(params.get("orderby"));
    //   if (order) {
    //     params.set("order", order);
    //   }
    // }

    params.sort();

    if (params.toString() !== paramString) {

      KarmaFieldsAlpha.History.setParamString(params.toString());

    }

    // params.delete("id");

    return params.toString();
  }

  getRow(id) {
    return this.content.getChild(id) || this.content.createChild({
      type: "tableRow",
      key: id,
      columns: this.resource.columns
    });
    // row.create(this.resource.columns || []);
  }



  async query() {

    // const nav = this.decodeParams(this.paramString);
    // if (!nav.page) nav.page = 1;
    // if (!nav.ppp) nav.ppp = 100;
    // let paramString = this.encodeParams(nav);

    // const param = new URLSearchParams(this.paramString);

    this.paramString = this.getParamString();



    // const results = await this.content.getRemoteTable(paramString, this.resource.driver);
    const results = await KarmaFieldsAlpha.Gateway.getTable(this.resource.driver, this.paramString);

    this.count = results.count;
    //this.queriedIds = results.ids;

    this.setExtraIds(results.ids);

    results.ids.forEach(id => {
      const row = this.getRow(id);
      row.trash.registerValue("0");

      // const row = this.content.getChild(id) || this.content.createChild({
      //   type: "tableRow",
      //   key: id
      // });
      // row.create(this.resource.columns || []);
    });



    return results;
  };

  async sync() {

    // this.queriedIds = this.getCurrentIds();


    // this.queriedIds = this.getBufferIds().concat(this.queriedIds);

    const results = await this.content.save();


    this.tableManagment.write("ids");

    KarmaFieldsAlpha.History.backup();
    // this.removeExtraIds();


    // this.queriedIds = this.getExtraIds().concat(this.queriedIds);


    // this.setExtraIds([]);

    // this.removeExtraIds();

    return results;
  };


  async add(num, noBackup) {
    // const results = await KarmaFieldsAlpha.Form.add(this.resource.driver, {num: num || 1})
    //
    // const ids = results.map(item => (item.id || item).toString());


    const ids = await KarmaFieldsAlpha.Gateway.add(this.resource.driver, {num: num || 1});

    const rows = ids.map(id => this.getRow(id));

    // if (!noBackup) {
    //   this.content.backup(["add"]);
    //   // this.backup(["add"]);
    // }

    // debugger;

    await Promise.all(rows.map(row => {
      row.fill(null);
      row.trash.registerValue("1");
      row.trash.setValue("1");
    }));

    this.tableManagment.write("ids");

    // this.backup(["ids"]);

    // this.ids.add(ids);

    KarmaFieldsAlpha.History.backup();

    // this.setExtraIds(this.getExtraIds().concat(ids));
    // this.extraIds = this.extraIds.concat(ids);

    await Promise.all(rows.map(row => row.fill())); // -> also set trash to "0"


    // this.queriedIds = ids.concat(this.queriedIds);
    // await this.content.ids.add(ids);


    this.setExtraIds(ids.concat(this.getExtraIds()));



    // if (this.getModalColumn() && ids.length === 1) {
    //   KarmaFieldsAlpha.History.setParam("id", ids[0]);
    // }

    if (KarmaFieldsAlpha.History.hasParam("id")) {
      if (ids.length === 1) {
        KarmaFieldsAlpha.History.setParam("id", ids[0]);
      } else {
        KarmaFieldsAlpha.History.removeParam("id");
      }
    }

  }

  async remove() {
    let ids = [];
    if (KarmaFieldsAlpha.History.hasParam("id")) {
      ids = [KarmaFieldsAlpha.History.getParam("id")];

    } else if (this.select.selection && this.select.selection.width === this.select.grid.width) {
      ids = this.getCurrentIds().slice(this.select.selection.y, this.select.selection.y+this.select.selection.height);
    }
    if (ids.length) {
      const rows = ids.map(id => this.content.getChild(id));


      await Promise.all(rows.map(row => {
        row.write();
        return row.trash.setValue("0");
      }));

      // let isSomeExtra = this.getExtraIds().some(id => ids.indexOf(id) > -1);

      // if (isSomeExtra) {
      //   this.tableManagment.write("ids");
      // }
      this.tableManagment.write("ids");



      // rows[0].backup();

      KarmaFieldsAlpha.History.backup();



      // this.content.backup(rows);
      // this.content.ids.remove(ids);

      // await Promise.all(rows.map(row => row.removeValue()));

      await Promise.all(rows.map(row => {
        row.removeValue();
        return row.trash.setValue("1");
      }));

      // this.queriedIds = this.queriedIds.filter(id => ids.indexOf(id) === -1);

      // if (isSomeExtra) {
      //   this.setExtraIds(this.getExtraIds().filter(id => ids.indexOf(id) === -1));
      // }
      this.setExtraIds(this.getExtraIds().filter(id => ids.indexOf(id) === -1));


      // if modal open
      KarmaFieldsAlpha.History.removeParam("id");

      await this.editParam();

    }
  }

  // async function
  reorder(column) {
    const params = KarmaFieldsAlpha.History.getParamsObject();
    // const orderby = this.getParam("orderby");
    // const order = this.getParam("order");
    const orderby = params.get("orderby"); // || this.getDefaultOrderby();
    const order = params.get("order"); // || this.getDefaultOrder(orderby);
    const key = column.orderby || column.field.key;

    if (key) {
      if (orderby === key) {
        params.set("order", order === "asc" ? "desc" : "asc");
      } else {
        params.set("order", column.order || "asc");
        params.set("orderby", key);
      }
      params.set("page", 1);
      KarmaFieldsAlpha.History.setParamsObject(params);
      return this.editParam();
    }

  }


  selectRow(rowId) {

    const ids = this.getCurrentIds();
    let index = ids.indexOf(rowId);
    if (index > -1) {
      this.select.setFocus({x:0, y:index});
    }

  }

  // getSelectedFields() {
  //   const selection = this.select.selection;
  //   let ids = this.getCurrentIds();
  //   const fields = [];
  //   for (var j = 0; j < selection.height; j++) {
  //     const rowField = this.content.getChild(ids[j+selection.y]);
  //     for (var i = 0; i < selection.width; i++) {
  //       const cellField = rowField.children[i+1+selection.x];
  //       fields.push(cellField);
  //     }
  //   }
  //   return fields;
  // }
  // getFieldByPath(path) {
  //
  // }

  getSelectedRowIds(key) {
    const selection = this.select.selection;
    // const ids = this.getCurrentIds();
    // const selectedIds = [];
    // for (var j = 0; j < selection.height; j++) {
    //   selectedIds.push(ids[j+selection.y]);
    // }
    // return pathes;
    //

    return selection && this.getCurrentIds().slice(selection.y, selection.y+selection.height) || [];
  }

  // getSelectedColumnsPaths(key) {
  //   const selection = this.select.selection;
  //   const ids = this.getCurrentIds();
  //   const pathes = [];
  //   for (var j = 0; j < selection.height; j++) {
  //     pathes.push([ids[j+selection.y], key]);
  //   }
  //   return pathes;
  // }

  async copy(selection) {
    // const field = this;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      let ids = this.getCurrentIds();

      var rows = [];
      for (var j = 0; j < selection.height; j++) {
        var cols = [];
        const row = this.content.getChild(ids[j+selection.y]);
        for (var i = 0; i < selection.width; i++) {
          const cell = row.children[i+1+selection.x];
          const valuePromise = cell.exportValue(selection.width === 1);
          cols.push(valuePromise);
        }
        rows.push(cols);
      }



      if (rows.length) {
        const items = await Promise.all(rows.map(cols => {
          return Promise.all(cols).then(cols => {
            return cols.join("\t")
          });
        }));

        const text = items.join("\n");
        await navigator.clipboard.writeText(text);
      }

    }
  }

  // async paste(selection) {
  //
  //   const field = this;
  //   const x = selection.x;
  //   const y = selection.y;
  //
  //   console.log(selection);
  //
  //   let ids = this.getCurrentIds();
  //   const text = await navigator.clipboard.readText();
  //
  //   if (text) {
  //     let rows = text.split(/[\r\n]+/).map(row => row.split("\t"));
  //
  //     // write all fields
  //     for (let j = 0; j < rows.length; j++) {
  //       const rowField = this.content.getChild(ids[j+y]);
  //       if (rowField) {
  //         for (let i = 0; i < rows[j].length; i++) {
  //           const cellField = rowField.children[i+1+x];
  //           if (cellField) {
  //             cellField.write();
  //           }
  //         }
  //       }
  //     }
  //
  //     if (rows.length > ids.length-y) {
  //       await this.add(rows.length-(ids.length-y), false); // -> will backup
  //       ids = this.getCurrentIds();
  //     } else {
  //       KarmaFieldsAlpha.History.backup();
  //     }
  //
  //     const promises = [];
  //     for (let j = 0; j < rows.length; j++) {
  //       const rowField = this.content.getChild(ids[j+y]);
  //       for (let i = 0; i < rows[j].length; i++) {
  //         const cellField = rowField.children[i+1+x];
  //         const value = rows[j][i];
  //         const promise = cellField.importValue(value);
  //         // .then(() => {
  //         //   return cellField.render();
  //         // });
  //         promises.push(promise);
  //       }
  //     }
  //     await Promise.all(promises);
  //     // await field.content.bubble("change");
  //
  //     await this.content.render();
  //     await this.content.edit();
  //   }
  // }

  async paste(selection) {

    const field = this;
    const x = selection.x;
    const y = selection.y;
    // let width = selection.width;
    // let height = selection.height;

    // console.log(selection);

    let ids = this.getCurrentIds();
    // const state = await navigator.permissions.query({ name: "clipboard-read" });

    // const state = await navigator.permissions.query({name:'geolocation'});
    //
    // console.log(state);

    // const {state} = await navigator.permissions.query({name:'clipboard-write'})


    const text = await navigator.clipboard.readText();

    if (text) {
      let textRows = text.split(/[\r\n]/).map(row => row.split("\t"));

      // write all fields
      // for (let j = 0; j < rows.length; j++) {
      for (let j = 0; j < Math.max(selection.height, textRows.length); j++) {
        const rowField = this.content.getChild(ids[j+y]);
        if (rowField) {
          for (let i = 0; i < Math.max(selection.width, textRows[j%textRows.length].length); i++) {
            const cellField = rowField.children[i+1+x];
            if (cellField) {
              cellField.write();
            }
          }
        }
      }

      if (textRows.length > ids.length-y) {
        await this.add(textRows.length-(ids.length-y), false); // -> will backup
        ids = this.getCurrentIds();
      } else {
        KarmaFieldsAlpha.History.backup();
      }

      const promises = [];
      for (let j = 0; j < Math.max(selection.height, textRows.length); j++) {
        const rowField = this.content.getChild(ids[j+y]);
        for (let i = 0; i < Math.max(selection.width, textRows[j%textRows.length].length); i++) {
          const cellField = rowField.children[i+1+x];
          const value = textRows[j%textRows.length][i%textRows[j%textRows.length].length];
          const promise = cellField.importValue(value);

          promises.push(promise);
        }
      }
      await Promise.all(promises);

      // await this.content.edit();
    }
  }


  async cut(selection) {

    await this.copy(selection);

    let ids = this.getCurrentIds();

    for (let j = 0; j < selection.height; j++) {
      const rowField = this.content.getChild(ids[j+selection.y]);
      if (rowField) {
        for (let i = 0; i < selection.width; i++) {
          const cellField = rowField.children[i+1+selection.x];
          if (cellField) {
            cellField.write();
          }
        }
      }
    }

    KarmaFieldsAlpha.History.backup();

    const promises = [];

    for (let j = 0; j < selection.height; j++) {
      for (let i = 0; i < selection.width; i++) {
        promises.push(this.content.getChild(ids[j+selection.y]).children[i+1+selection.x].fill());
      }
    }

    await Promise.all(promises);
    // await this.content.edit();
  }



  async editAll() {
    // console.log(conductor, value);
    if (this.select && this.select.selection && this.select.focusRect && this.select.selection.height > 1) {

      let ids = this.getCurrentIds();
      let field = this.content.getChild(ids[this.select.focusRect.y]).children[this.select.focusRect.x+1];
      let value = await field.fetchValue();

      field.backup();

      const promises = [];

      for (var j = 0; j < this.select.selection.height; j++) {
        if (j+this.select.selection.y !== this.select.focusRect.y) {
          const rowField = this.content.getChild(ids[j+this.select.selection.y]);
          const cellField = rowField.children[this.select.focusRect.x+1];
          cellField.setValue(value);

          promises.push(cellField.render());
        }
      }

      await Promise.all(promises);

      // await this.render();
    }
  }

  getIds() {
    console.error("Deprecated getIds()");
    return this.queriedIds;
  }

  getCurrentIds() {



    // return this.getExtraIds().concat(this.queriedIds || []);

    return this.getExtraIds();
  }

  getCount() {
    // const ids = this.content.ids.getValue() || [];
    // const ids = this.ids.getValue() || [];
    // return this.count + ids.length;
    return this.count;
  }


  hasIndex() {
    return this.resource.index || this.resource.index === undefined;
  }

  getIndexTitle() {
    return this.resource.index && this.resource.index.title || "#";
  }

  getIndexWidth() {
    return this.resource.index && this.resource.index.width || "auto";
  }

  getColumns() {
    return this.resource.columns || [];
  }

  hasHeader() {
    return true;
  }


  // getModal(rowId) {
  //   let row = rowId && this.content.getChild(rowId);
  //   let modal = row && row.children.find(function(child) {
  //     return child instanceof KarmaFieldsAlpha.fields.modal;
  //   });
  //   if (modal) {
  //     return modal;
  //   }
  // }



  getModalColumn() {
    return this.resource.columns.find(column => column.field && column.field.type === "modal");
  }

  getModalField(id) {
    // const rowField = this.getRow(id);

    // const rowField = this.content.getChild(id);

    const rowField = this.getRow(id);

    // console.log(id);

    return rowField && rowField.children.find(child => child.resource.type === "modal");
  }

  buildHeaderCell(column) {
    return {
      class: "th karma-field",
      update: th => {
        th.children = [
          {
            tag: "a",
            class: "header-cell-title",
            init: a => {
              a.element.textContent = column.title;
            }
          }
        ];
        if (column.sortable) {

          th.children.push(KarmaFieldsAlpha.fields.table.Controls.buildOrderLink(this, column));
        }
      }
    };
  }

  buildIndexCell(rowIndex) {
    return {
      class: "th table-row-index karma-field",
      update: th => {
        if (rowIndex < 0) {
          th.element.textContent = "+";
        } else {
          let page = parseInt(this.getPage());
          let ppp = parseInt(this.getPpp());
          th.element.textContent = (page - 1)*ppp + rowIndex + 1;
        }
        // let page = this.getPage();
        // let ppp = this.getPpp();
        // th.element.textContent = (page - 1)*ppp + rowIndex + 1;
      }
    };
  }

  buildGrid() {
    return {
      class: "table grid",
      init: async grid => {
        if (this.resource.style) {
					grid.element.style = this.resource.style;
				}
      },
      update: async grid => {
        grid.children = [];

        // table header index cell
        if (this.hasIndex() && this.hasHeader()) {
          grid.children.push({
            class: "th table-header-index karma-field",
            init: th => {
              th.element.textContent = this.getIndexTitle();
            }
          });
        }

        // table header cells
        if (this.hasHeader()) {
          this.getColumns().forEach((column, colIndex) => {
            grid.children.push(this.buildHeaderCell(column));
          });
        }

        // const rows = this.getCurrentIds().map(id => this.getRow(id)).filter(row => row.trash.getValue() !== "1").forEach((rowField, rowIndex) => {

        // const extraRows = this.getBufferIds().map(id => this.getRow(id));
        const extraIds = this.getExtraIds();
        // const extraRows = extraIds.map(id => this.getRow(id));
        //
        // extraRows.forEach((rowField, rowIndex) => {
        //   if (this.hasIndex()) {
        //     grid.children.push(this.buildIndexCell(-1));
        //   }
        //
        //   this.getColumns().forEach((column, colIndex) => {
        //     const cellField = rowField.children[colIndex+1];
        //     if (cellField) {
        //       grid.children.push(cellField.build());
        //     }
        //   });
        // });
        //
        // const rows = (this.queriedIds || []).filter(id => extraIds.indexOf(id) === -1).map(id => this.getRow(id)).filter(row => {
        //   return row.trash.getValue() !== "1";
        // });
        //
        // this.queriedIds = rows.map(row => row.resource.key); // -> prevent errors on copy/past

        const rows = extraIds.map(id => this.getRow(id)).filter(row => {
          return row.trash.getValue() !== "1";
        });

        rows.forEach((rowField, rowIndex) => {
          if (this.hasIndex()) {
            grid.children.push(this.buildIndexCell(rowIndex));
          }

          this.getColumns().forEach((column, colIndex) => {
            const cellField = rowField.children[colIndex+1];
            if (cellField) {
              grid.children.push(cellField.build());
            }
          });
        });

        grid.element.style.gridTemplateColumns = (this.hasIndex() && this.hasHeader() && [this.getIndexWidth()] || []).concat(this.getColumns().map((column) => {
          return column.width || "1fr";
        })).join(" ");

      },
      complete: grid => {
        this.select.registerTable(grid.element, this.getColumns().length, this.content.children.length, this.hasIndex(), this.hasHeader());
      }
    };

  }

  // buildGrid(rows) {
  //   return {
  //     tag: "table",
  //     init: async grid => {
  //       if (this.resource.flex) {
	// 				grid.element.style.flex = this.resource.flex;
	// 			}
  //     },
  //     update: async grid => {
  //       grid.children = [];
  //
  //       // table header index cell
  //       if (this.hasIndex() && this.hasHeader()) {
  //         grid.children.push({
  //           class: "th table-header-index karma-field",
  //           init: th => {
  //             th.element.textContent = this.getIndexTitle();
  //           }
  //         });
  //       }
  //
  //       // table header cells
  //       if (this.hasHeader()) {
  //
  //         grid.children.push({
  //           tag: "tr",
  //           update: tr => {
  //             tr.children = [];
  //
  //             if (this.hasIndex() && this.hasHeader()) {
  //               tr.children.push({
  //                 tag: "th",
  //                 init: th => {
  //                   th.element.textContent = this.getIndexTitle();
  //                 }
  //               });
  //             }
  //
  //
  //             this.getColumns().forEach(column => {
  //               tr.children.push({
  //                 tag: "th",
  //                 update: th => {
  //                   th.children = [
  //                     {
  //                       tag: "a",
  //                       class: "header-cell-title",
  //                       init: a => {
  //                         a.element.textContent = column.title;
  //                       }
  //                     }
  //                   ];
  //                   if (column.sortable) {
  //                     // const orderBtn = new KarmaFieldsAlpha.fields.tableControls.order();
  //                     // th.children.push(orderBtn.build(column, this));
  //                     th.children.push(KarmaFieldsAlpha.fields.table.Controls.buildOrderLink(this, column));
  //                   }
  //                 }
  //               });
  //             });
  //
  //           }
  //         });
  //
  //       }
  //
  //       // const rows = this.getCurrentIds().map(id => this.getRow(id)).filter(row => row.trash.getValue() !== "1").forEach((rowField, rowIndex) => {
  //       rows.forEach((rowField, rowIndex) => {
  //
  //         grid.children.push({
  //           tag: "tr",
  //           update: tr => {
  //             tr.children = [];
  //
  //             if (this.hasIndex()) {
  //               tr.children.push({
  //                 tag: "td",
  //                 init: th => {
  //                   th.element.textContent = this.getIndexTitle();
  //                 }
  //               });
  //             }
  //
  //             this.getColumns().forEach((column, colIndex) => {
  //               const cellField = rowField.children[colIndex+1];
  //               if (cellField) {
  //                 tr.children.push(cellField.build());
  //               }
  //             });
  //           }
  //         });
  //       });
  //
  //       // grid.element.style.gridTemplateColumns = (this.hasIndex() && this.hasHeader() && [this.getIndexWidth()] || []).concat(this.getColumns().map((column) => {
  //       //   return column.width || "1fr";
  //       // })).join(" ");
  //
  //     },
  //     complete: grid => {
  //       // this.select.registerTable(grid.element, this.getColumns().length, this.content.children.length, this.hasIndex(), this.hasHeader());
  //     }
  //   };
  //
  // }

  buildPagination() {
    return {
      class: "table-pagination",
      update: async container => {
        // console.log("update pagination", this.queriedIds);
        container.element.classList.add("loading");

        await (this.queryPromise || this.query());

        const count = this.getCount() || 0;
        const ppp = parseInt(this.getPpp());
        container.element.classList.toggle("hidden", count <= ppp);

        container.element.classList.remove("loading");
      },
      children: [
        // KarmaFieldsAlpha.fields.table.Pagination.buildPPPButton(this),
        // KarmaFieldsAlpha.fields.table.Pagination.buildItemsTotal(this),
        KarmaFieldsAlpha.fields.table.Pagination.buildFirstPageButton(this),
        KarmaFieldsAlpha.fields.table.Pagination.buildPrevPageButton(this),
        KarmaFieldsAlpha.fields.table.Pagination.buildCurrentPageElement(this),
        KarmaFieldsAlpha.fields.table.Pagination.buildNextPageButton(this),
        KarmaFieldsAlpha.fields.table.Pagination.buildLastPageButton(this)
      ]
    };
  }

  buildControls() {
    return {
      class: "table-control-group table-edit",
      children: [
        {
          tag: "button",
          class: "karma-button",
          init: button => {
            button.element.innerHTML = '<span class="dashicons dashicons-image-rotate" style="transform:scaleX(-1);"></span>';
            button.element.onclick = async event => {
              button.element.classList.add("loading");

              KarmaFieldsAlpha.Gateway.original = {};
              KarmaFieldsAlpha.Gateway.clearCache();

              await this.render();
              button.element.classList.remove("loading");
            }
          }
          // update: button => {
          //   const currentIndex = history.state && history.state.karmaIndex || 0;
          //   const maxIndex = KarmaFieldsAlpha.History.index || 0;
          //   button.element.disabled = !(currentIndex > 0);
          // }
        },
        KarmaFieldsAlpha.fields.table.Controls.buildSaveButton(this),
        // KarmaFieldsAlpha.fields.table.Controls.buildUndoButton(this),
        // KarmaFieldsAlpha.fields.table.Controls.buildRedoButton(this),
        KarmaFieldsAlpha.fields.table.Controls.buildAddButton(this),
        KarmaFieldsAlpha.fields.table.Controls.buildDeleteButton(this)
      ]
    };
  }

  buildModalNav() {
    return {
      class: "footer-group modal-navigation",
      children: [
        KarmaFieldsAlpha.fields.table.Pagination.buildPrevModalButton(this),
        KarmaFieldsAlpha.fields.table.Pagination.buildNextModalButton(this)
      ]
    };
  }


  buildModal() {

		return {
			class: "karma-modal",
			children: [
				{
					class: "karma-modal-header table-header",
					children: [
						{
							tag: "h1",
							update: async h1 => {

                const id = KarmaFieldsAlpha.History.getParam("id");
                const field = id && this.getModalField(id);

                // h1.element.textContent = field && await field.text.fetchValue() || "Edit";
                h1.child = field && field.createTitle().build();

							}
						},
            {
              class: "modal-navigation",
              children: [
                KarmaFieldsAlpha.fields.table.Pagination.buildPrevModalButton(this),
                KarmaFieldsAlpha.fields.table.Pagination.buildNextModalButton(this),
                KarmaFieldsAlpha.fields.table.Pagination.buildCloseModalButton(this)
              ]
            }
            // {
            //   class: "header-item",
            //   child: KarmaFieldsAlpha.fields.table.Pagination.buildCloseModalButton(this)
            // }
					]
				},
				{
					class: "karma-modal-body karma-field-frame",
					update: frame => {
            const id = KarmaFieldsAlpha.History.getParam("id");
            const field = id && this.getModalField(id);
            // console.log("upload karma-modal-body", field);
            if (field) {
              frame.element.classList.toggle("final", field.resource.final || false);
              frame.child = field.content.build();
              // frame.element.classList.add("loading");
              // console.log("start");
              // frame.complete = () => {
              //   console.log("end");
              //   frame.element.classList.remove("loading");
              // }
              // frame.element.classList.remove("loading");
              // console.log("upload karma-modal-body end");
            }
            // else {
            //   frame.element.classList.add("loading");
            //   console.log("upload karma-modal-body start");
            // }
					}
          // ,
          // complete: frame => {
          //   console.log("complete karma-modal-body");
          // }
				}
			]
		};

	}

  // buildFooterBar() {
  //   return {
  //     class: "footer-bar",
  //     children: [
  //
  //
  //       {
  //         class: "footer-group table-info",
  //         update: group => {
  //           let buttons = this.resource.controls || [
  //             {
  //               type: "save",
  //               name: "Save",
  //               primary: true
  //             },
  //             {
  //               type: "undo",
  //               name: "Undo"
  //             },
  //             {
  //               type: "redo",
  //               name: "Redo"
  //             },
  //             {
  //               type: "add",
  //               name: "Add"
  //             },
  //             {
  //               type: "delete",
  //               name: "Delete"
  //             }
  //           ];
  //           group.children = buttons.map(resource => {
  //             if (KarmaFieldsAlpha.fields.tableControls[resource.type]) {
  //               const button = new KarmaFieldsAlpha.fields.tableControls[resource.type](resource);
  //               return button.build(this);
  //             }
  //           });
  //         }
  //       },
  //       {
  //         class: "footer-group table-pagination",
  //         update: group => {
  //           const modal = this.getParam("id");
  //           if (modal) {
  //             group.children = [];
  //           } else {
  //             let buttons = [
  //               {
  //                 type: "ppp"
  //               },
  //               {
  //                 type: "firstPage",
  //                 name: "«"
  //               },
  //               {
  //                 type: "prevPage",
  //                 name: "‹"
  //               },
  //               {
  //                 type: "currentPage",
  //               },
  //               {
  //                 type: "nextPage",
  //                 name: "›"
  //               },
  //               {
  //                 type: "lastPage",
  //                 name: "»"
  //               }
  //             ];
  //             group.children = buttons.map(resource => {
  //               if (KarmaFieldsAlpha.fields.tableControls[resource.type]) {
  //                 const button = new KarmaFieldsAlpha.fields.tableControls[resource.type](resource);
  //                 return button.build(this);
  //               }
  //             });
  //           }
  //         }
  //       },
  //       {
  //         class: "footer-group modal-navigation",
  //         update: group => {
  //           const modal = this.getParam("id");
  //
  //           if (modal) {
  //             let buttons = [
  //               {
  //                 type: "prevModal",
  //                 name: "‹"
  //               },
  //               {
  //                 type: "nextModal",
  //                 name: "›"
  //               }
  //             ];
  //             group.children = buttons.map(resource => {
  //               if (KarmaFieldsAlpha.fields.tableControls[resource.type]) {
  //                 const button = new KarmaFieldsAlpha.fields.tableControls[resource.type](resource);
  //                 return button.build(this);
  //               }
  //             });
  //           } else {
  //             group.children = [];
  //           }
  //         }
  //       }
  //       // this.buildModalNav()
  //     ]
  //   };
  // }



  build() {

    return {
      class: "karma-field-table",
      children: [
        {
          class: "table-view",

          children: [
            {
              class: "table-modal",
              update: single => {
                let percentWidth = this.options.getValue(["modalWidth"]) || 100;
                single.element.style.flexBasis = percentWidth+"%";
                single.children = [
                  this.buildModal(),
                  {
                    class: "modal-resize-handle",
                    update: handle => {
                      handle.element.onmousedown = event => {
                        const mouseMove = event => {
                          const modalBox = single.element.getBoundingClientRect();
                          const viewerBox = single.element.parentNode.getBoundingClientRect();
                          const ratioWidth = (event.clientX - viewerBox.left)/viewerBox.width;
                          percentWidth = Math.min(100, 100*ratioWidth);
                          single.element.style.flexBasis = percentWidth+"%";
                          this.options.setValue(percentWidth, ["modalWidth"])
                        }
                        const mouseUp = event => {
                          window.removeEventListener("mousemove", mouseMove);
                          window.removeEventListener("mouseup", mouseUp);
                        }
                        window.addEventListener("mousemove", mouseMove);
                        window.addEventListener("mouseup", mouseUp);
                      }
                    }
                  }
                ]
              },
              // child: this.buildModal()
            },
            {
              class: "table-main",
              children: [
                {
                  class: "table-header",
                  init: header => {
                    this.renderHeader = header.render;
                  },
                  update: (header) => {
                    header.children = [
                      {
                        tag: "h1",
                        init: h1 => {
                          h1.element.textContent = this.resource.title || this.resource.key || this.resource.title || "Table";
                        }
                      },
                      // {
                      //   class: "header-item header-tab",
                      //   children: [
                      //     {
                      //       tag: "label",
                      //       init: label => {
                      //         label.element.textContent = "Number of items per page";
                      //       }
                      //     },
                      //     {
                      //       tag: "input",
                      //       init: input => {
                      //         input.element.type = "text";
                      //         input.element.style = "width:60px";
                      //       }
                      //     },
                      //     {
                      //       tag: "button",
                      //       class: "karma-button",
                      //       init: button => {
                      //         button.element.textContent = "Set";
                      //       }
                      //     },
                      //     {
                      //       tag: "a",
                      //       init: a => {
                      //         a.element.textContent = "Options";
                      //         a.element.onclick = event => {
                      //           if (this.tab === "options") {
                      //             this.tab = null;
                      //           } else {
                      //             this.tab = "options";
                      //           }
                      //           this.render();
                      //         }
                      //       }
                      //     }
                      //   ],
                      //   update: tab => {
                      //     tab.element.classList.toggle("active", this.tab === "options")
                      //   }
                      // },
                      // {
                      //   class: "header-item header-tab",
                      //   child: {
                      //     tag: "a",
                      //     init: a => {
                      //       a.element.textContent = "Filters";
                      //       a.element.onclick = event => {
                      //         if (this.tab === "filters") {
                      //           this.tab = null;
                      //         } else {
                      //           this.tab = "filters";
                      //         }
                      //         this.render();
                      //       }
                      //     }
                      //   },
                      //   update: tab => {
                      //     tab.element.classList.toggle("active", this.tab === "filters")
                      //   }
                      // },
                      // KarmaFieldsAlpha.fields.table.Pagination.buildSetPpp(this),
                      KarmaFieldsAlpha.fields.table.Pagination.buildItemsTotal(this),
                      this.buildPagination(),
                      {
                        class: "header-item",
                        child: KarmaFieldsAlpha.fields.table.Pagination.buildCloseTableButton(this)
                      }

                    ];
                  }
                },
                // this.options.build(),
                // {
                //   class: "table-filters",
                //   update: filters => {
                //     const visible = true; //this.tab === "filters";
                //     filters.element.classList.toggle("hidden", !visible);
                //     filters.child = visible && this.filters.build() || null;
                //   }
                // },
                ...this.buildSubsections(),
                {
                  class: "table-body",
                  init: body => {
                    this.content.render = body.render;
                  },
                  update: async body => {

                    await (this.queryPromise || this.query());

                    // if (this.queriedIds && this.queriedIds.length || this.getExtraIds().length) {
                    if (this.getExtraIds().length) {
                      body.child = this.buildGrid();
                    } else {
                      body.child = null;
                    }
                  },
                  complete: () => {
                    this.renderFooter();
                  }
                }
              ],
              // update: main => {
              //   main.children = []
              //   main.children.push({
              //     class: "table-header",
              //     update: (header) => {
              //       header.children = [
              //         {
              //           tag: "h1",
              //           init: h1 => {
              //             h1.element.textContent = this.resource.title || this.resource.key || this.resource.title || "Table";
              //           }
              //         },
              //         KarmaFieldsAlpha.fields.table.Pagination.buildItemsTotal(this),
              //         this.buildPagination(),
              //         {
              //           class: "header-item",
              //           child: KarmaFieldsAlpha.fields.table.Pagination.buildCloseTableButton(this)
              //         }
              //
              //       ];
              //     }
              //   });
              //   // if (this.resource.filters) {
              //   //
              //   // }
              //   main.children.push({
              //     class: "table-filters",
              //     update: filters => {
              //       filters.element.classList.toggle("hidden", !this.resource.filters);
              //     },
              //     child: this.filters.build()
              //   });
              //   main.children.push({
              //     class: "table-body",
              //     init: body => {
              //       this.content.render = body.render;
              //     },
              //     update: async body => {
              //
              //       await (this.queryPromise || this.query());
              //
              //       if (this.queriedIds && this.queriedIds.length || this.getBufferIds().length) {
              //         body.child = this.buildGrid();
              //       } else {
              //         body.child = null;
              //       }
              //     },
              //     complete: () => {
              //       this.renderFooter();
              //     }
              //   });
              //
              // }
            }
          ]
        },
        {
          class: "table-control",
          update: footer => {
            this.renderFooter = footer.render;
            footer.element.classList.toggle("hidden", this.resource.controls === false);
            if (this.resource.controls !== false) {
              footer.children = [
                this.buildControls(),
                {
                  class: "table-control-group table-control-right",
                  children: [
                    // {
                    //   tag: "button",
                    //   class: "karma-button",
                    //   init: button => {
                    //     button.element.innerHTML = '<span class="button-content dashicons dashicons-undo"></span>';
                    //     button.element.onclick = event => {
                    //       history.back();
                    //     }
                    //   },
                    //   update: button => {
                    //     const currentIndex = history.state && history.state.karmaIndex || 0;
                    //     const maxIndex = KarmaFieldsAlpha.History.index || 0;
                    //     button.element.disabled = !(currentIndex > 0);
                    //   }
                    // },
                    // {
                    //   tag: "button",
                    //   class: "karma-button",
                    //   init: button => {
                    //     button.element.innerHTML = '<span class="button-content dashicons dashicons-redo"></span>';
                    //     button.element.onclick = event => {
                    //       history.forward();
                    //     }
                    //   },
                    //   update: button => {
                    //     const currentIndex = history.state && history.state.karmaIndex || 0;
                    //     const maxIndex = KarmaFieldsAlpha.History.index || 0;
                    //     button.element.disabled = !(currentIndex < maxIndex);
                    //   }
                    // }
                  ]
                }
              ];
            }
          }
        }
      ],
      update: async container => {
        // await this.update();
        this.render = container.render;

        this.queryPromise = this.query();

        // const params = KarmaFieldsAlpha.History.getParamsObject();
        //
        // let paramString = KarmaFieldsAlpha.History.getParamString();
        // const params = new URLSearchParams(paramString);
        //
        // if (!params.get("page")) {
        //   params.set("page", "1");
        // }
        //
        // if (!params.get("ppp")) {
        //   params.set("ppp", this.getDefaultPpp() || "");
        // }
        //
        // // if (!params.get("orderby")) {
        // //   const orderby = this.getDefaultOrderby();
        // //   if (orderby) {
        // //     params.set("orderby", orderby);
        // //   }
        // // }
        // //
        // // if (!params.get("order")) {
        // //   const order = this.getDefaultOrder(params.get("orderby"));
        // //   if (order) {
        // //     params.set("order", order);
        // //   }
        // // }
        //
        // params.sort();
        //
        // if (params.toString() !== paramString) {
        //
        //   KarmaFieldsAlpha.History.setParamString(params.toString());
        //
        // }
        //
        // params.delete("id");
        //
        // // let paramString = this.getParamString();
        //
        //
        // if (paramString !== this.paramString) {
        //
        //   this.paramString = paramString;
        //
        //   // KarmaFieldsAlpha.History.setParamsObject(params);
        //
        //   // await this.query(paramString);
        //
        //   // container.element.classList.add("loading");
        //
        //   if (!this.queriedIds) {
        //
        //     // container.element.classList.add("loading");
        //
        //     await this.query(this.paramString);
        //
        //     // this.query(this.paramString).then(() => {
        //     //   container.render();
        //     //   // container.element.classList.remove("loading");
        //     // });
        //
        //     // container.complete = () => {
        //     //   container.element.classList.remove("loading");
        //     //   container.complete = null;
        //     // };
        //
        //   } else {
        //     await this.query(paramString);
        //   }
        //
        //
        //
        //
        //
        //
        //
        //
        //
        // }



      }
      // ,
      // complete: container => {
      //   container.element.classList.remove("loading");
      // }

    };
  }

  buildSubsections() {
    return this.subsections.map(field => {
      return {
  			class: "karma-field-table-section karma-field-frame final",
        child: field.build()
  		};
    });
  }



}
