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
    // this.select = new KarmaFieldsAlpha.SelectionManager(this);

    // this.select.events.copy = function() {
    //   field.copy(this.selection);
    // }
    // this.select.events.cut = async () => {
    //   await this.cut(this.select.selection);
    //   await this.render();
    // }
    // this.select.events.paste = function() {
    //   field.paste(this.selection).then(function() {
    //     field.render();
    //   });
    // }
    // field.select.events.select = function() {
    //   field.renderFooter();
    // };
    // this.select.events.delete = async () => {
    //   await this.delete(this.select.selection);
    //   await this.render();
    // }


    // table managment (extra ids)
    // this.tableManagment = new KarmaFieldsAlpha.fields.formBasic({
    //   driver: resource.driver+"-managment",
    // }, this);
    // // this.tableManagment.prefix = "karma/managment"

    // this.titleForm = new KarmaFieldsAlpha.fields.table.tableFilters({
    //   children: [
    //     {
    //       type: "text",
    //       value: this.resource.title;
    //     }
    //   ]
    // }, this);



    this.subsections = [];

    // filters
    if (resource.filters) {

      // this.filters = this.createChild({
      //   driver: resource.driver, // ->  for fetching options (dropdown)
      //   type: "tableFilters",
      //   ...resource.filters
      // });
      this.filters = new KarmaFieldsAlpha.fields.table.tableFilters({
        driver: resource.driver, // ->  for fetching options (dropdown)
        ...resource.filters
      }, this);
      //
      // this.filters.fetchValue = (expectedType, key) => {
      //   return KarmaFieldsAlpha.Nav.getParam(key) || "";
      // }
      // this.filters.getValue = (key) => {
      //   return KarmaFieldsAlpha.Nav.getParam(key) || "";
      // }
      // this.filters.setValue = (value, key) => {
      //   if (value) {
      //     KarmaFieldsAlpha.Nav.setParam(key, value);
      //   } else  {
      //     KarmaFieldsAlpha.Nav.removeParam(key);
      //   }
      // }
      // this.filters.removeValue = (...path) => {
      //   return KarmaFieldsAlpha.Nav.removeParam(path.join("/"));
      // }
      // this.filters.isModified = () => false;
      // this.filters.getRelatedValue = () => {
      //   console.error("Deprecated getRelatedValue");
      // };
      // this.filters.submit = this.filters.edit = () => {
      //   KarmaFieldsAlpha.Nav.setParam("page", 1);
      //   return this.editParam();
      // }
      // this.filters.backup = () => {
      //   KarmaFieldsAlpha.Nav.backup();
      // }
      // this.filters.getDriver = () => { // for fetching options (dropdown)
      //   return this.resource.driver;
      // }
      // this.filters.write = (...path) => {
      //   // noop
      // }

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


    this.content = new KarmaFieldsAlpha.fields.table.grid({
      driver: resource.driver,
      autosave: resource.autosave
      // prefix: "karma/content"
    }, this);

    // this.addChild(this.content);

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

    this.options = new KarmaFieldsAlpha.fields.table.options({
      driver: resource.driver+"-options",

    }, this);

    this.options.open = true;


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


  // getBufferIds() {
  //   console.error("DEPRECATED getBufferIds");
  //   const ids = [];
  //   const rows = this.content.getDeltaValue();
  //   for (let id in rows) {
  //     if (rows[id].trash !== "1" && (!this.queriedIds || this.queriedIds.indexOf(id) === -1)) {
  //       ids.push(id);
  //     }
  //   }
  //   return ids;
  // }



  // getExtraIds() {
  //
  //   // const ids = this.tableManagment.getValue("ids");
  //   // return ids && ids.split(",") || [];
  //
  //   const ids = [];
  //   const delta = this.getDeltaValue();
  //   for (let id in delta) {
  //     if (delta.extra) {
  //       ids.push(id);
  //     }
  //   }
  //   return ids;
  // }

  // setExtraIds(ids) {
  //   this.extraIds = null;
  //   if (ids && ids.length) {
  //     this.tableManagment.setValue(ids.join(","), "ids");
  //   } else {
  //     this.tableManagment.removeValue("ids");
  //   }
  // }

  // removeExtraIds() {
  //   this.extraIds = null;
  //   this.tableManagment.removeValue("ids");
  // }

  // isExtraId(id) {
  //   return this.getExtraIds().indexOf(id) > -1;
  // }


  editFull() {
    console.error("deprecated");
    return this.render();
  }


  getPage() {
    return Number(KarmaFieldsAlpha.Nav.getParam("page")) || 1;
  }

  getPpp() {
    // return Number(KarmaFieldsAlpha.History.getParam("ppp")) || this.getDefaultPpp();
    return Number(KarmaFieldsAlpha.Nav.getParam("ppp") || this.options.getValue("ppp") || this.getDefaultPpp());
  }
  setPpp(ppp) {
    this.options.setValue(null, [ppp], "ppp");
  }

  getDefaultPpp() {
    return this.resource.ppp || "20";
  }

  getDefaultOrderby() {
    if (!this.defaultOrderby) {
      this.defaultOrderby = this.resource.orderby;
      if (!this.defaultOrderby) {
        const column = this.resource.columns.find(column => (column.orderby || column.field && column.field.key));
        this.defaultOrderby = column && (column.orderby || column.field && column.field.key) || "x";
      }
    }
    return this.defaultOrderby;
  }

  getDefaultOrder() {
    if (!this.defaultOrder) {
      const column = this.resource.orderby && this.resource.columns.find(column => (column.orderby || column.field && column.field.key) === this.resource.orderby);
      this.defaultOrder = column && column.order || "asc";
    }
    return this.defaultOrder;
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

    const params = new URLSearchParams(KarmaFieldsAlpha.Nav.params);

    if (!params.has("page")) {
      params.set("page", "1");
    }

    if (!params.has("ppp")) {
      params.set("ppp", this.getPpp());
    }

    if (!params.has("orderby")) {
      const orderby = this.getDefaultOrderby();
      if (orderby) {
        params.set("orderby", orderby);
      }
    }

    if (!params.has("order")) {
      const order = this.getDefaultOrder(params.get("orderby"));
      if (order) {
        params.set("order", order);
      }
    }

    params.sort();

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

    console.error("deprecated query");
    const paramString = this.getParamString();

    if (paramString !== this.paramString) {

      this.paramString = paramString;

      // const results = await KarmaFieldsAlpha.Gateway.getTable(this.resource.driver, this.paramString);
      //
      // this.count = results.count;
      //
      // this.queriedIds = results.ids;

      // const results = await KarmaFieldsAlpha.Gateway.getTable2(this.resource.driver, this.paramString);
      //
      // this.count = results.count;
      //
      // this.queriedIds = (results.items || results || []).map(row => row.id.toString());

      // this.tablePromise = KarmaFieldsAlpha.Gateway.getTable3(this.resource.driver, this.paramString);
      //
      // await this.tablePromise;

      // this.count = results.count;

      // this.queriedIds = (results.items || results || []).map(row => row.id.toString());

    }

  };

  async sync() {

    const results = await this.content.save();


    // this.tableManagment.write("ids");

    // const ids = this.content.getExtraIds();
    //
    // if (ids.length) {
    //
    //   ids.forEach(id => this.write(id, "extra"));
    //
    //   KarmaFieldsAlpha.History.backup();
    //   // this.removeExtraIds();
    //
    //   ids.forEach(id => this.removeValue(id, "extra"));
    //
    // }

    // this.content.removeDeltaValue();

    // this.content.removeExtra();

    // this.paramString = null;


    return results;
  };


  // async add(num, noBackup) {
  //   // const results = await KarmaFieldsAlpha.Form.add(this.resource.driver, {num: num || 1})
  //   //
  //   // const ids = results.map(item => (item.id || item).toString());
  //
  //
  //   const ids = await KarmaFieldsAlpha.Gateway.add(this.resource.driver, {num: num || 1});
  //
  //
  //
  //   // const rows = ids.map(id => this.getRow(id));
  //   //
  //   //
  //   // await Promise.all(rows.map(row => row.setDefault()));
  //
  //
  //   for (let id of ids) {
  //
  //     for (let field of this.getRow(id).getDescendants()) {
  //
  //       const path = field.getPath();
  //
  //       this.content.buffer.set(field.getEmpty(), ...path);
  //       this.content.setDeltaValue(await field.getDefault(), ...path);
  //       this.content.writeHistory(null, ...path);
  //
  //     }
  //
  //     this.content.writeHistory("1", id, "trash");
  //
  //     // const defaultValue = await this.getRow(id).getDefault();
  //     //
  //     //
  //     // KarmaFieldsAlpha.DeepObject.forEach(defaultValue, (value, key) => {
  //     //   if (key !== undefined) {
  //     //     this.content.buffer.set(value, id, key);
  //     //     this.content.setDeltaValue(value, id, key);
  //     //     this.content.writeHistory(null, id, key);
  //     //   }
  //     // });
  //   }
  //
  //
  //   // this.writeHistory(null, ...path);
	// 	// this.setDeltaValue(value, ...path);
  //
  //
  //
  //   // ids.forEach(id => {
  //   //   this.content.writeHistory("1", id, "trash");
  //   //
  //   //   // this.content.writeHistory(null, id, "extra");
  //   //   // this.content.writeHistory(null, id, "extra");
  //   //   // this.content.registerValue("1", id, "trash");
  //   //   // this.content.writeHistory(null, id);
  //   //
  //   //   // this.content.writeExtra("1", id, "trash");
  //   //
  //   // });
  //
  //
  //   // if (!noBackup) {
  //   //   this.content.backup(["add"]);
  //   //   // this.backup(["add"]);
  //   // }
  //
  //   // debugger;
  //
  //   // await Promise.all(rows.map(row => row.fill(null)));
  //
  //   // this.tableManagment.write("ids");
  //
  //   // this.backup(["ids"]);
  //
  //   // this.ids.add(ids);
  //
  //   KarmaFieldsAlpha.History.backup();
  //
  //   // this.setExtraIds(this.getExtraIds().concat(ids));
  //   // this.extraIds = this.extraIds.concat(ids);
  //
  //   // await Promise.all(rows.map(row => row.fill())); // -> also set trash to "0"
  //
  //
  //
  //   // ids.forEach(id => {
  //   //   this.content.write(id);
  //   //
  //   //
  //   //   // this.content.setDeltaValue("1", id, "extra");
  //   //
  //   //   // this.content.setExtra("1", id, "trash");
  //   //   // this.content.setExtra(0, id, "index");
  //   //
  //   //   // this.content.registerValue("1", id, "trash");
  //   //   this.content.setValue("0", id, "trash");
  //   //
  //   //   // this.content.setValue("0", id, "extra");
  //   // });
  //
  //   for (let id of ids) {
  //
  //     await this.content.write(id);
  //
  //     await this.content.setValue(null, "0", id, "trash");
  //
  //   }
  //
  //
  //
  //
  //   // this.queriedIds = ids.concat(this.queriedIds);
  //   // await this.content.ids.add(ids);
  //
  //   // this.setExtraIds(this.getExtraIds().concat(ids));
  //     // this.setExtraIds([...ids, ...this.getExtraIds()]);
  //
  //   // if (this.getModalColumn() && ids.length === 1) {
  //   //   KarmaFieldsAlpha.History.setParam("id", ids[0]);
  //   // }
  //
  //   // if (KarmaFieldsAlpha.History.hasParam("id")) {
  //   //   if (ids.length === 1) {
  //   //     KarmaFieldsAlpha.History.setParam("id", ids[0]);
  //   //   } else {
  //   //     KarmaFieldsAlpha.History.removeParam("id");
  //   //   }
  //   //
  //   // }
  //
  //   return ids;
  // }

  // async getSelectedIds() {
  //   console.error("deprecated (use table.content.getSelectedIds)");
  //   if (KarmaFieldsAlpha.Nav.hasParam("id")) {
  //     return [KarmaFieldsAlpha.Nav.getParam("id")];
  //   } else if (this.select.selection && this.select.selection.width === this.select.grid.width) {
  //     const ids = await this.content.getIds();
  //     return ids.slice(this.select.selection.y, this.select.selection.y+this.select.selection.height);
  //   }
  //   return [];
  // }
  //
  // async getSelectedFields() {
  //   console.error("deprecated");
  //
  //   const ids = await this.content.getIds();
  //   const selection = this.select.selection;
  //   const fields = [];
  //
  //   if (selection) {
  //
  //     for (let j = 0; j < selection.height; j++) {
  //
  //       const rowField = this.getRow(ids[j+selection.y]);
  //       const row = [];
  //
  //       for (let i = 0; i < selection.width; i++) {
  //
  //         const field = rowField.children[i+selection.x];
  //         row.push(field);
  //
  //       }
  //
  //       fields.push(row);
  //
  //     }
  //
  //   }
  //
  //   return fields;
  // }

  // async exportSelection() {
  //   const fields = this.getSelectedFields();
  //
  //   const data = [];
  //
  //   for (let row of fields) {
  //
  //     const dataRow = [];
  //
  //     for (let field of row) {
  //
  //       const value = await field.exportValue();
  //
  //       dataRow.push(value);
  //
  //     }
  //
  //     data.push(dataRow);
  //
  //   }
  //
  //   return data;
  // }

  // async importSelection(data, id) {
  //   const selection = this.select.selection;
  //
  //   console.time();
  //
  //   if (selection) {
  //
  //     const x = selection.x;
  //     const y = selection.y;
  //
  //     let ids = await this.content.getIds();
  //
  //     for (let j = 0; j < Math.max(selection.height, data.length); j++) {
  //       const rowField = this.content.getChild(ids[j+y]);
  //       if (rowField) {
  //         for (let i = 0; i < Math.max(selection.width, data[j%data.length].length); i++) {
  //           const cellField = rowField.children[i+x];
  //           if (cellField) {
  //             await cellField.write();
  //           }
  //         }
  //       }
  //     }
  //
  //     if (data.length > ids.length-y) {
  //       await this.add(data.length-(ids.length-y), false); // -> will backup
  //       ids = await this.content.getIds();
  //     } else if (id !== KarmaFieldsAlpha.History.id) {
  //       KarmaFieldsAlpha.History.backup();
  //       KarmaFieldsAlpha.History.id = id;
  //     }
  //
  //     for (let j = 0; j < Math.max(selection.height, data.length); j++) {
  //       const rowField = this.content.getChild(ids[j+y]);
  //       for (let i = 0; i < Math.max(selection.width, data[j%data.length].length); i++) {
  //         const cellField = rowField.children[i+x];
  //         const value = data[j%data.length][i%data[j%data.length].length];
  //         await cellField.importValue(value);
  //         await cellField.render();
  //       }
  //     }
  //
  //
  //
  //   }
  //
  // }


  // async remove() {
  //   let ids = await this.content.getSelectedIds();
  //
  //   if (ids.length) {
  //
  //     // const ids = await this.content.getIds();
  //     // const index = Math.max(ids.indexOf(ids[0]), 0);
  //
  //
  //     // const rows = ids.map(id => this.content.getChild(id));
  //     // const rows = ids.map(id => this.getRow(id));
  //
  //     ids.forEach(id => {
  //       this.content.writeHistory("0", id, "trash");
  //
  //       // this.content.writeHistory(null, id, "extra");
  //       // this.content.writeHistory(null, id);
  //     });
  //
  //     // await Promise.all(rows.map(row => {
  //     //   row.write();
  //     //
  //     //   return row.trash.setValue("0");
  //     // }));
  //     //
  //     // let isSomeExtra = this.getExtraIds().some(id => ids.indexOf(id) > -1);
  //     //
  //     // if (isSomeExtra) {
  //     //   this.tableManagment.write("ids");
  //     // }
  //
  //
  //
  //     KarmaFieldsAlpha.History.backup();
  //
  //
  //     // await Promise.all(rows.map(row => {
  //     //   row.removeValue();
  //     //   return row.trash.setValue("1");
  //     // }));
  //
  //     ids.forEach(id => {
  //       this.content.setValue(null, "1", id, "trash");
  //
  //       // this.content.setValue(index.toString(), id, "extra");
  //     });
  //
  //     // this.queriedIds = this.queriedIds.filter(id => ids.indexOf(id) === -1);
  //
  //     // if (isSomeExtra) {
  //     //   this.setExtraIds(this.getExtraIds().filter(id => ids.indexOf(id) === -1));
  //     // }
  //
  //
  //     // if modal open -> moved to control button
  //     // KarmaFieldsAlpha.History.removeParam("id");
  //     //
  //     // await this.editParam();
  //
  //   }
  // }
  //
  // async duplicate() {
  //   let ids = await this.content.getSelectedIds();
  //
  //   if (ids.length) {
  //     const cloneIds = await this.add(ids.length);
  //
  //     for (let i = 0; i < ids.length; i++) {
  //       let id = ids[i];
  //       let cloneId = cloneIds[i];
  //
  //       // duplicate types
  //       // let types = KarmaFieldsAlpha.Type.get(this.resource.driver, id);
  //       // if (types) {
  //       //   KarmaFieldsAlpha.Type.register(types, this.resource.driver, cloneId);
  //       // }
  //
  //       // duplicate values
  //       // let value = KarmaFieldsAlpha.DeepObject.clone(this.content.getValue(id));
  //       // delete value.id;
  //       // this.content.setValue(value, cloneId);
  //
  //       // replace default values of clone by originals
  //       KarmaFieldsAlpha.DeepObject.forEach(this.content.getDeltaValue(cloneId), (value, key) => {
  //         if (key) {
  //           this.content.setValue(null, this.content.getValue(id, key), cloneId, key);
  //         }
  //       });
  //
  //
  //
  //       const contentIds = await this.content.getIds();
  //
  //       let index = contentIds.indexOf(ids[ids.length-1]);
  //       // this.content.setValue(index.toString(), id, "extra");
  //       this.content.setOrder(cloneId, index+1);
  //
  //     }
  //
  //
  //
  //   }
  // }
  //
  // // async function
  // // reorder(column) {
  // //   const params = KarmaFieldsAlpha.Nav.getParamsObject();
  // //   // const orderby = this.getParam("orderby");
  // //   // const order = this.getParam("order");
  // //   const orderby = params.get("orderby"); // || this.getDefaultOrderby();
  // //   const order = params.get("order"); // || this.getDefaultOrder(orderby);
  // //   const key = column.orderby || column.field.key;
  // //
  // //   if (key) {
  // //     if (orderby === key) {
  // //       params.set("order", order === "asc" ? "desc" : "asc");
  // //     } else {
  // //       params.set("order", column.order || "asc");
  // //       params.set("orderby", key);
  // //     }
  // //     params.set("page", 1);
  // //     KarmaFieldsAlpha.Nav.setParamsObject(params);
  // //     return this.editParam();
  // //   }
  // //
  // // }
  //
  //
  // async selectRow(rowId) {
  //   // const ids = await this.content.getIds();
  //   // let index = ids.indexOf(rowId);
  //   // if (index > -1) {
  //   //   this.select.setFocus({x:0, y:index});
  //   // }
  //   const ids = await this.content.getIds();
  //   let index = ids.indexOf(rowId);
  //   if (index > -1) {
  //     this.content.manager.growSelection({x: 0, y: index, width: this.content.manager.grid.width, height: 1});
  //   }
  //
  //
  //
  // }

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

  async getSelectedRowIds(key) {
    const selection = this.select.selection;
    // const ids = this.getCurrentIds();
    // const selectedIds = [];
    // for (var j = 0; j < selection.height; j++) {
    //   selectedIds.push(ids[j+selection.y]);
    // }
    // return pathes;
    //

    const ids = await this.content.getIds();

    return selection && ids.slice(selection.y, selection.y+selection.height) || [];
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

  // async copy(selection) {
  //   // const field = this;
  //
  //   if (navigator.clipboard && navigator.clipboard.writeText) {
  //     const ids = await this.content.getIds();
  //
  //     var rows = [];
  //     for (var j = 0; j < selection.height; j++) {
  //       var cols = [];
  //       const row = this.content.getChild(ids[j+selection.y]);
  //       for (var i = 0; i < selection.width; i++) {
  //         const cell = row.children[i+selection.x];
  //         const valuePromise = cell.exportValue(selection.width === 1);
  //         cols.push(valuePromise);
  //       }
  //       rows.push(cols);
  //     }
  //
  //
  //
  //     if (rows.length) {
  //       const items = await Promise.all(rows.map(cols => {
  //         return Promise.all(cols).then(cols => {
  //           return cols.join("\t")
  //         });
  //       }));
  //
  //       const text = items.join("\n");
  //
  //       if (text.replace(/[\n\r\s]/g, "").length > 0) {
  //         await navigator.clipboard.writeText(text);
  //       }
  //
  //     }
  //
  //   }
  // }

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

  // async paste(selection) {
  //
  //   const field = this;
  //   const x = selection.x;
  //   const y = selection.y;
  //   // let width = selection.width;
  //   // let height = selection.height;
  //
  //   // console.log(selection);
  //
  //   let ids = await this.content.getIds();
  //   // let ids = this.content.ids;
  //   // const state = await navigator.permissions.query({ name: "clipboard-read" });
  //
  //   // const state = await navigator.permissions.query({name:'geolocation'});
  //   //
  //   // console.log(state);
  //
  //   // const {state} = await navigator.permissions.query({name:'clipboard-write'})
  //
  //
  //   const text = await navigator.clipboard.readText();
  //
  //   if (text) {
  //     let textRows = text.split(/[\r\n]/).map(row => row.split("\t"));
  //
  //     // write all fields
  //     // for (let j = 0; j < rows.length; j++) {
  //     for (let j = 0; j < Math.max(selection.height, textRows.length); j++) {
  //       const rowField = this.content.getChild(ids[j+y]);
  //       if (rowField) {
  //         for (let i = 0; i < Math.max(selection.width, textRows[j%textRows.length].length); i++) {
  //           const cellField = rowField.children[i+x];
  //           if (cellField) {
  //             await cellField.write();
  //           }
  //         }
  //       }
  //     }
  //
  //     if (textRows.length > ids.length-y) {
  //       await this.add(textRows.length-(ids.length-y), false); // -> will backup
  //       ids = await this.content.getIds();
  //       // ids = this.content.ids;
  //     } else {
  //       KarmaFieldsAlpha.History.backup();
  //     }
  //
  //     // const promises = [];
  //     for (let j = 0; j < Math.max(selection.height, textRows.length); j++) {
  //       const rowField = this.content.getChild(ids[j+y]);
  //       for (let i = 0; i < Math.max(selection.width, textRows[j%textRows.length].length); i++) {
  //         const cellField = rowField.children[i+x];
  //         const value = textRows[j%textRows.length][i%textRows[j%textRows.length].length];
  //         // const promise = cellField.importValue(value);
  //         await cellField.importValue(value);
  //
  //         // promises.push(promise);
  //       }
  //     }
  //     await Promise.all(promises);
  //
  //     // await this.content.edit();
  //   }
  // }


  // async cut(selection) {
  //
  //   await this.copy(selection);
  //   await this.delete(selection);
  //   // let ids = this.content.ids;
  //   //
  //   // for (let j = 0; j < selection.height; j++) {
  //   //   const rowField = this.content.getChild(ids[j+selection.y]);
  //   //   if (rowField) {
  //   //     for (let i = 0; i < selection.width; i++) {
  //   //       const cellField = rowField.children[i+selection.x];
  //   //       if (cellField) {
  //   //         cellField.write();
  //   //       }
  //   //     }
  //   //   }
  //   // }
  //   //
  //   // KarmaFieldsAlpha.History.backup();
  //   //
  //   // const promises = [];
  //   //
  //   // for (let j = 0; j < selection.height; j++) {
  //   //   for (let i = 0; i < selection.width; i++) {
  //   //     promises.push(this.content.getChild(ids[j+selection.y]).children[i+selection.x].setDefault());
  //   //   }
  //   // }
  //   //
  //   // await Promise.all(promises);
  // }
  //
  // async delete(selection) {
  //
  //   let ids = await this.content.getIds();
  //
  //   for (let j = 0; j < selection.height; j++) {
  //     const rowField = this.content.getChild(ids[j+selection.y]);
  //     if (rowField) {
  //       for (let i = 0; i < selection.width; i++) {
  //         const cellField = rowField.children[i+selection.x];
  //         if (cellField) {
  //           cellField.write();
  //         }
  //       }
  //     }
  //   }
  //
  //   KarmaFieldsAlpha.History.backup();
  //
  //   const promises = [];
  //
  //   for (let j = 0; j < selection.height; j++) {
  //     for (let i = 0; i < selection.width; i++) {
  //       const field = this.content.getChild(ids[j+selection.y]).children[i+selection.x];
  //       const defaultValue = await field.getDefault();
  //       field.setValue(null, defaultValue);
  //     }
  //   }
  //
  //   await Promise.all(promises);
  // }



  // async editAll() {
  //   // console.log(conductor, value);
  //   if (this.select && this.select.selection && this.select.focusRect && this.select.selection.height > 1) {
  //
  //     let ids = this.getCurrentIds();
  //     let field = this.content.getChild(ids[this.select.focusRect.y]).children[this.select.focusRect.x+1];
  //     let value = await field.fetchValue();
  //
  //     field.backup();
  //
  //     const promises = [];
  //
  //     for (var j = 0; j < this.select.selection.height; j++) {
  //       if (j+this.select.selection.y !== this.select.focusRect.y) {
  //         const rowField = this.content.getChild(ids[j+this.select.selection.y]);
  //         const cellField = rowField.children[this.select.focusRect.x+1];
  //         cellField.setValue(value);
  //
  //         promises.push(cellField.render());
  //       }
  //     }
  //
  //     await Promise.all(promises);
  //
  //     // await this.render();
  //   }
  // }

  getIds() {
    console.error("Deprecated getIds()");
    return this.queriedIds;
  }

  getCurrentIds() {
    console.error("Deprecated getCurrentIds()");
    // return this.getExtraIds().concat(this.queriedIds || []);
    return this.queriedIds || [];
  }

  async getCount() {
    const results = await this.content.getRemoteTable();
    return Number(results && results.count || 0);
  }


  // hasIndex() {
  //   return this.resource.index || this.resource.index === undefined;
  // }
  //
  // getIndexTitle() {
  //   return this.resource.index && this.resource.index.title || "#";
  // }
  //
  // getIndexWidth() {
  //   return this.resource.index && this.resource.index.width || "auto";
  // }
  //
  // getColumns() {
  //   return this.resource.columns || [];
  // }
  //
  // hasHeader() {
  //   return true;
  // }


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

  // buildHeaderCell(column) {
  //   return {
  //     class: "th karma-field",
  //     update: th => {
  //       th.children = [
  //         {
  //           tag: "a",
  //           class: "header-cell-title",
  //           init: a => {
  //             a.element.textContent = column.title;
  //           }
  //         }
  //       ];
  //       if (column.sortable) {
  //         // th.children.push(KarmaFieldsAlpha.fields.table.Controls.buildOrderLink(this, column));
  //         th.children.push(this.getButton("orderLink").build(column));
  //       }
  //     }
  //   };
  // }
  //
  // buildIndexCell(rowIndex) {
  //   return {
  //     class: "th table-row-index karma-field",
  //     update: th => {
  //       if (rowIndex < 0) {
  //         th.element.textContent = "+";
  //       } else {
  //         let page = parseInt(this.getPage());
  //         let ppp = parseInt(this.getPpp());
  //         th.element.textContent = (page - 1)*ppp + rowIndex + 1;
  //       }
  //       // let page = this.getPage();
  //       // let ppp = this.getPpp();
  //       // th.element.textContent = (page - 1)*ppp + rowIndex + 1;
  //     }
  //   };
  // }

  // buildGrid() {
  //   return {
  //     class: "table grid",
  //     init: async grid => {
  //       if (this.resource.style) {
	// 				grid.element.style = this.resource.style;
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
  //         this.getColumns().forEach((column, colIndex) => {
  //           grid.children.push(this.buildHeaderCell(column));
  //         });
  //       }
  //
  //       // const rows = this.getCurrentIds().map(id => this.getRow(id)).filter(row => row.trash.getValue() !== "1").forEach((rowField, rowIndex) => {
  //
  //       // const extraRows = this.getBufferIds().map(id => this.getRow(id));
  //       const extraIds = this.getExtraIds().filter(id => !this.queriedIds.includes(id));
  //       // const extraRows = extraIds.map(id => this.getRow(id));
  //
  //       // extraRows.forEach((rowField, rowIndex) => {
  //       //   if (this.hasIndex()) {
  //       //     grid.children.push(this.buildIndexCell(-1));
  //       //   }
  //       //
  //       //   this.getColumns().forEach((column, colIndex) => {
  //       //     const cellField = rowField.children[colIndex+1];
  //       //     if (cellField) {
  //       //       grid.children.push(cellField.build());
  //       //     }
  //       //   });
  //       // });
  //
  //       // const rows = (this.queriedIds || []).filter(id => extraIds.indexOf(id) === -1).map(id => this.getRow(id)).filter(row => {
  //       //   return row.trash.getValue() !== "1";
  //       // });
  //
  //       this.queriedIds = [...extraIds, ...this.queriedIds];
  //
  //       const rows = (this.queriedIds || []).map(id => this.getRow(id));
  //
  //       // this.queriedIds = rows.map(row => row.resource.key); // -> update queriedIds (prevent errors on copy/past)
  //
  //       // rows.forEach((rowField, rowIndex) => {
  //       //   if (this.hasIndex()) {
  //       //     grid.children.push(this.buildIndexCell(rowIndex));
  //       //   }
  //       //
  //       //   this.getColumns().forEach((column, colIndex) => {
  //       //     const cellField = rowField.children[colIndex+1];
  //       //     if (cellField) {
  //       //       grid.children.push(cellField.build());
  //       //     }
  //       //   });
  //       // });
  //
  //       let index = 0;
  //
  //       rows.forEach(rowField => {
  //         if (this.hasIndex()) {
  //           // let rowIndex;
  //           // if (rowField.getValue("trash") !== "1") {
  //           //   rowIndex = ++index;
  //           // }
  //           let rowIndex = rowField.getValue("trash") !== "1" && ++index;
  //           grid.children.push({
  //             class: "th table-row-index karma-field",
  //             update: th => {
  //               th.element.textContent = rowIndex && (parseInt(this.getPage()) - 1)*parseInt(this.getPpp()) + rowIndex || "+";
  //               // if (rowIndex) {
  //               //
  //               //   let page = parseInt(this.getPage());
  //               //   let ppp = parseInt(this.getPpp());
  //               //   th.element.textContent = (page - 1)*ppp + rowIndex + 1;
  //               // } else {
  //               //   th.element.textContent = "+";
  //               // }
  //               // let page = this.getPage();
  //               // let ppp = this.getPpp();
  //               // th.element.textContent = (page - 1)*ppp + rowIndex + 1;
  //             }
  //           });
  //         }
  //
  //         this.getColumns().forEach((column, colIndex) => {
  //           const cellField = rowField.children[colIndex+1];
  //           if (cellField) {
  //             grid.children.push(cellField.build());
  //           }
  //         });
  //       });
  //
  //       grid.element.style.gridTemplateColumns = (this.hasIndex() && this.hasHeader() && [this.getIndexWidth()] || []).concat(this.getColumns().map((column) => {
  //         return column.width || "1fr";
  //       })).join(" ");
  //
  //     },
  //     complete: grid => {
  //       this.select.registerTable(grid.element, this.getColumns().length, this.content.children.length, this.hasIndex(), this.hasHeader());
  //     }
  //   };
  //
  // }

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

  // buildPagination() {
  //   return {
  //     class: "table-pagination",
  //     update: async container => {
  //       container.element.classList.add("loading");
  //       await (this.queryPromise || this.query());
  //       const count = this.getCount() || 0;
  //       const ppp = parseInt(this.getPpp());
  //       container.element.classList.toggle("hidden", count <= ppp);
  //       container.element.classList.remove("loading");
  //     },
  //     children: ["firstPage", "prevPage", "currentPage", "nextPage", "lastPage"].map(resource => this.getButton(resource).build())
  //     // children: [
  //     //   KarmaFieldsAlpha.fields.table.Pagination.buildFirstPageButton(this),
  //     //   KarmaFieldsAlpha.fields.table.Pagination.buildPrevPageButton(this),
  //     //   KarmaFieldsAlpha.fields.table.Pagination.buildCurrentPageElement(this),
  //     //   KarmaFieldsAlpha.fields.table.Pagination.buildNextPageButton(this),
  //     //   KarmaFieldsAlpha.fields.table.Pagination.buildLastPageButton(this)
  //     // ]
  //   };
  // }

  // buildControls() {
  //   return {
  //     class: "table-control-group table-edit",
  //     children: (this.resource.controls || ["save", "add", "delete"]).map(resource => {
  //       // return (KarmaFieldsAlpha.fields.table[resource.type || resource] || KarmaFieldsAlpha.fields.table.button).build(this, resource);
  //       //
  //       // const constructor = KarmaFieldsAlpha.fields.table[resource.type || resource] || KarmaFieldsAlpha.fields.table.button;
  //       // const button = new constructor(this, resource);
  //       // return button.build();
  //
  //       return this.getButton(resource).build();
  //     })
  //     // children: [
  //     //   {
  //     //     tag: "button",
  //     //     class: "karma-button",
  //     //     init: button => {
  //     //       button.element.innerHTML = '<span class="dashicons dashicons-image-rotate" style="transform:scaleX(-1);"></span>';
  //     //       button.element.onclick = async event => {
  //     //         button.element.classList.add("loading");
  //     //
  //     //         KarmaFieldsAlpha.Gateway.original = {};
  //     //         KarmaFieldsAlpha.Gateway.clearCache();
  //     //
  //     //         await this.render();
  //     //         button.element.classList.remove("loading");
  //     //       }
  //     //     }
  //     //
  //     //   },
  //     //   KarmaFieldsAlpha.fields.table.Controls.buildSaveButton(this),
  //     //   // KarmaFieldsAlpha.fields.table.Controls.buildUndoButton(this),
  //     //   // KarmaFieldsAlpha.fields.table.Controls.buildRedoButton(this),
  //     //   KarmaFieldsAlpha.fields.table.Controls.buildAddButton(this),
  //     //   KarmaFieldsAlpha.fields.table.Controls.buildDeleteButton(this)
  //     // ]
  //   };
  // }

  // buildModalNav() {
  //   return {
  //     class: "footer-group modal-navigation",
  //     children: [
  //       KarmaFieldsAlpha.fields.table.Pagination.buildPrevModalButton(this),
  //       KarmaFieldsAlpha.fields.table.Pagination.buildNextModalButton(this)
  //     ]
  //   };
  // }


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

                const id = KarmaFieldsAlpha.Nav.getParam("id");
                const field = id && this.getModalField(id);

                h1.children = field && [field.createTitle().build()] || [];

                // h1.child = field && field.createTitle().build();

							}
						},
            {
              class: "modal-navigation",
              children: [
                this.getButton("prevModal").build(),
                this.getButton("nextModal").build(),
                this.getButton("closeModal").build(),
                // KarmaFieldsAlpha.fields.table.Pagination.buildPrevModalButton(this),
                // KarmaFieldsAlpha.fields.table.Pagination.buildNextModalButton(this),
                // KarmaFieldsAlpha.fields.table.Pagination.buildCloseModalButton(this)
              ]
            }
					]
				},
				{
					class: "karma-modal-body karma-field-frame",
					update: frame => {
            const id = KarmaFieldsAlpha.Nav.getParam("id");
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

  build() {

    return {
      class: "karma-field-table",
      init: table => {
        // if (this.resource.style) {
        //   table.element.style = this.resource.style;
        // }

        // document.addEventListener("keydown", event => {
        //
        //
        //   if (event.key === "s" && event.metaKey) {
        //     console.log(event);
        //     event.preventDefault();
        //     event.stopPropagation();
        //   }
        // });


      },
      children: [
        {
          class: "table-view",

          children: [
            {
              class: "table-modal",
              update: single => {
                this.renderModal = single.render;
                let percentWidth = this.options.getValue("modalWidth") || 100;
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
                          this.options.setValue(null, percentWidth, "modalWidth")
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
                    header.children = (this.resource.header || ["title", "total", "settings", "pagination", "close"]).map(resource => this.getButton(resource).build())
                  }
                },
                {
                  class: "table-body karma-field-table-columns",
                  init: body => {
                    this.renderBody = body.render;
                  },
                  children: [
                    {
                      class: "karma-field-table-column grid-column",
                      children: [
                        ...this.buildSubsections(),
                        this.content.build()
                      ]
                    },
                    {
                      class: "karma-field-table-column options-column",
                      update: column => {
                        column.element.classList.toggle("hidden", !this.options.open);
                        column.children = this.options.open && [
                          this.options.build()
                          // {
                          //   class: "karma-field-frame final",
                          //   // init: frame => {
                          //   //   frame.element.textContent = "Options"
                          //   // }
                          //   child:
                          // }
                        ] || [];
                      },
                      child: {
                        class: "karma-field-frame final",
                        init: frame => {
                          frame.element.textContent = "Options"
                        }
                      }
                    }
                  ]

                }

              ]

            }
          ]
        },
        {
          class: "table-control",
          update: footer => {
            this.renderFooter = footer.render;
            footer.element.classList.toggle("hidden", this.resource.controls === false);

            // compat
            if (this.resource.controls && this.resource.controls instanceof Array) {
              this.resource.controls.left = this.resource.controls;
            }

            if (this.resource.controls !== false) {
              footer.children = [
                // this.buildControls(),
                {
                  class: "table-control-group table-edit",
                  children: (this.resource.controls && this.resource.controls.left || ["save", "add", "delete"]).map(resource => {
                    return this.getButton(resource).build();
                  })
                },
                {
                  class: "table-control-group table-control-right",
                  children: (this.resource.controls && this.resource.controls.right || ['undo', 'redo']).map(resource => {
                    return this.getButton(resource).build();
                  })
                }
              ];
            }
          }
        }
      ],
      update: async container => {
        // await this.update();
        this.render = container.render;

        // this.queryPromise = this.query();
        this.content.tablePromise = null;
        this.content.relationPromise = null;

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

  getButton(resource) {

    if (typeof resource === "string") {
      resource = {type: resource};
    }

    if (!resource.type || !KarmaFieldsAlpha.fields.table[resource.type]) {
      console.error("Table error: button ["+resource.type+"] does not exist");
    }

    if (!this.buttons) {
      this.buttons = {};
    }

    if (!this.buttons[resource.type]) {
      this.buttons[resource.type] = new KarmaFieldsAlpha.fields.table[resource.type]();
      this.buttons[resource.type].parent = this;
      this.buttons[resource.type].table = this;
      this.buttons[resource.type].resource = resource;
    }

    return this.buttons[resource.type];
  }



}
