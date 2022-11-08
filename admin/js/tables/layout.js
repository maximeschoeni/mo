
KarmaFieldsAlpha.field.layout = class extends KarmaFieldsAlpha.field {

  // static pile = [];

  constructor(resources) {
    super(resources);

    this.pile = [];

    KarmaFieldsAlpha.tables = this; // -> debug

    this.buffer = new KarmaFieldsAlpha.Buffer();

    this.dataBuffer = new KarmaFieldsAlpha.Buffer("data");
    this.initialBuffer = new KarmaFieldsAlpha.Buffer("gateway");
    this.trashBuffer = new KarmaFieldsAlpha.Buffer("trash");

  }

  getResource(tableId) {

    if (!tableId) {

      tableId = KarmaFieldsAlpha.Nav.get("table");

    }

    const resource = this.resource.tables.find(resource => resource.id === tableId);

    if (resource) {

      // compat

      if (resource.columns) {
        resource.children = resource.columns.map(column => {
          return {
            ...column,
            ...column.field
          };
        });
      }

      if (resource.children) {

        resource.body = {
          type: "table",
          children: resource.children,
          id: resource.driver,
          params: resource.params,
          joins: resource.joins,
          ...resource.body
        }

        if (typeof resource.driver === "string") {

          const [request, ...joins] = resource.driver.split("+");
          const [driver, paramString] = request.split("?");

          resource.body.driver = driver;
          resource.body.params = KarmaFieldsAlpha.Params.parse(paramString);
          resource.body.joins = joins

        } else if (resource.driver && typeof resource.driver === "object") {

          resource.body.driver = resource.driver.name;
          resource.body.params = resource.params || resource.driver.params;
          resource.body.joins = resource.joins || resource.driver.joins || [];

        }

        if (resource.style) {
          resource.body.style = resource.style;
        }

      }

    }

    return resource;
  }

  getTable(tableId) {

    const resource = this.getResource(tableId);

    if (resource) {

      return this.createChild(resource.body);

    }

  }

  // getIds() {
  //   const table = this.getTable();
  //   if (table) {
  //     return table.getIds();
  //   }
  // }
  //
  // getSelectedIds() {
  //   const table = this.getTable();
  //   if (table) {
  //     return table.getSelectedIds();
  //   }
  // }
  //
  // getSelection() {
  //   const table = this.getTable();
  //   if (table) {
  //     return table.getSelection();
  //   }
  // }
  //
  // getCount() {
  //   const table = this.getTable();
  //   if (table) {
  //     return table.getCount();
  //   }
  // }
  //
  // getCount() {
  //   const table = this.getTable();
  //   if (table) {
  //     return table.getCount();
  //   }
  // }




  //
  // requestCount() {
  //   const table = this.getTable();
  //
  //   if (table && table.getCount) {
  //     return table.getCount();
  //   }
  // }
  //
  // requestNextPage() {
  //
  //   const table = this.getTable();
  //
  //   if (table && table.getPage && table.getNumPage) {
  //
  //     const page = table.getPage();
  //     const numpage = await table.getNumPage();
  //
  //     if (page < numpage) {
  //
  //       KarmaFieldsAlpha.History.save();
  //       KarmaFieldsAlpha.Nav.change(page+1, page, "page");
  //
  //       table.unselect();
  //
  //       await table.load();
  //       await this.render();
  //
  //     }
  //
  //   }
  //
  // }



  async request(subject, content = {}, ...path) {

    switch (subject) {

      // single

      case "state": {
        const [key] = path;
        return {value: KarmaFieldsAlpha.Nav.get(key) || ""};
      }

      case "get": {
        const [key] = path;
        return KarmaFieldsAlpha.Nav.get(key) || "";
      }

      case "set": {
        const [key] = path;

        const value = KarmaFieldsAlpha.Type.toString(content.data) || "";
        const current = KarmaFieldsAlpha.Nav.get(key) || "";

        if (value !== current) {

          KarmaFieldsAlpha.Nav.change(value, current, key);

          const page = KarmaFieldsAlpha.Nav.get("page") || "1";

          if (page !== "1") {

            KarmaFieldsAlpha.Nav.change(1, page, "page");

          }

        }

        break;
      }

      case "modified": {

        const delta = this.dataBuffer.get();

    		if (delta) {

  			  return KarmaFieldsAlpha.DeepObject.differ(delta, {
            ...await this.trashBuffer.get(),
            ...await this.initialBuffer.get()
          });


    		}

    		return false;


        // const table = this.getTable();
        //
        // if (table && table.isModified) {
        //
        //   return table.isModified();
        //
        // }
        //
        // return false;
      }

      case "query-ids": // -> compat
      case "load": {
        const table = this.getTable();

        if (table && table.load) {

          await table.load();

        }

        break;
      }

      // -> like get_post()
      // -> for media breadcrumb (ancestors)
      case "queryid": {

        const table = this.getTable();

        if (table && table.query) {

          const [result] = await table.query({
            ids: [content.id]
          });

          return result;

        }

        break;
      }

      case "edit": {

        const table = this.getTable();

        if (table) {

          if (table.unselect) {

            table.unselect(); // when filter change

          }

          table.cache.empty(); // buffer need to stay for history

          await table.load();
          await this.render();

        }

        break;
      }

      case "has-undo": {
        return KarmaFieldsAlpha.History.hasUndo();
      }

      case "has-redo": {
        return KarmaFieldsAlpha.History.hasRedo();
      }

      case "reload": {

        const table = this.getTable();

        if (table) {

          table.initialBuffer.empty();
          table.cache.empty();

          await table.load();
          await this.render();

        }

        break;
      }

      case "export": {

        const table = this.getTable();

        if (table) {

          return table.export(content.keys, content.index, content.length);

        }

        break;

      }

      case "import": {

        const table = this.getTable();

        if (table) {

          const data = content.data || [];
          const index = content.index || 9999999;
          const length = content.length || 0;

          if (data.length || content.length > 0) {

            KarmaFieldsAlpha.History.save();

            table.import(data, index, length);

            await this.render();

          }

        }

        break;
      }

      case "save": {

        const data = this.dataBuffer.get();

    		this.initialBuffer.merge(data); // -> needed for autosave

        for (let driver in data) {

      		for (let id in data[driver]) {

      			await KarmaFieldsAlpha.Gateway.post(`update/${driver}/${id}`, data[driver][id]);

      		}

        }

    		this.dataBuffer.remove();

        await this.render();



        // const table = this.getTable();
        //
        // if (table && table.send) {
        //
        //   await table.send();
        //   await this.render();
        //
        // }

        break;
      }

      case "undo": {
        KarmaFieldsAlpha.History.undo();
        return this.render();
      }

      case "redo": {
        KarmaFieldsAlpha.History.redo();
        return this.render();
      }

      case "close": {

        const table = this.getTable();

        if (table) {

          if (table.cache) {

            table.cache.empty(); // buffer need to stay for history

          }

          KarmaFieldsAlpha.History.save();

          if (table.unselect) {

            table.unselect();

          }

          await table.unload();

          KarmaFieldsAlpha.Nav.remove();
          KarmaFieldsAlpha.History.buffer.remove("history"); // ?

          await this.render();

        }

        break;
      }

      case "prev": {
        // let selection = this.interface.selectionBuffer.get();
        // if (selection && selection.index > 0) {
        //   KarmaFieldsAlpha.History.save();
        //   this.interface.select(selection.index - 1, 1);
        //   await this.render();
        // }
        break;
      }

      case "next": {
        // let selection = this.interface.selectionBuffer.get();
        // const ids = this.interface.getIds();
        // if (selection && selection.index < ids.length - 1) {
        //   KarmaFieldsAlpha.History.save();
        //   this.interface.select(selection.index + 1, 1);
        //   await this.render();
        // }
        break;
      }





      // collections

      case "selection": {

        const table = this.getTable();

        if (table && table.getSelection) {

          return table.getSelection();

        }

        return;
      }

      case "count": {

        const table = this.getTable();

        if (table && table.getCount) {

          return table.getCount();

        }

        return 1;
      }

      case "page": {

        const table = this.getTable();

        if (table && table.getPage) {

          return table.getPage();

        }

        return 1;
      }



      case "ppp": {

        const table = this.getTable();

        if (table && table.getPpp) {

          return table.getPpp();

        }

        return 1;
      }

      case "isLastpage": {

        const table = this.getTable();

        if (table && table.getPage && table.getNumPage) {

          return table.getPage() === await table.getNumPage();

        }

        return true;
      }

      case "numpage": {

        const table = this.getTable();

        if (table && table.getNumPage) {

          return table.getNumPage();

        }

        return 1;
      }

      case "nextpage": {

        const table = this.getTable();

        // if (table && table.getPage && table.getNumPage) {
        if (table && table.getPage && table.changePage) {

          const page = table.getPage();

          await table.changePage(page+1);

          // const numpage = await table.getNumPage();
          //
          // if (page < numpage) {
          //
          //   KarmaFieldsAlpha.History.save();
          //   KarmaFieldsAlpha.Nav.change(page+1, page, "page");
          //
          //   table.unselect();
          //
          //   await table.loads();
          //   await this.render();
          //
          // }

        }

        break;
      }

      case "prevpage": {

        const table = this.getTable();

        if (table && table.getPage) {

          const page = table.getPage();

          if (page > 1) {

            KarmaFieldsAlpha.History.save();
            KarmaFieldsAlpha.Nav.change(page-1, page, "page");

            table.selectionBuffer.remove();

            await table.load();
            await this.render();

          }

        }

        break;
      }

      case "firstpage": {

        const table = this.getTable();

        if (table && table.getPage) {

          const page = table.getPage();

          if (page > 1) {

            KarmaFieldsAlpha.History.save();
            KarmaFieldsAlpha.Nav.change(1, page, "page");

            table.selectionBuffer.remove();

            await table.load();
            await this.render();

          }

        }

        break;
      }

      case "lastpage": {

        const table = this.getTable();

        if (table && table.getPage && table.getNumPage) {

          const page = table.getPage();
          const numpage = await table.getNumPage();

          if (page > 1) {

            KarmaFieldsAlpha.History.save();
            KarmaFieldsAlpha.Nav.change(numpage, page, "page");

            table.selectionBuffer.remove();

            await table.load();
            await this.render();

          }

        }

        break;

      }

      case "add": {

        const table = this.getTable();

        if (table && table.add) {

          KarmaFieldsAlpha.History.save();

          const index = content.index || table.resource.add_index || 0;

          const id = await table.add(content.params, index);

          table.selectionBuffer.change({index: index, length: 1});

          await this.render();

        }

        break;
      }

      case "delete": {

        const table = this.getTable();

        if (table && table.remove && table.selectionBuffer) {

          const selection = table.selectionBuffer.get();

          if (selection) {

            KarmaFieldsAlpha.History.save();

            table.selectionBuffer.remove();

            await table.remove(selection.index, selection.length);
            await this.render();

          }

        }

        break;
      }

      case "duplicate": {

        const table = this.getTable();

        if (table && table.remove && table.selectionBuffer) {

          const selection = table.selectionBuffer.get();

          if (selection) {

            KarmaFieldsAlpha.History.save();

            table.selectionBuffer.remove();

            await table.duplicate(selection.index, selection.length);
            await this.render();

          }

        }

        break;
      }


      case "clear-selection":
      case "close-modal": {

        const table = this.getTable();

        if (table && table.selectionBuffer) {

          KarmaFieldsAlpha.History.save();

          table.selectionBuffer.remove();

          await this.render();

        }

        break;
      }

      case "order": {

        const table = this.getTable();

        if (table && table.getOrder) {

          return table.getOrder();

        }

        break;
      }


      case "orderby": {

        const table = this.getTable();

        if (table && table.getOrderby) {

          return table.getOrderby();

        }

        break;
      }

      case "toggle-order": {

        const table = this.getTable();

        if (table && table.toggleOrder && table.selectionBuffer) {

          KarmaFieldsAlpha.History.save();

          table.toggleOrder(content.key, content.order);
          table.selectionBuffer.remove();

          await table.load();
          await this.render();

        }

        break;
      }


      case "fetch": {
        // -> table transfers

        const tableId = KarmaFieldsAlpha.Nav.get("table");

        const params = KarmaFieldsAlpha.Nav.get();

        KarmaFieldsAlpha.History.save();

        // for (let key in {...params, ...content.params}) {
        //   KarmaFieldsAlpha.Nav.change(content.params[key] || "", undefined, key);
        // }

        KarmaFieldsAlpha.Nav.change(content.params);

        const transfer = this.buffer.get("state", "transfer");

        const newTransfer = {
          params: params,
          path: path,
          tableId: tableId,
          transfer: transfer,
          selection: this.buffer.get("state", "selection"),
          ids: this.buffer.get("state", "ids")
          // callback: content.callback,
          // selectedIds: content.ids,
          // fieldSelection: content.selection
        };

        Object.freeze(newTransfer);

        // this.buffer.change(null, undefined, "state", "ids");

        this.buffer.change(newTransfer, transfer, "state", "transfer");

        const table = this.getTable();

        await table.load();

        const selection = table.createSelection(content.ids);

        table.selectionBuffer.change(selection);

        // this.pile.push({
        //   params: params,
        //   callback: content.callback
        // });

        this.buffer.set(content.callback, "transfer-callback", tableId);


        await this.render();

        break;
      }


      case "insert": {

        const table = this.getTable();

        if (table && table.getIds && table.selectionBuffer) {

          const selection = table.selectionBuffer.get();
          const transfer = this.buffer.get("state", "transfer");

          if (selection && transfer) {

            const ids = table.getIds();
            const inputIds = ids.slice(selection.index, selection.index + selection.length);

            KarmaFieldsAlpha.Nav.change(transfer.params);

            const originTable = this.getTable(transfer.params.table);

            // await originTable.load();

            this.buffer.change(transfer.ids, ids, "state", "ids");

            this.buffer.change(transfer.selection, selection, "state", "selection");

            //
            // await transfer.callback(inputIds);

            const callback = this.buffer.get("transfer-callback", transfer.params.table);

            if (callback) {

              await callback.call(originTable, inputIds);

              this.buffer.remove("transfer-callback", transfer.params.table);

            }

            this.buffer.change(transfer.transfer, transfer, "state", "transfer");

            await this.render();

          }

        }

        break;

      }

      case "pile": {
        return this.buffer.get("state", "transfer");
      }


      // medias

      case "create-folder": {
        const table = this.getTable();

        if (table && table.createFolder) {

          KarmaFieldsAlpha.History.save();

          const index = content.index || table.resource.add_index || 0;

          const id = await table.createFolder(index);

          table.selectionBuffer.change({index: index, length: 1});

          await this.render();

        }

        break;
      }

      case "change-file": {

        const table = this.getTable();

        if (table && table.changeFile && table.getSelectedIds) {

          const selectedIds = table.getSelectedIds();

          if (selectedIds.length === 1) {

            await table.changeFile(content.files[0], selectedIds[0], content.params);
            await this.render();

          }

        }

        break;
      }

      case "upload": {

        const table = this.getTable();

        if (table && table.upload) {

          KarmaFieldsAlpha.History.save();

          // if (table.unselect) {
          //
          //   table.unselect();
          //
          // }

          // await table.upload(content.files, content.params);

          await table.upload(content.files, table.resource.add_index || 0);

          // const index = content.index || table.resource.add_index || 0;
          //
          // table.selectionBuffer.change({index: index, length: 1});

          await this.render();

        }

        break;
      }

      // uploading from gallery field: upload one to one
      // case "upload-file": {
      //
      //   const table = this.getTable();
      //
      //   const id = await table.uploadFile(content);
      //
      //   const ids = table.idsBuffer.get();
      //
      //   this.idsBuffer.change([id, ...ids], ids);
      //
      //   break;
      // }

      case "regen": {

        const table = this.getTable();

        if (table && table.regen && table.getSelectedIds) {

          const selectedIds = table.getSelectedIds();

          for (let id of selectedIds) {

            await table.regen(id);

          }

          await this.render();

        }

        break;
      }



      // layout

      // case "close":
      //   KarmaFieldsAlpha.Nav.remove();
      //   KarmaFieldsAlpha.History.buffer.remove("history"); // ?
      //   await this.render();
      //   break;



      case "table": {
        // const resource = this.resource.tables.find(resource => resource.id === content.id);
        // if (resource) {
        //   return this.createChild(resource);
        // }
        // break;
        return this.getTable(content.id);
      }

      case "render-controls":
        await this.controls.render();
        break;

      // case "undo":
      // case "redo":
      case "render": {
        await this.render();
        break;
      }

      default: {
        return this.parent && this.parent.request(subject, content, ...path);
      }

    }

  }

  async queryTable() { // deprecated. use getCurrent

    // -> not on undo/redo !

    // const tableId = KarmaFieldsAlpha.Nav.get("table");
    // const resource = this.resource.tables.find(resource => resource.id === tableId);
    //
    // if (resource) {
    //   const table = this.createChild(resource);
    //   await table.interface.queryIds();
    // }

    const table = this.getTable();

    table.load();

    // await this.render();
  }

  build() {
    return {
      class: "popup",
      init: async container => {

        this.render = container.render;

        document.addEventListener("keydown", event => {
          if (event.key === "s" && event.metaKey) {
            event.preventDefault();
            this.request("save");
          } else if (event.key === "z" && event.metaKey) {
            event.preventDefault();
            this.request("undo");
          } else if (event.key === "z" && event.metaKey && event.shiftKey) {
            event.preventDefault();
            this.request("redo");
          }
        });


        window.addEventListener("popstate", async event => {

          const params = KarmaFieldsAlpha.Nav.get() || {};
          const hash = KarmaFieldsAlpha.Params.stringify(params);
          const newHash = location.hash.slice(1);
          const newParams = KarmaFieldsAlpha.Params.parse(newHash);

          if (newHash !== hash) {

            if (params.table) { // -> not when open first

              KarmaFieldsAlpha.History.save();

            }

            KarmaFieldsAlpha.Nav.change(newParams);

            const table = this.getTable();

            const transfer = this.buffer.get("state", "transfer");

            if (transfer) {

              this.buffer.change(null, transfer, "state", "transfer");

            }

            const selection = this.buffer.get("state", "selection");

            if (selection) {

              this.buffer.change(null, selection, "state", "selection");

            }

            await table.load();

            // await this.queryTable();

          }

          return this.render();
        });

        const newHash = location.hash.slice(1);
        const newParams = KarmaFieldsAlpha.Nav.toObject(newHash);

        if (newParams.table) {
          KarmaFieldsAlpha.Nav.set(newParams);

          const table = this.getTable();

          await table.load();

          // await this.queryTable();
        }

      },
      update: popup => {

        popup.element.classList.toggle("hidden", !KarmaFieldsAlpha.Nav.has("table") && !this.resource.navigation);
      },
      child: {
        class: "popup-content",
        children: [
          {
            class: "navigation karma-field-frame",
            update: navigation => {
              navigation.element.classList.toggle("hidden", !this.resource.navigation);
              if (this.resource.navigation) {
                navigation.child = this.createChild({
                  ...this.resource.navigation,
                  type: "navigation"
                }).build();
              }
            }
          },
          {
            class: "tables",
            update: container => {
              document.body.classList.toggle("karma-table-open", KarmaFieldsAlpha.Nav.has("table"));

              const tableId = KarmaFieldsAlpha.Nav.get("table");

              container.children = this.resource.tables.map((resource, index) => {
                return {
                  class: "table-container",
                  update: async container => {
                    container.element.classList.toggle("hidden", tableId !== resource.id);

                    // container.children = []

                    if (tableId === resource.id) {

                      const table = this.createChild({
                        type: "table",
                        ...resource.body
                      });

                      container.children = [
                        {
                          class: "karma-field-table",

                          update: async div => {
                            // this.render = div.render;

                            div.element.classList.add("table-loading");

                            // if (!table.idsBuffer.get()) {
                            //   await table.load(); // -> needed when fetching (table transfer). But not when undoing
                            // }


                            div.children = [
                              {
                                class: "karma-header table-main-header",
                                child: this.createChild({
                                  type: "header",
                                  ...resource.header
                                }).build()
                              },
                              {
                                class: "table-body",
                                update: container => {
                                  // container.element.classList.toggle("single-open", Boolean(modalOpen));
                                },
                                children: [
                                  {
                                    class: "karma-field-table-section karma-field-frame final",
                                    init: filters => {
                                      filters.element.classList.toggle("hidden", !resource.filters);
                                    },
                                    child: this.createChild({
                                      type: "group",
                                      ...resource.filters
                                    }).build()
                                  },
                                  ...(resource.subsections || []).map(subsection => {
                                    return {
                                      class: "karma-field-table-section karma-field-frame final",
                                      init: section => {
                                        if (subsection.style) {
                                          section.element.style = subsection.style;
                                        }
                                      },
                                      child: this.createChild(subsection).build()
                                    };
                                  }),
                                  {
                                    class: "table-body-columns",
                                    children: [
                                      {
                                        class: "table-body-column table-content",
                                        child: table.build()
                                      },
                                      {
                                        class: "table-body-column table-modal",
                                        update: container => {
                                          container.children = [];

                                          container.element.style.width = "0";

                                          const modalOpen = resource.modal || resource.body.modal && table.selectionBuffer.get();

                                          if (modalOpen) {
                                            container.children = [
                                              {
                                                class: "karma-modal",
                                                update: modal => {
                                                  // modal.element.style.minWidth = resource.modal && resource.modal.width || resource.body.modal && resource.body.modal.width || "30em";
                                                  modal.element.classList.toggle("hidden", !modalOpen);
                                                  modal.children = [];
                                                  if (resource.modal) {
                                                    modal.children.push(this.createChild({
                                                      type: "modal",
                                                      ...resource.modal
                                                    }).build());
                                                  }
                                                  if (resource.body.modal && table.selectionBuffer.get()) {
                                                    modal.children.push(table.createChild({
                                                      type: "modal",
                                                      ...resource.body.modal
                                                    }).build());
                                                  }
                                                }
                                              }
                                            ];
                                            container.element.style.width = resource.modal && resource.modal.width || resource.body.modal && resource.body.modal.width || "30em";

                                          }
                                        }



                                      }
                                    ]
                                  },

                                ]
                                // children: [
                                //   {
                                //     class: "table-modal",
                                //     update: container => {
                                //       container.children = [];
                                //
                                //       container.element.style.width = "0";
                                //
                                //       if (modalOpen) {
                                //         container.children = [
                                //           {
                                //             class: "karma-modal",
                                //             update: modal => {
                                //               modal.element.style.minWidth = resource.modal && resource.modal.width || "30em";
                                //               modal.children = [
                                //                 // {
                                //                 //   class: "karma-header table-modal-header",
                                //                 //   child: this.createChild({
                                //                 //     type: "header",
                                //                 //     ...resource.modal.header
                                //                 //   }).build()
                                //                 // },
                                //                 {
                                //                   class: "table-modal-body",
                                //                   update: body => {
                                //                     body.children = [];
                                //                     if (resource.modal) {
                                //                       body.children.push(this.createChild({
                                //                         type: "modal",
                                //                         ...resource.modal
                                //                       }).build());
                                //                     }
                                //                     if (resource.body.modal && table.selectionBuffer.get()) {
                                //                       const bodyModal = table.createChild({
                                //                         type: "modal",
                                //                         ...resource.body.modal
                                //                       });
                                //                       body.children.push(bodyModal.createChild({
                                //                         children: resource.body.modal.children,
                                //                         type: "group"
                                //                       }).build());
                                //                     }
                                //                   }
                                //                 }
                                //               ];
                                //             }
                                //           }
                                //         ];
                                //         container.element.style.width = resource.modal && resource.modal.width || resource.body.modal && resource.body.modal.width || "30em";
                                //
                                //       }
                                //     }
                                //   },
                                //   {
                                //     class: "table-main",
                                //     children: [
                                //
                                //       {
                                //         class: "table-main-body karma-field-frame",
                                //         children: [
                                //           {
                                //             class: "karma-field-table-section karma-field-frame final",
                                //             init: filters => {
                                //               filters.element.classList.toggle("hidden", !resource.filters);
                                //             },
                                //             child: this.createChild({
                                //               type: "group",
                                //               ...resource.filters
                                //             }).build()
                                //           },
                                //           ...(resource.subsections || []).map(subsection => {
                                //             return {
                                //               class: "karma-field-table-section karma-field-frame final",
                                //               init: section => {
                                //                 if (subsection.style) {
                                //                   section.element.style = subsection.style;
                                //                 }
                                //               },
                                //               child: this.createChild(subsection).build()
                                //             };
                                //           }),
                                //           table.build()
                                //         ]
                                //       }
                                //     ]
                                //   }
                                // ]
                              },
                              {
                                class: "table-footer table-control",
                                update: footer => {
                                  footer.element.classList.toggle("hidden", resource.controls === false);
                                  if (resource.controls !== false) {
                                    this.controls = this.createChild({
                                      type: "controls",
                                      ...resource.controls
                                    });
                                    this.controls.render = footer.render;
                                    footer.child = this.controls.build();
                                  }
                                }
                              }
                            ];
                          },
                          complete: div => {
                            div.element.classList.remove("table-loading");
                          }
                        }
                      ];
                    }
                  }
                };
              });
            }
          }
        ]
      }
    };
  }

}
