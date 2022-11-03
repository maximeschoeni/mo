
KarmaFieldsAlpha.field.table = class extends KarmaFieldsAlpha.field {

  static pile = [];

  constructor(...params) {
    super(...params);

    if (!this.resource.driver) {
      console.error("Driver not defined");
    }


    // compat

    if (this.resource.columns) {
      this.resource.children = this.resource.columns.map(column => {
        return {
          ...column,
          ...column.field
        };
      });
    }



    if (typeof this.resource.driver === "string") {

      const [request, ...joins] = this.resource.driver.split("+");
      const [driver, paramString] = request.split("?");

      this.driver = driver;
      this.params = this.resource.params || paramString && KarmaFieldsAlpha.Nav.toObject(paramString) || "";
      this.joins = this.resource.joins || joins || [];

      // console.log(this.driver, this.params, this.joins);

    } else {

      this.driver = this.resource.driver.name;
      this.params = this.resource.params || this.resource.driver.params;
      this.joins = this.resource.joins || this.resource.driver.joins || [];

    }


    // this.history = new KarmaFieldsAlpha.Buffer("history");
    // this.store = new KarmaFieldsAlpha.Store(this.driver, this.joins);


    this.optionsBuffer = new KarmaFieldsAlpha.Buffer("options", this.driver);
    // this.extraIdBuffer = new KarmaFieldsAlpha.Buffer("extraids", this.driver);

    this.idsBuffer = new KarmaFieldsAlpha.Buffer("state", this.resource.id, "ids");


    this.server = this.createChild({
      type: "gateway",
      driver: this.driver,
      params: this.params,
      joins: this.joins
    }, "server");

    // this.grid = this.server.createChild({
    //   type: "form",
    //   bufferPath: ["data", this.driver],
    //   driver: this.driver // -> for history
    //   // key: "content",
    // }, "form");
    //
    //
    // this.interface = this.grid.createChild({
    //   type: "interface",
    //   id: "interface",
    //   context: this.resource.id, // -> selection buffer
    //   children: this.resource.children,
    //   style: this.resource.style // -> to be improved...
    // }, "interface");

    this.interface = this.server.createChild({
      // type: "form",
      bufferPath: ["data", this.driver],
      driver: this.driver, // -> for history
      // key: "content",
    // }, "form");
    //
    //
    // this.interface = this.grid.createChild({
      type: "interface",
      // id: "interface",
      context: this.resource.id, // -> selection buffer
      children: this.resource.children,
      style: this.resource.style, // -> deprec: use this.resource.content.style
      ...this.resource.content
    }, "interface");


    if (this.resource.modal) {

      this.modal = this.interface.createChild({
        type: "modal",
        ...this.resource.modal
      });

    }



    this.controls = this.createChild({
      id: "controls",
      type: "controls",
      ...this.resource.controls
    });

    // this.header = this.createTablePart({
    //   id: "header",
    //   type: "header",
    //   ...this.resource.header
    // });

    // this.options = this.createChild({
    //   type: "button",
    //   title: "Options",
    //   id: "options-"+this.resource.driver,
    //   action: "toggle-options",
    //   modal: {
    //     id: "form",
    //     key: "options",
    //     type: "form",
    //     children: [
    //       {
    //         type: "input",
    //         key: "ppp",
    //         label: "Items number",
    //         input: {type: "number", style: "max-width:5em;"}
    //       },
    //       {
    //         type: "checkboxes",
    //         key: "columns",
    //         label: "Display columns",
    //         options: this.resource.children.map((child, index) => {
    //           return {
    //             key: index.toString(),
    //             name: child.label
    //           }
    //         })
    //       },
    //       {
    //         type: "group",
    //         display: "flex",
    //         children: [
    //           {
    //             type: "button",
    //             primary: true,
    //             style: "min-width:0",
    //             action: "submit",
    //             disabled: "!modified",
    //             title: "Save"
    //           },
    //           {
    //             type: "button",
    //             style: "min-width:0;",
    //             action: "close-options",
    //             title: "Close"
    //           }
    //         ]
    //       }
    //
    //     ]
    //   }
    // });

  }



  // async getQueriedIds() {
  //   const paramString = this.getParamString();
  //   const results = await this.store.query(paramString);
  //   // return results.map(row => row.id);
  //   return results;
  // }

  async queryIds() {
    const ids = this.idsBuffer.get() || [];
    const params = this.getParams();
    // const paramString = this.getParamString();
    const paramString = KarmaFieldsAlpha.Nav.toString(params);
    const newIds = await this.server.store.queryIds(paramString);
    // if (KarmaFieldsAlpha.DeepObject.differ(newIds, ids)) {
    //   this.idsBuffer.backup(newIds);
    //   this.idsBuffer.set(newIds);
    // }
    this.idsBuffer.change(newIds);

    this.expressionCache.remove();

    // -> for table transfers
    if (KarmaFieldsAlpha.Nav.has("selection")) {
      const selectedIds = KarmaFieldsAlpha.Nav.get("selection").split(",");
      const currentSelection = this.interface.selectionBuffer.get();
      const newSelection = KarmaFieldsAlpha.Segment.fromArrays(newIds, selectedIds);
      if (newSelection && !KarmaFieldsAlpha.Segment.compare(newSelection, currentSelection)) {
        // this.interface.select(newSelection.index, newSelection.length);
        this.interface.selectionBuffer.change(newSelection);
      }
    }
    return ids;
  }

  getParams() {

    const {id, table, selection, language, ...params} = {
      page: 1,
      ppp: 10,
      ...this.params,
      ...KarmaFieldsAlpha.Nav.get()
    };

    return params;

  }

  getCountParams() {

    const {page, ppp, orderby, order, ...params} = this.getParams();

    return params || {};

  }

  getParamString() {



      const params = {
        // ...KarmaFieldsAlpha.Nav.toObject(this.params),
        page: 1,
        ppp: 10,
        ...this.params,
        ...KarmaFieldsAlpha.Nav.get()
      };

      delete params.id;
      delete params.table;
      delete params.selection;

      delete params.language; // -> musée olympique!

      return KarmaFieldsAlpha.Nav.toString(params);
  }

  getCountParamString() {

    const params = {
      // ...KarmaFieldsAlpha.Nav.toObject(this.params),
      ...this.params,
      ...KarmaFieldsAlpha.Nav.get()
    };

    delete params.page;
    delete params.ppp;
    delete params.orderby;
    delete params.order;
    delete params.id;
    delete params.table;
    delete params.selection;

    delete params.language; // -> musée olympique!

    return KarmaFieldsAlpha.Nav.toString(params);

  }

  // used by add()... I think no more used yet...
  getFilterParams() {
    const params = {
      ...this.params,
      ...KarmaFieldsAlpha.Nav.get()
    };

    delete params.page;
    delete params.ppp;
    delete params.orderby;
    delete params.order;
    delete params.id;
    delete params.table;

    delete params.language; // -> musée olympique

    return params;
  }


  async getCount() {

    // const paramString = this.getCountParamString();
    const params = this.getCountParams();
    const paramString = KarmaFieldsAlpha.Nav.toString(params);
    const count = await this.server.store.count(paramString);

    return Number(count || 0);
  }

  // getDefaultOrderby() {
  //   if (!this.resource.orderby && this.resource.children) {
  //     const child = this.resource.children.find(child => child.orderby || child.key);
  //     return child && (child.orderby || child.key) || "default";
  //   }
  //   return this.resource.orderby;
  // }
  //
  // getDefaultOrder() {
  //   const orderby = this.getOrderby();
  //   const child = this.resource.children && this.resource.children.find(child => child.key === orderby);
  //   return child && child.order || "asc";
  // }

  // getOrder() {
  //   // return this.getParam("order") || this.getDefaultOrder();
  //   return KarmaFieldsAlpha.Nav.get("order") || this.getDefaultOrder();
  // }
  //
  // getOrderby() {
  //   // return this.getParam("orderby") || this.getDefaultOrderby();
  //   return KarmaFieldsAlpha.Nav.get("orderby") || this.getDefaultOrderby();
  // }

  getPpp() {
    // return this.getParam("ppp") || this.resource.ppp || 10;
    return Number(KarmaFieldsAlpha.Nav.get("ppp") || this.resource.params && this.resource.params.ppp || 10);
  }

  getColumns() {
    return this.optionsBuffer.get("columns") || this.resource.children.map((column, index) => index.toString()) || [];
  }



  async request(subject, content = {}, ...path) {


    switch (subject) {

      case "get": {
        const [key] = path;
        return KarmaFieldsAlpha.Nav.get(key) || "";
      }

      case "set": {
        const [key] = path;

        const value = KarmaFieldsAlpha.Type.toString(content.data) || "";
        const current = KarmaFieldsAlpha.Nav.get(key) || "";

        if (value !== current) {

          // KarmaFieldsAlpha.Nav.backup(value, key);
          // KarmaFieldsAlpha.Nav.set(value, key); // -> will remove key instead of setting ""

          KarmaFieldsAlpha.Nav.change(value, current, key);

          const page = KarmaFieldsAlpha.Nav.get("page") || "1";

          if (page !== "1") {
            // KarmaFieldsAlpha.Nav.backup(1, "page");
            // KarmaFieldsAlpha.Nav.set(1, "page");

            KarmaFieldsAlpha.Nav.change(1, page, "page");
          }

          // KarmaFieldsAlpha.Nav.edit(); // = pushstate

        }

        // const value = KarmaFieldsAlpha.Type.toString(content.data) || "";
        //
        // if (!KarmaFieldsAlpha.Nav.compare(value, key)) {
        //
        //   KarmaFieldsAlpha.Nav.change(value, undefined, key);
        //
        //   if (!KarmaFieldsAlpha.Nav.compare("1", "page")) {
        //     KarmaFieldsAlpha.Nav.change(1, undefined, "page");
        //   }
        //
        // }

        // this.server.store.empty();
        //
        // await this.queryIds();

        break;
      }

      case "modified": {
        const delta = this.interface.buffer.get(...path);
        // return delta && KarmaFieldsAlpha.DeepObject.differ(delta, this.server.buffer.get(...path)) || false;

        if (delta) {
          // const orig = this.server.buffer.get(...path);
          return KarmaFieldsAlpha.DeepObject.differ(delta, {
            ...await this.server.trashBuffer.get(...path),
            ...await this.server.buffer.get(...path)

          });
        }
        return false;
      }

      case "columns": { // -> column indexes
        return this.getColumns();
      }

      case "column": {
        const data = [];

        const paramString = this.getParamString();
        const ids = this.getIds();
        const key = path[0];

        for (let id of ids) {
          const value = await this.server.store.getValue(id, key);
          data.push(value);
        }

        return data;
      }


      case "row": {
        console.log("deprecated: use export");
        const [id] = path;
        return this.interface.exportRow(id);
      }

      case "rows": {
        console.log("deprecated: use export");
        const ids = await this.getIds();
        const selectedIds = ids.slice(content.index, content.index + content.length);
        const rows = [];

        for (let selectedId of selectedIds) {
          const row = await this.interface.exportRow(selectedId);
          rows.push(row);
        }

        return KarmaFieldsAlpha.Clipboard.toDataArray(data);

        break;
      }

      case "ids": {
        return this.getIds();
      }

      case "selectedIds": {
        const selection = this.interface.selectionBuffer.get();
        if (selection) {
          const ids = this.idsBuffer.get() || [];
          return ids.slice(selection.index, selection.index + selection.length);
        }
        return [];
      }

      // -> used by media "upper-folder"
      case "query-ids": {
        return this.queryIds();
      }

      // -> like get_post()
      // -> for media breadcrumb (ancestors)
      case "queryid": {
        return this.server.store.get(content.id);
        // return KarmaFieldsAlpha.Gateway.get("get/"+this.driver+"/"+content.id);
      }

      case "edit": {
        this.expressionCache.remove();
        // this.server.store.empty();

        this.interface.selectionBuffer.change(null);

        this.server.store.cache.empty(); // buffer need to stay for history
        await this.queryIds();
        await this.render();
        break;
      }

      case "edit-selection": {
        return this.render();
      }

      case "selection":
      case "actives":
        return this.interface.getSelection();

      case "has-undo":
        return KarmaFieldsAlpha.History.hasUndo();

      case "has-redo":
        return KarmaFieldsAlpha.History.hasRedo();

      case "count":
        return this.getCount();

      case "page":
        return this.getPage();

      case "ppp":
        return this.getPpp();

      case "lastpage": {
        const numpage = await this.getNumPage();
        return numpage === this.getPage();
      }

      case "numpage":
        return this.getNumPage();

      case "nextpage": {
        const page = this.getPage();
        const numpage = await this.getNumPage();

        if (page < numpage) {
          KarmaFieldsAlpha.History.save();
          KarmaFieldsAlpha.Nav.change(page+1, page, "page");
          this.interface.unselect();
          await this.queryIds();
          await this.render();
        }

        break;
      }

      case "prevpage": {
        const page = this.getPage();
        if (page > 1) {
          KarmaFieldsAlpha.History.save();
          KarmaFieldsAlpha.Nav.change(page-1, page, "page");
          this.interface.unselect();
          await this.queryIds();
          await this.render();
        }
        break;
      }

      case "firstpage": {
        const page = this.getPage();
        if (page > 1) {
          KarmaFieldsAlpha.History.save();
          KarmaFieldsAlpha.Nav.change(1, page, "page");
          this.interface.unselect();
          await this.queryIds();
          await this.render();
        }
        break;
      }

      case "tolastpage": {
        const page = this.getPage();
        const numpage = await this.getNumPage();
        if (page < numpage) {
          KarmaFieldsAlpha.History.save();
          KarmaFieldsAlpha.Nav.change(numpage, page, "page");
          this.interface.unselect();
          await this.queryIds();
          await this.render();
        }
        break;
      }

      case "reload": {
        this.server.store.empty();
        await this.queryIds();
        await this.render();
        break;
      }

      case "add": {
        KarmaFieldsAlpha.History.save();
        const ids = await this.add(content.data || {});
        // this.interface.select(0, 1);
        await this.render();
        break;

      }

      case "delete": {

        const selection = this.interface.selectionBuffer.get();
        if (selection) {
          const ids = this.idsBuffer.get() || [];
          const selectedIds = ids.slice(selection.index, selection.index + selection.length);
          if (selectedIds.length) {
            KarmaFieldsAlpha.History.save();
            this.interface.unselect();
            await this.remove(selectedIds);
            await this.render();
          }
        }
        break;
      }

      case "export": {
        return this.export(content.ids, content.keys, content.indexes);
      }

      case "import": {
        KarmaFieldsAlpha.History.save();

        const segment = content.segment || this.interface.getSelection() || {index: this.getIds().length, length: 0};

        if (content.data.length < segment.length) {

          const removeIds = this.getIds().slice(segment.index + content.data.length, segment.index + segment.length);
          await this.remove(removeIds);

        } else if (content.data.length > segment.length) {

          await this.addMultiple(content.data.length - segment.length, {}, segment.index + segment.length);

        }

        if (content.data.length > 0) {

          const ids = this.getIds().slice(segment.index, segment.index + content.data.length);

          await this.import(content.data, ids);

        }


        await this.render();
        break;
      }

      case "read": {
        const ids = content.ids || this.getSelectedIds();
        return this.read(ids);
      }

      case "write": {
        const ids = this.idsBuffer.get() || [];
        const selectedIds = ids.slice(content.index, content.length);
        const data = content.data || [];
        let insertIds = [];

        if (selectedIds.length || data.length) {

          KarmaFieldsAlpha.History.save();

          if (data.length && selectedIds.length) {
            await this.write(data, selectedIds);
          } else if (data.length) {
            let createdIds = await this.addMultiple(data.length);
            await this.write(data, createdIds);
          } else if (selectedIds.length) {
            await this.remove(selectedIds);
          }
          // this.interface.selectionBuffer.backup(insertIds);
          // this.interface.selectionBuffer.set(insertIds);
          await this.render();
        }
        break;
      }

      case "duplicate": {
        const ids = this.getSelectedIds();
        if (ids.length) {
          const cloneIds = await this.duplicate(ids);
          // this.server.store.empty();
          this.server.store.cache.empty(); // buffer need to stay for history
          await this.render();
        }
        break;
      }


      case "save":

        // const data = this.interface.buffer.get();
        // await this.server.send(data);
        // this.interface.buffer.remove();

        await this.interface.send();

        this.server.store.cache.empty(); // buffer need to stay for history


        const selection = this.interface.selectionBuffer.get();


        await this.queryIds();
        await this.render();
        break;

      case "undo": {
        KarmaFieldsAlpha.History.undo();
        return this.parent.request(subject);
      }

      case "redo": {
        KarmaFieldsAlpha.History.redo();
        return this.parent.request(subject);
      }

      case "close":
        // this.server.buffer.empty();
        // this.server.store.empty();
        this.server.store.cache.empty(); // buffer need to stay for history

        KarmaFieldsAlpha.History.save();

        this.interface.unselect();
        this.idsBuffer.backup();
        this.idsBuffer.remove();
        // this.interface.selectionBuffer.backup();
        // this.interface.selectionBuffer.remove();
        return this.parent.request(subject);

      // modal:
      case "prev": {
        let selection = this.interface.selectionBuffer.get();
        if (selection && selection.index > 0) {
          KarmaFieldsAlpha.History.save();
          this.interface.select(selection.index - 1, 1);
          await this.render();
        }
        break;
      }

      case "next": {
        let selection = this.interface.selectionBuffer.get();
        const ids = this.getIds();
        if (selection && selection.index < ids.length - 1) {
          KarmaFieldsAlpha.History.save();
          this.interface.select(selection.index + 1, 1);
          await this.render();
        }
        break;
      }

      case "clear-selection":
      case "close-modal": {
        KarmaFieldsAlpha.History.save();
        this.interface.unselect();
        await this.render();
        break;
      }

      case "order": {
        return KarmaFieldsAlpha.Nav.get("order") || this.params.order;
      }

      case "orderby": {
        return KarmaFieldsAlpha.Nav.get("orderby") || this.params.orderby;
      }

      case "toggle-order": {

        KarmaFieldsAlpha.History.save();

        this.toggleOrder(content.key, content.order);

        // let order = KarmaFieldsAlpha.Nav.get("order");
        // let orderby = KarmaFieldsAlpha.Nav.get("orderby");
        //
        // if (orderby === content.key) {
        //
        //   const newOrder = order === "asc" ? "desc" : "asc";
        //   KarmaFieldsAlpha.Nav.change(newOrder, "order");
        //
        // } else {
        //
        //   const newOrder = content.order || "asc";
        //   KarmaFieldsAlpha.Nav.change(newOrder, "order");
        //   KarmaFieldsAlpha.Nav.change(content.key, "orderby");
        //
        // }

        this.interface.unselect();

        await this.queryIds();
        await this.render();
        break;
      }


      case "fetch": {
        // -> table transfers

        const params = KarmaFieldsAlpha.Nav.get();

        KarmaFieldsAlpha.History.save();

        for (let key in {...params, ...content.params}) {
          // KarmaFieldsAlpha.Nav.backup(content.params[key] || "", key);
          // KarmaFieldsAlpha.Nav.set(content.params[key] || "", key);
          KarmaFieldsAlpha.Nav.change(content.params[key] || "", undefined, key);
        }

        KarmaFieldsAlpha.field.table.pile.push({
          params: params,
          callback: content.callback
        });

        return this.parent.request("render");

      }


      case "insert": {

        const selection = this.interface.selectionBuffer.get();

        if (selection && KarmaFieldsAlpha.field.table.pile.length > 0) {

          const ids = this.getIds();
          const inputIds = ids.slice(selection.index, selection.index + selection.length);
          const state = KarmaFieldsAlpha.field.table.pile.pop();
          const currentParams = KarmaFieldsAlpha.Nav.get();

          KarmaFieldsAlpha.History.save();

          for (let key in {...currentParams, ...state.params}) {
            // KarmaFieldsAlpha.Nav.backup(state.params[key] || "", key);
            // KarmaFieldsAlpha.Nav.set(state.params[key] || "", key);
            KarmaFieldsAlpha.Nav.change(state.params[key] || "", undefined, key);
          }

          await state.callback(inputIds);

          return this.parent.request("render");

        }

        break;
      }

      case "pile": {
        return KarmaFieldsAlpha.field.table.pile;
      }

      case "render": {
        await this.render();
        break;
      }

      case "render-controls":
        return this.controls.render();

      default:
        return this.parent.request(subject, content, ...path);

    }

  }

  toggleOrder(key, newOrder = "asc") {

    let order = KarmaFieldsAlpha.Nav.get("order");
    let orderby = KarmaFieldsAlpha.Nav.get("orderby");

    if (orderby === key) {

      newOrder = order === "asc" ? "desc" : "asc";
      KarmaFieldsAlpha.Nav.change(newOrder, undefined, "order");

    } else {

      KarmaFieldsAlpha.Nav.change(newOrder, undefined, "order");
      KarmaFieldsAlpha.Nav.change(key, undefined, "orderby");

    }

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

  writeHistory(value, currentValue, ...path) {
    KarmaFieldsAlpha.History.backup(value, currentValue, false, "data", this.driver, ...path);
	}


  getIds() {
    let ids = this.idsBuffer.get() || [];
    return ids;
  }

  isModalOpen() {
    return Boolean(this.resource.modal && this.resource.modal.keepAlive);
  }

  async export(ids = this.getSelectedIds(), keys = []) {

    const rows = [];

    for (let id of ids) {

      // const row = await this.interface.exportRow(id, keys);


      const rowField = this.interface.createChild({
        children: this.resource.children,
        key: id,
        type: "row"
      });


      let row = await rowField.export(keys);

      if (this.resource.modal) {

        const modal = this.interface.createChild({
          ...this.resource.modal.body,
          key: id,
          type: "row"
        });

        const modalObject = await modal.export(keys);

        // console.log(modal, modalObject);

        row = {...row, ...modalObject};

      }


      rows.push(row);
    }

    return rows;
  }

  async import(data, ids) { // expect json array



    // const allIds = this.getIds();
    // const index = ids[0] && allIds.indexOf(ids[0])
    //
    // const selection = this.interface.getSelection();
    // let index;
    //
    // if (selection) {
    //
    //   index = selection.index;
    //
    //   const ids = this.getSelectedIds();
    //
    //   if (ids) {
    //     this.interface.unselect();
    //     await this.remove(ids);
    //   }
    //
    // } else {
    //
    //   index = this.getIds().length;
    //
    // }
    //
    // const ids = await this.addMultiple(data.length, {}, index);

    // for (let id in ids) {
    for (let i = 0; i < ids.length; i++) {

      const id = ids[i];
      const object = data[i%data.length];
      // await this.interface.importRow(data[i]);

      const rowField = this.interface.createChild({
        children: this.resource.children,
        key: id,
        type: "row"
      }, id);

      await rowField.import(object);

      if (this.resource.modal) {

        const modal = this.interface.createChild({
          ...this.resource.modal.body,
          key: id,
          type: "row"
        });

        await modal.import(object);

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

    // const filterParams = this.getFilterParams();
    //
    // params = {...filterParams, ...params};

    // delete params.trash;
    // delete params.id;

    // debugger;





    let createdId = await KarmaFieldsAlpha.Gateway.post("add/"+this.driver, params);

    const id = KarmaFieldsAlpha.Type.toString(createdId);

    this.interface.buffer.change(["0"], null, id, "trash");

    // this.grid.buffer.set(["1"], id, "trash");
    // this.grid.buffer.backup(["0"], id, "trash");
    // this.grid.buffer.set(["0"], id, "trash");

    // for (let key in params) {
    //
    //   const value = params[key];
    //
    //   // this.interface.buffer.backup([value], id, key);
    //   // this.interface.buffer.set([value], id, key);
    //   this.interface.buffer.change([value], undefined, id, key);
    //
    // }

    const rowField = this.interface.createChild({
      children: this.resource.children,
      type: "row"
    });

    const defaults = await rowField.getDefault();

    for (let key in defaults) {

      this.interface.buffer.change([defaults[key]], null, id, key);

    }

    const ids = [...this.getIds()];

    ids.splice(index, 0, id);

    // this.idsBuffer.backup(ids);
    // this.idsBuffer.set(ids);

    this.idsBuffer.change(ids);

    return id;
  }

  async remove(removeIds) {

    for (let id of removeIds) {

      // const data = {};
      // KarmaFieldsAlpha.DeepObject.merge(data, this.server.buffer.get(id));
      // KarmaFieldsAlpha.DeepObject.merge(data, this.interface.buffer.get(id));

      // this.interface.buffer.change({trash: ["1"]}, undefined, id);

      this.server.trashBuffer.set({
        ...this.server.buffer.get(id),
        trash: ["1"]
      }, id);

      this.interface.buffer.change(["1"], ["0"], id, "trash");

      // this.grid.buffer.set(["0"], id, "trash");
      // this.grid.buffer.backup(["1"], id, "trash");
      // this.grid.buffer.set(["1"], id, "trash");
    }

    const ids = this.getIds().filter(id => !removeIds.includes(id));

    // this.idsBuffer.backup(ids);
    // this.idsBuffer.set(ids);

    this.idsBuffer.change(ids);

  }


  read(ids) {
    const data = [];

    for (let i = 0; i < ids.length; i++) {

      const bufferData = this.server.buffer.get(ids);
      const formBufferData = this.interface.buffer.get(ids);

      const clone = {};

      KarmaFieldsAlpha.DeepObject.merge(clone, bufferData);
      KarmaFieldsAlpha.DeepObject.merge(clone, formBufferData);

      data.push(clone);

    }

  }

  write(data, ids) {

    const filterParams = this.getFilterParams();

    for (let i = 0; i < ids.length; i++) {

      const id = ids[i];
      const item = data[i%data.length];

      for (let key in filterParams) {
        item[key] = [key[filterParams]];
      }

      delete item.id;
      delete item.trash;

      // this.grid.buffer.backup(item, id);
      // this.grid.buffer.set(item, id);
      this.interface.buffer.change(item, undefined, id);

    }

  }

  async duplicate(ids) {

    const cloneIds = await this.addMultiple(ids.length);

    const data = this.read(ids);

    this.write(data, cloneIds);

    return cloneIds;
  }


  getSelectedIds() {

    const selection = this.interface.selectionBuffer.get();

    if (selection) {

      const ids = this.idsBuffer.get() || [];

      return ids.slice(selection.index, selection.index + selection.length);

    }

    return [];
  }



  build() {
    return {
      class: "karma-field-table",
      init: async table => {

      },
      update: async table => {
        this.render = table.render;

        table.element.classList.add("table-loading");

        const modalOpen = this.isModalOpen();

        // const modalOpen = Boolean(this.resource.modal && this.resource.modal.keepAlive);

        table.children = [
          {
            class: "table-body",
            update: container => {
              container.element.classList.toggle("single-open", Boolean(modalOpen));
            },
            children: [
              {
                class: "table-modal",
                init: container => {
                  if (this.modal) {
                    this.modal.render = container.render;
                  }
                },
                update: container => {

                  // const selection = this.interface.selectionBuffer.get();

                  if (modalOpen) {
                    container.element.style.width = this.modal.resource.width || "30em"; // -> could use flex: min-content but support is not good yet
                    container.children = [this.modal.build()];
                  } else {
                    container.element.style.width = "0";
                    container.children = [];
                  }
                }
              },
              {
                class: "table-main",
                children: [
                  {
                    class: "karma-header table-main-header",
                    child: this.createChild({
                      type: "header",
                      ...this.resource.header
                    }, "header").build()
                  },
                  {
                    class: "table-main-body karma-field-frame",
                    children: [
                      {
                        class: "karma-field-table-section karma-field-frame final",
                        init: filters => {
                          filters.element.classList.toggle("hidden", !this.resource.filters);
                        },
                        child: this.createChild({
                          ...this.resource.filters,
                          id: "filters",
                          type: "filters"
                        }).build()
                      },
                      ...(this.resource.subsections || []).map(resource => {
                        return {
                          class: "karma-field-table-section karma-field-frame final",
                          init: section => {
                            if (resource.style) {
                              section.element.style = resource.style;
                            }
                          },
                          child: this.createChild(resource).build()
                        };
                      }),
                      this.interface.build()
                    ]
                  }
                ]
              }
            ]
          },
          {
            class: "table-footer table-control",
            update: footer => {
              this.controls.render = footer.render;
              footer.element.classList.toggle("hidden", this.resource.controls === false);
              if (this.resource.controls !== false) {
                footer.child = this.controls.build();
              }
            }
          }
        ];
      },
      complete: table => {
        table.element.classList.remove("table-loading");
      }
    };
  }

  // buildContent() {
  //   return this.createChild({
  //     type: "group",
  //     children: this.resource.children
  //   });
  // }

  static interface = class extends KarmaFieldsAlpha.field.form {

    constructor(resource) {
      super(resource);

      this.selectionBuffer = new KarmaFieldsAlpha.Buffer("state", this.resource.context, "selection");

    }

    release() {
      // noop
    }

    select(index, length) {

      // compat
      if (typeof index === "object" && index) {
        console.warn("deprecated select([Segment Object])");
        index = object.index;
        length = object.length;
      }

      const newSelection = new KarmaFieldsAlpha.Segment(index, length);
      const currentSelection = this.selectionBuffer.get() || {};

      if (!newSelection.equals(currentSelection.index, currentSelection.length)) {

      // if (!KarmaFieldsAlpha.Segment.equals(newSelection, currentSelection)) {

        this.selectionBuffer.backup(newSelection);
        this.selectionBuffer.set(newSelection);

      }

    }

    unselect() {

      const selection = this.selectionBuffer.get();

      if (selection) {

        this.selectionBuffer.backup();
        this.selectionBuffer.remove();

        // this.idSelector.updateSelection();

      }

    }

    getSelection() {
      return this.selectionBuffer.get();
      // if (selection && selection.length) {
      //   return selection;
      // }
    }

    // async dispatch(event, parent) {
    //
    //   switch (event.action) {
    //
    //     case "selection": {
    //       event.data = this.getSelection();
    //       break;
    //     }
    //
    //     case "unselect": {
    //
    //       if (this.selectionBuffer.get()) {
    //         KarmaFieldsAlpha.History.save();
    //         this.unselect();
    //         // await super.dispatch({
    //         //   action: "edit-selection"
    //         // });
    //         await super.dispatch({
    //           action: "render"
    //         });
    //       }
    //
    //     }
    //
    //     default:
    //       await super.dispatch(event);
    //       break;
    //
    //   }
    //
    //   return event;
    // }



    async request(subject, content, ...path) {

      switch (subject) {

        case "edit":
          return this.parent.request("render-controls");

        case "selection": {
          return this.getSelection();
        }

        case "unselect": {
          if (this.selectionBuffer.get()) {
            KarmaFieldsAlpha.History.save();
            this.unselect();
            await this.parent.request("render");
          }
          break;
        }

        default:
          return super.request(subject, content, ...path);

      }

    }

    build() {

      return {
        class: "karma-field-table-grid-container",
        child: super.build()
      }

    }


    static row = class extends KarmaFieldsAlpha.field {

      async request(subject, content, ...path) {

        switch (subject) {

          case "index":
            return this.index;

          default:
            return super.request(subject, content, this.getKey(), ...path);
        }

      }

      getKeys() {

    		let keys = new Set();

        for (let resource of this.resource.children) {

          keys = new Set([...keys, ...this.createChild(resource).getKeys()]);

        }

    		return keys;
    	}

      async getDefault() {

    		let defaults = {};

    		for (let index in this.resource.children) {

    			const child = this.createChild(this.resource.children[index]);

    			defaults = {
    				...defaults,
    				...await child.getDefault()
    			};

    		}

    		return defaults;
    	}

      async export(keys = []) {

        let object = {};

        for (let resource of this.resource.children) {

          const child = this.createChild(resource);

          object = {
            ...object,
            ...await child.export(keys)
          };

        }

        return object;
      }

      async import(object) {

        for (let resource of this.resource.children) {

          const child = this.createChild(resource);

          await child.import(object);

        }

    	}



      static handle = class extends KarmaFieldsAlpha.field.text {

        constructor(resource) {
          super({
            selectMode: "row",
            ...resource
          });
        }

        build() {
          return {
            tag: this.resource.tag,
            class: "text karma-field modal-btn",
            init: node => {
              // node.element.tabIndex = -1;
            },
            update: async node => {
              node.element.innerHTML = await this.getContent();
            }
          };
        }

      }

      static modalHandle = class extends this.handle {}; // -> compat

      static tableIndex = class extends this.handle {

        constructor(resource) {
          super({
            width: "40px",
            selectMode: "row",
            ...resource
          });

        }

        build() {
          return {
            class: "karma-field text",
            update: async container => {
              container.element.textContent = await this.parent.request("index");
            }
          };
        }

      }


    }


    static modal = class extends KarmaFieldsAlpha.field {

      build() {

        return {
          class: "karma-modal",
          update: modal => {
            modal.element.style.minWidth = this.resource.width || "30em";
            modal.children = [
              {
                class: "karma-header table-modal-header",
                child: this.createChild({
                  type: "header",
                  ...this.resource.header
                }).build()
              },
              {
                class: "table-modal-body",
                update: body => {
                  body.child = this.createChild({
                    id: "body",
                    ...this.resource.body
                  }).build();
                }
              }
            ];
          }
        };
      }

      async request(subject, content, ...path) {

        switch (subject) {

          case "close": {
            return this.parent.request("unselect");
          }

          case "get": {

            const ids = await this.parent.request("selectedIds");

            if (path[0] === "id") {
              return ids;
            }

            if (ids.length) {

              const response = await this.parent.request(subject, content, ids[0], ...path);
              const array = KarmaFieldsAlpha.Type.toArray(response);

              array.multiValue = ids.length > 1;

              return array;

            }

            break;
          }

          case "set":
          case "fetch":
          case "modified":
          default: {
            const [id] = await this.parent.request("selectedIds");
            if (id) {
              return this.parent.request(subject, content, id, ...path);
            } else {
              return this.parent.request(subject, content, ...path);
            }
          }

        }

      }

      static header = class extends KarmaFieldsAlpha.field.group {

        constructor(resource) {

          const defaultResource = {
            id: "header",
            display: "flex",
            children: [
              "title",
              "separator",
              "prev",
              "next",
              "close"
            ]
          };


          super({...defaultResource, ...resource});
        }

        static title = class extends KarmaFieldsAlpha.field.text {

          constructor(resource, ...args) {
            const defaultResource = {
              id: "title",
              tag: "h1",
              style: "flex-grow:1",
              class: "ellipsis",
              value: "Single"
            };

            super({...defaultResource, ...resource});
          }

        }

        // static title = {
        //   id: "title",
        //   type: "text",
        //   tag: "h1",
        //   style: "flex-grow:1",
        //   class: "ellipsis",
        //   value: ["dispatch", "title"]
        // }

        static prev = {
          id: "prev",
      		type: "button",
          action: "prev",
          title: "Previous Item",
          text: "‹"
        }

      	static next = {
          id: "next",
      		type: "button",
          action: "next",
          title: "Next Item",
          text: "›"
        }

      	static close = {
          id: "close",
      		type: "button",
          title: "Close Modal",
          text: "×",
          action: "close"
        }

      }

    }

  }


  static controls = class extends KarmaFieldsAlpha.field.group {

    constructor(resource, ...args) {

      const defaultResource = {
        id: "controls",
        display: "flex",
        children: [
          "reload",
          "save",
          "add",
          "delete",
          "separator",
          "undo",
          "redo"
        ]
      };

      super({
        ...defaultResource,
        ...resource
      }, ...args);

    }



    static save = {
      id: "save",
  		type: "button",
      action: "save",
      title: "Save",
      // disabled: "!modified",
      // disabled: ["!", ["request", "modified", "boolean"]],
      disabled: ["!", ["modified"]],
      primary: true
      // test: ["modified"]
    }

  	static add = {
      id: "add",
  		type: "button",
      action: "add",
      title: "Add"
    }

  	static delete = {
      id: "delete",
  		type: "button",
      action: "delete",
      title: "Delete",
      // disabled: "!selection"
      disabled: ["!", ["request", "selection", "string"]]
    }

  	static undo = {
      id: "undo",
  		type: "button",
      action: "undo",
      dashicon: "undo",
      // disabled: "!undo"
      disabled: ["!", ["request", "has-undo", "boolean"]]
    }

  	static redo = {
      id: "redo",
  		type: "button",
      action: "redo",
      dashicon: "redo",
      // disabled: "!redo"
      disabled: ["!", ["request", "has-redo", "boolean"]]
    }

    static separator = {
      id: "separator",
  		type: "separator"
    }

    static reload = {
      id: "reload",
  		type: "button",
      action: "reload",
      title: "Reload"
    }

    static insert = {
      id: "insert",
      type: "button",
      action: "insert",
      primary: true,
      title: "Insert",
      disabled: ["!", ["request", "selection", "object"]],
      hidden: ["empty", ["request", "pile", "array"]]
    }

  }

  static header = class extends KarmaFieldsAlpha.field.group {

    constructor(resource) {

      const defaultResource = {
        id: "header",
        display: "flex",
        children: [
          "title",
          "count",
          "pagination",
          "close"
        ]
      };

      super({
        ...defaultResource,
        ...resource
      });

    }

    static title = class extends KarmaFieldsAlpha.field.text {

      constructor(resource) {

        const defaultResource = {
          id: "title",
          tag: "h1",
          style: "flex-grow:1",
          class: "ellipsis",
          value: "Table"
        };

        super({...defaultResource, ...resource});

      }

    }

    static count = {
      id: "count",
      type: "text",
      style: "justify-content:center;white-space: nowrap;",
      value: ["replace", "# elements", "#", ["request", "count", "string"]],
      dynamic: true
    }

    static options = {
      id: "options",
      type: "button",
      title: "Options",
      action: "toggle-options"
    }

    static close = {
      id: "close",
      type: "button",
      text: "×",
      title: "Close Table",
      action: "close"
    }

    static pagination = class extends KarmaFieldsAlpha.field.group {

      constructor(resource) {

        const defaultResource = {
          id: "pagination",
          type: "group",
          display: "flex",
          style: "flex: 0 1 auto;min-width:0",
          hidden: ["==", ["request", "numpage", "number"], 1],
          children: [
            "firstpage",
            "prevpage",
            "currentpage",
            "nextpage",
            "lastpage"
          ]
        }

        super({
          ...defaultResource,
          ...resource
        });
      }

      static firstpage = {
        id: "firstpage",
    		type: "button",
        action: "firstpage",
        title: "First Page",
        text: "«",
        disabled: ["==", ["request", "page", "number"], 1]
      }

      static prevpage = {
        id: "prevpage",
    		type: "button",
        action: "prevpage",
        title: "Previous Page",
        text: "‹",
        disabled: ["==", ["request", "page", "number"], 1]
      }

      static currentpage = {
        id: "currentpage",
    		type: "text",
        style: "min-width: 4em;text-align: right;",
        value: ["replace", "# / #", "#", ["request", "page", "string"], ["request", "numpage", "string"]]
      }

    	static nextpage = {
        id: "nextpage",
    		type: "button",
        action: "nextpage",
        title: "Next Page",
        text: "›",
        disabled: ["request", "lastpage", "boolean"]
      }

    	static lastpage = {
        id: "lastpage",
    		type: "button",
        action: "tolastpage",
        title: "Last Page",
        text: "»",
        disabled: ["request", "lastpage", "boolean"]
      }

    }

  }

  static filters = class extends KarmaFieldsAlpha.field.group {

    // async dispatch(event) {
    //
    //   switch (event.action) {
    //
    //     case "set": {
    //       await super.dispatch(event);
    //       this.render();
    //       break;
    //     }
    //
    //     default:
    //       await super.dispatch(event);
    //       break;
    //
    //   }
    //
    //   return event;
    // }

    async request(subject, content, ...path) {

      switch (subject) {

        // case "set": {
        //   await super.request(subject, content, ...path);
        //   this.expressionCache.remove();
        //   await this.render();
        //   break;
        // }

        default:
          return super.request(subject, content, ...path);

      }

    }

  }







}
