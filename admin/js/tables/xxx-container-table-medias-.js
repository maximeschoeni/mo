
KarmaFieldsAlpha.field.medias = class extends KarmaFieldsAlpha.field.table {

  static pile = [];

  constructor(...params) {
    super(...params);

    // compat

    if (this.resource.columns) {
      this.resource.children = this.resource.columns.map(column => {
        return {
          ...column,
          ...column.field
        };
      });
    }

    if (this.resource.children) {

      this.resource.content = {
        children: this.resource.children,
        id: this.resource.driver,
        params: this.resource.params,
        joins: this.resource.joins,
        ...this.resource.content
      }

      if (typeof this.resource.driver === "string") {

        const [request, ...joins] = this.resource.driver.split("+");
        const [driver, paramString] = request.split("?");

        this.resource.content.driver = driver;
        this.resource.content.params = KarmaFieldsAlpha.Params.parse(paramString);
        this.resource.content.joins = joins

      } else if (this.resource.driver && typeof this.resource.driver === "object") {

        this.resource.content.driver = this.resource.driver.name;
        this.resource.content.params = this.resource.params || this.resource.driver.params;
        this.resource.content.joins = this.resource.joins || this.resource.driver.joins || [];

      }

      if (this.resource.style) {
        this.resource.content.style = this.resource.style;
      }

    }



    this.interface = this.createChild({
      type: "collection",
      ...this.resource.content
    });


    // if (this.resource.modal) {
    //
    //   // this.modal = this.interface.createChild({
    //   //   type: "modal",
    //   //   ...this.resource.modal
    //   // });
    //
    //   this.modal = this.createChild({
    //     type: "modal",
    //     ...this.resource.modal
    //   });
    //
    // }

    // this.controls = this.createChild({
    //   id: "controls",
    //   type: "controls",
    //   ...this.resource.controls
    // });

  }




  async request(subject, content = {}, ...path) {


    switch (subject) {

      case "edit-selection": {
        return this.render();
      }

      case "ids": {
        return this.interface.getIds();
      }

      case "selectedIds": {
        return this.interface.getSelectedIds();
      }

      case "selection":
        return this.interface.getSelection();

      case "count":
        return this.interface.getCount();

      case "page":
        return this.interface.getPage();

      case "ppp":
        return this.interface.getPpp();

      case "lastpage": {
        const numpage = await this.interface.getNumPage();
        return numpage === this.interface.getPage();
      }

      case "numpage":
        return this.interface.getNumPage();

      case "nextpage": {
        const page = this.interface.getPage();
        const numpage = await this.interface.getNumPage();

        if (page < numpage) {
          KarmaFieldsAlpha.History.save();
          KarmaFieldsAlpha.Nav.change(page+1, page, "page");
          this.interface.unselect();
          await this.interface.queryIds();
          await this.render();
        }

        break;
      }

      case "prevpage": {
        const page = this.interface.getPage();
        if (page > 1) {
          KarmaFieldsAlpha.History.save();
          KarmaFieldsAlpha.Nav.change(page-1, page, "page");
          this.interface.unselect();
          await this.interface.queryIds();
          await this.render();
        }
        break;
      }

      case "firstpage": {
        const page = this.interface.getPage();
        if (page > 1) {
          KarmaFieldsAlpha.History.save();
          KarmaFieldsAlpha.Nav.change(1, page, "page");
          this.interface.unselect();
          await this.interface.queryIds();
          await this.render();
        }
        break;
      }

      case "tolastpage": {
        const page = this.interface.getPage();
        const numpage = await this.getNumPage();
        if (page < numpage) {
          KarmaFieldsAlpha.History.save();
          KarmaFieldsAlpha.Nav.change(numpage, page, "page");
          this.interface.unselect();
          await this.interface.queryIds();
          await this.render();
        }
        break;
      }

      case "add": {
        KarmaFieldsAlpha.History.save();
        const ids = await this.interface.add(content.data || {});
        // this.interface.select(0, 1);
        await this.render();
        break;
      }

      case "delete": {
        const selection = this.interface.selectionBuffer.get();
        if (selection) {
          KarmaFieldsAlpha.History.save();
          this.interface.unselect();
          await this.interface.remove(selection.index, selection.length);
          await this.render();
        }
        break;
      }

      case "duplicate": {
        const selection = this.interface.selectionBuffer.get();
        if (selection) {
          KarmaFieldsAlpha.History.save();
          await this.interface.duplicate(selection.index, selection.length);
          // this.server.store.empty();
          this.interface.cache.empty(); // buffer need to stay for history
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
        return KarmaFieldsAlpha.Nav.get("order") || this.interface.params.order;
      }

      case "orderby": {
        return KarmaFieldsAlpha.Nav.get("orderby") || this.interface.params.orderby;
      }

      case "toggle-order": {
        KarmaFieldsAlpha.History.save();
        this.interface.toggleOrder(content.key, content.order);
        this.interface.unselect();
        await this.interface.queryIds();
        await this.render();
        break;
      }


      case "fetch": {
        // -> table transfers

        const params = KarmaFieldsAlpha.Nav.get();

        KarmaFieldsAlpha.History.save();

        for (let key in {...params, ...content.params}) {
          KarmaFieldsAlpha.Nav.change(content.params[key] || "", undefined, key);
        }

        KarmaFieldsAlpha.field.table.pile.push({
          params: params,
          callback: content.callback
        });

        await this.parent.request("render");

        break;
      }


      case "insert": {

        const selection = this.interface.selectionBuffer.get();

        if (selection && KarmaFieldsAlpha.field.table.pile.length > 0) {

          KarmaFieldsAlpha.History.save();

          const ids = this.interface.getIds();
          const inputIds = ids.slice(selection.index, selection.index + selection.length);
          const state = KarmaFieldsAlpha.field.table.pile.pop();
          const currentParams = KarmaFieldsAlpha.Nav.get();

          for (let key in {...currentParams, ...state.params}) {
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

      default:
        return super.request(subject, content, ...path);

    }

  }

}



//
// KarmaFieldsAlpha.field.table = class extends KarmaFieldsAlpha.container {
//
//   static pile = [];
//
//   constructor(...params) {
//     super(...params);
//
//     // compat
//
//     if (this.resource.columns) {
//       this.resource.children = this.resource.columns.map(column => {
//         return {
//           ...column,
//           ...column.field
//         };
//       });
//     }
//
//     if (this.resource.children) {
//
//       this.resource.content = {
//         children: this.resource.children,
//         id: this.resource.driver,
//         params: this.resource.params,
//         joins: this.resource.joins,
//         ...this.resource.content
//       }
//
//       if (typeof this.resource.driver === "string") {
//
//         const [request, ...joins] = this.resource.driver.split("+");
//         const [driver, paramString] = request.split("?");
//
//         this.resource.content.driver = driver;
//         this.resource.content.params = KarmaFieldsAlpha.Params.parse(paramString);
//         this.resource.content.joins = joins
//
//       } else if (this.resource.driver && typeof this.resource.driver === "object") {
//
//         this.resource.content.driver = this.resource.driver.name;
//         this.resource.content.params = this.resource.params || this.resource.driver.params;
//         this.resource.content.joins = this.resource.joins || this.resource.driver.joins || [];
//
//       }
//
//       if (this.resource.style) {
//         this.resource.content.style = this.resource.style;
//       }
//
//     }
//
//
//
//     this.interface = this.createChild({
//       type: "collection",
//       ...this.resource.content
//     });
//
//
//     // if (this.resource.modal) {
//     //
//     //   // this.modal = this.interface.createChild({
//     //   //   type: "modal",
//     //   //   ...this.resource.modal
//     //   // });
//     //
//     //   this.modal = this.createChild({
//     //     type: "modal",
//     //     ...this.resource.modal
//     //   });
//     //
//     // }
//
//     // this.controls = this.createChild({
//     //   id: "controls",
//     //   type: "controls",
//     //   ...this.resource.controls
//     // });
//
//   }
//
//
//
//
//   async request(subject, content = {}, ...path) {
//
//
//     switch (subject) {
//
//       case "get": {
//         const [key] = path;
//         return KarmaFieldsAlpha.Nav.get(key) || "";
//       }
//
//       case "set": {
//         const [key] = path;
//
//         const value = KarmaFieldsAlpha.Type.toString(content.data) || "";
//         const current = KarmaFieldsAlpha.Nav.get(key) || "";
//
//         if (value !== current) {
//
//           KarmaFieldsAlpha.Nav.change(value, current, key);
//
//           const page = KarmaFieldsAlpha.Nav.get("page") || "1";
//
//           if (page !== "1") {
//
//             KarmaFieldsAlpha.Nav.change(1, page, "page");
//
//           }
//
//         }
//
//         break;
//       }
//
//       case "modified": {
//         return this.interface.isModified();
//       }
//
//       case "columns": { // -> column indexes
//         console.error("deprecated");
//         // return this.getColumns();
//       }
//
//       case "column": {
//         console.error("deprecated");
//         const data = [];
//
//         const ids = this.getIds();
//         const key = path[0];
//
//         for (let id of ids) {
//           const value = await this.interface.getInitial(id, key);
//           data.push(value);
//         }
//
//         return data;
//       }
//
//       case "ids": {
//         return this.interface.getIds();
//         break;
//       }
//
//       case "selectedIds": {
//         return this.interface.getSelectedIds();
//       }
//
//       // -> used by media "upper-folder"
//       case "query-ids": {
//         return this.interface.queryIds(); // collection only !
//       }
//
//       // -> like get_post()
//       // -> for media breadcrumb (ancestors)
//       case "queryid": {
//         return this.interface.get(content.id);
//         // return KarmaFieldsAlpha.Gateway.get("get/"+this.driver+"/"+content.id);
//       }
//
//       case "edit": {
//         // this.expressionCache.remove();
//         // this.server.store.empty();
//
//         this.interface.selectionBuffer.change(null); // -> when a filter is changed
//
//         this.interface.cache.empty(); // buffer need to stay for history
//         await this.queryIds();
//         await this.render();
//         break;
//       }
//
//       case "edit-selection": {
//         return this.render();
//       }
//
//       case "selection":
//       case "actives":
//         return this.interface.getSelection();
//
//       case "has-undo":
//         return KarmaFieldsAlpha.History.hasUndo();
//
//       case "has-redo":
//         return KarmaFieldsAlpha.History.hasRedo();
//
//       case "count":
//         return this.interface.getCount();
//
//       case "page":
//         return this.interface.getPage();
//
//       case "ppp":
//         return this.interface.getPpp();
//
//       case "lastpage": {
//         const numpage = await this.interface.getNumPage();
//         return numpage === this.interface.getPage();
//       }
//
//       case "numpage":
//         return this.interface.getNumPage();
//
//       case "nextpage": {
//         const page = this.interface.getPage();
//         const numpage = await this.interface.getNumPage();
//
//         if (page < numpage) {
//           KarmaFieldsAlpha.History.save();
//           KarmaFieldsAlpha.Nav.change(page+1, page, "page");
//           this.interface.unselect();
//           await this.interface.queryIds();
//           await this.render();
//         }
//
//         break;
//       }
//
//       case "prevpage": {
//         const page = this.interface.getPage();
//         if (page > 1) {
//           KarmaFieldsAlpha.History.save();
//           KarmaFieldsAlpha.Nav.change(page-1, page, "page");
//           this.interface.unselect();
//           await this.interface.queryIds();
//           await this.render();
//         }
//         break;
//       }
//
//       case "firstpage": {
//         const page = this.interface.getPage();
//         if (page > 1) {
//           KarmaFieldsAlpha.History.save();
//           KarmaFieldsAlpha.Nav.change(1, page, "page");
//           this.interface.unselect();
//           await this.interface.queryIds();
//           await this.render();
//         }
//         break;
//       }
//
//       case "tolastpage": {
//         const page = this.interface.getPage();
//         const numpage = await this.getNumPage();
//         if (page < numpage) {
//           KarmaFieldsAlpha.History.save();
//           KarmaFieldsAlpha.Nav.change(numpage, page, "page");
//           this.interface.unselect();
//           await this.interface.queryIds();
//           await this.render();
//         }
//         break;
//       }
//
//       case "reload": {
//         this.interface.initialBuffer.empty();
//         this.interface.cache.empty();
//         await this.interface.queryIds();
//         await this.render();
//         break;
//       }
//
//       case "add": {
//         KarmaFieldsAlpha.History.save();
//         const ids = await this.interface.add(content.data || {});
//         // this.interface.select(0, 1);
//         await this.render();
//         break;
//
//       }
//
//       case "delete": {
//         const selection = this.interface.selectionBuffer.get();
//         if (selection) {
//           KarmaFieldsAlpha.History.save();
//           this.interface.unselect();
//           await this.interface.remove(selection.index, selection.length);
//           await this.render();
//         }
//         break;
//       }
//
//       case "export": {
//         return this.interface.export(content.keys, content.index, content.length);
//       }
//
//       case "import": {
//         KarmaFieldsAlpha.History.save();
//         this.interface.import(content.data, content.index, content.length);
//         await this.render();
//         break;
//       }
//
//       case "duplicate": {
//         const selection = this.interface.selectionBuffer.get();
//         if (selection) {
//           KarmaFieldsAlpha.History.save();
//           await this.interface.duplicate(selection.index, selection.length);
//           // this.server.store.empty();
//           this.interface.cache.empty(); // buffer need to stay for history
//           await this.render();
//         }
//         break;
//       }
//
//
//       case "save":
//         await this.interface.send();
//         this.interface.cache.empty(); // buffer need to stay for history
//         const selection = this.interface.selectionBuffer.get();
//         await this.interface.queryIds();
//         await this.render();
//         break;
//
//       case "undo": {
//         KarmaFieldsAlpha.History.undo();
//         return this.parent.request(subject);
//       }
//
//       case "redo": {
//         KarmaFieldsAlpha.History.redo();
//         return this.parent.request(subject);
//       }
//
//       case "close":
//         this.interface.cache.empty(); // buffer need to stay for history
//         KarmaFieldsAlpha.History.save();
//         this.interface.unselect();
//         this.interface.idsBuffer.change(null);
//         await this.parent.request("close");
//         break;
//
//       // modal:
//       case "prev": {
//         let selection = this.interface.selectionBuffer.get();
//         if (selection && selection.index > 0) {
//           KarmaFieldsAlpha.History.save();
//           this.interface.select(selection.index - 1, 1);
//           await this.render();
//         }
//         break;
//       }
//
//       case "next": {
//         let selection = this.interface.selectionBuffer.get();
//         const ids = this.interface.getIds();
//         if (selection && selection.index < ids.length - 1) {
//           KarmaFieldsAlpha.History.save();
//           this.interface.select(selection.index + 1, 1);
//           await this.render();
//         }
//         break;
//       }
//
//       case "clear-selection":
//       case "close-modal": {
//         KarmaFieldsAlpha.History.save();
//         this.interface.unselect();
//         await this.render();
//         break;
//       }
//
//       case "order": {
//         return KarmaFieldsAlpha.Nav.get("order") || this.interface.params.order;
//       }
//
//       case "orderby": {
//         return KarmaFieldsAlpha.Nav.get("orderby") || this.interface.params.orderby;
//       }
//
//       case "toggle-order": {
//         KarmaFieldsAlpha.History.save();
//         this.interface.toggleOrder(content.key, content.order);
//         this.interface.unselect();
//         await this.interface.queryIds();
//         await this.render();
//         break;
//       }
//
//
//       case "fetch": {
//         // -> table transfers
//
//         const params = KarmaFieldsAlpha.Nav.get();
//
//         KarmaFieldsAlpha.History.save();
//
//         for (let key in {...params, ...content.params}) {
//           KarmaFieldsAlpha.Nav.change(content.params[key] || "", undefined, key);
//         }
//
//         KarmaFieldsAlpha.field.table.pile.push({
//           params: params,
//           callback: content.callback
//         });
//
//         await this.parent.request("render");
//
//         break;
//       }
//
//
//       case "insert": {
//
//         const selection = this.interface.selectionBuffer.get();
//
//         if (selection && KarmaFieldsAlpha.field.table.pile.length > 0) {
//
//           KarmaFieldsAlpha.History.save();
//
//           const ids = this.interface.getIds();
//           const inputIds = ids.slice(selection.index, selection.index + selection.length);
//           const state = KarmaFieldsAlpha.field.table.pile.pop();
//           const currentParams = KarmaFieldsAlpha.Nav.get();
//
//           for (let key in {...currentParams, ...state.params}) {
//             KarmaFieldsAlpha.Nav.change(state.params[key] || "", undefined, key);
//           }
//
//           await state.callback(inputIds);
//
//           return this.parent.request("render");
//
//         }
//
//         break;
//       }
//
//       case "pile": {
//         return KarmaFieldsAlpha.field.table.pile;
//       }
//
//       case "render": {
//         await this.render();
//         break;
//       }
//
//       case "render-controls":
//         return this.controls.render();
//
//       default:
//         return this.parent.request(subject, content, ...path);
//
//     }
//
//   }
//
//   build() {
//     return {
//       class: "karma-field-table",
//
//       update: async table => {
//         this.render = table.render;
//
//         table.element.classList.add("table-loading");
//
//         const modalOpen = this.resource.modal || this.interface.resource.modal && this.interface.selectionBuffer.get();
//
//         table.children = [
//           {
//             class: "table-body",
//             update: container => {
//               container.element.classList.toggle("single-open", Boolean(modalOpen));
//             },
//             children: [
//               {
//                 class: "table-modal",
//                 update: container => {
//                   container.children = [];
//                   if (modalOpen) {
//                     container.children = [
//                       {
//                         class: "karma-modal",
//                         update: modal => {
//                           modal.element.style.minWidth = this.resource.width || "30em";
//                           modal.children = [
//                             {
//                               class: "karma-header table-modal-header",
//                               child: this.createChild({
//                                 type: "header",
//                                 ...this.resource.modal.header
//                               }).build()
//                             },
//                             {
//                               class: "table-modal-body",
//                               update: body => {
//                                 body.children = [];
//                                 if (this.resource.modal) {
//                                   body.children.push(this.createChild({
//                                     type: "modal",
//                                     ...this.resource.modal
//                                   }).build());
//                                 }
//                                 if (this.interface.resource.modal) {
//                                   body.children.push(this.interface.createChild({
//                                     type: "modal",
//                                     ...this.resource.modal
//                                   }).build());
//                                 }
//
//                               }
//                             }
//                           ];
//                         }
//                       }
//                     ];
//                   }
//                   container.element.style.width = this.resource.modal && this.resource.modal.width || this.interface.resource.modal && this.interface.resource.modal.width || "30em";
//                 }
//               },
//               {
//                 class: "table-main",
//                 children: [
//                   {
//                     class: "karma-header table-main-header",
//                     child: this.createChild({
//                       type: "header",
//                       ...this.resource.header
//                     }).build()
//                   },
//                   {
//                     class: "table-main-body karma-field-frame",
//                     children: [
//                       {
//                         class: "karma-field-table-section karma-field-frame final",
//                         init: filters => {
//                           filters.element.classList.toggle("hidden", !this.resource.filters);
//                         },
//                         child: this.createChild({
//                           type: "group",
//                           ...this.resource.filters
//                         }).build()
//                       },
//                       ...(this.resource.subsections || []).map(resource => {
//                         return {
//                           class: "karma-field-table-section karma-field-frame final",
//                           init: section => {
//                             if (resource.style) {
//                               section.element.style = resource.style;
//                             }
//                           },
//                           child: this.createChild(resource).build()
//                         };
//                       }),
//                       this.interface.build()
//                     ]
//                   }
//                 ]
//               }
//             ]
//           },
//           {
//             class: "table-footer table-control",
//             update: footer => {
//               this.controls.render = footer.render;
//               footer.element.classList.toggle("hidden", this.resource.controls === false);
//               if (this.resource.controls !== false) {
//                 footer.child = this.controls.build();
//               }
//             }
//           }
//         ];
//       },
//       complete: table => {
//         table.element.classList.remove("table-loading");
//       }
//     };
//   }
//
//   static content = class extends KarmaFieldsAlpha.field.form {
//
//     build() {
//
//       return {
//         class: "karma-field-table-grid-container",
//         child: super.build()
//       }
//
//     }
//
//   }
//
//
//   static controls = class extends KarmaFieldsAlpha.field.group {
//
//     constructor(resource, ...args) {
//
//       const defaultResource = {
//         id: "controls",
//         display: "flex",
//         children: [
//           "reload",
//           "save",
//           "add",
//           "delete",
//           "separator",
//           "undo",
//           "redo"
//         ]
//       };
//
//       super({
//         ...defaultResource,
//         ...resource
//       }, ...args);
//
//     }
//
//
//
//     static save = {
//       id: "save",
//   		type: "button",
//       action: "save",
//       title: "Save",
//       // disabled: "!modified",
//       // disabled: ["!", ["request", "modified", "boolean"]],
//       disabled: ["!", ["modified"]],
//       primary: true
//       // test: ["modified"]
//     }
//
//   	static add = {
//       id: "add",
//   		type: "button",
//       action: "add",
//       title: "Add"
//     }
//
//   	static delete = {
//       id: "delete",
//   		type: "button",
//       action: "delete",
//       title: "Delete",
//       // disabled: "!selection"
//       disabled: ["!", ["request", "selection", "string"]]
//     }
//
//   	static undo = {
//       id: "undo",
//   		type: "button",
//       action: "undo",
//       dashicon: "undo",
//       // disabled: "!undo"
//       disabled: ["!", ["request", "has-undo", "boolean"]]
//     }
//
//   	static redo = {
//       id: "redo",
//   		type: "button",
//       action: "redo",
//       dashicon: "redo",
//       // disabled: "!redo"
//       disabled: ["!", ["request", "has-redo", "boolean"]]
//     }
//
//     static separator = {
//       id: "separator",
//   		type: "separator"
//     }
//
//     static reload = {
//       id: "reload",
//   		type: "button",
//       action: "reload",
//       title: "Reload"
//     }
//
//     static insert = {
//       id: "insert",
//       type: "button",
//       action: "insert",
//       primary: true,
//       title: "Insert",
//       disabled: ["!", ["request", "selection", "object"]],
//       hidden: ["empty", ["request", "pile", "array"]]
//     }
//
//   }
//
//   static header = class extends KarmaFieldsAlpha.field.group {
//
//     constructor(resource) {
//
//       const defaultResource = {
//         id: "header",
//         display: "flex",
//         children: [
//           "title",
//           "count",
//           "pagination",
//           "close"
//         ]
//       };
//
//       super({
//         ...defaultResource,
//         ...resource
//       });
//
//     }
//
//     static title = class extends KarmaFieldsAlpha.field.text {
//
//       constructor(resource) {
//
//         const defaultResource = {
//           id: "title",
//           tag: "h1",
//           style: "flex-grow:1",
//           class: "ellipsis",
//           value: "Table"
//         };
//
//         super({...defaultResource, ...resource});
//
//       }
//
//     }
//
//     static count = {
//       id: "count",
//       type: "text",
//       style: "justify-content:center;white-space: nowrap;",
//       value: ["replace", "# elements", "#", ["request", "count", "string"]],
//       dynamic: true
//     }
//
//     static options = {
//       id: "options",
//       type: "button",
//       title: "Options",
//       action: "toggle-options"
//     }
//
//     static close = {
//       id: "close",
//       type: "button",
//       text: "×",
//       title: "Close Table",
//       action: "close"
//     }
//
//     static pagination = class extends KarmaFieldsAlpha.field.group {
//
//       constructor(resource) {
//
//         const defaultResource = {
//           id: "pagination",
//           type: "group",
//           display: "flex",
//           style: "flex: 0 1 auto;min-width:0",
//           hidden: ["==", ["request", "numpage", "number"], 1],
//           children: [
//             "firstpage",
//             "prevpage",
//             "currentpage",
//             "nextpage",
//             "lastpage"
//           ]
//         }
//
//         super({
//           ...defaultResource,
//           ...resource
//         });
//       }
//
//       static firstpage = {
//         id: "firstpage",
//     		type: "button",
//         action: "firstpage",
//         title: "First Page",
//         text: "«",
//         disabled: ["==", ["request", "page", "number"], 1]
//       }
//
//       static prevpage = {
//         id: "prevpage",
//     		type: "button",
//         action: "prevpage",
//         title: "Previous Page",
//         text: "‹",
//         disabled: ["==", ["request", "page", "number"], 1]
//       }
//
//       static currentpage = {
//         id: "currentpage",
//     		type: "text",
//         style: "min-width: 4em;text-align: right;",
//         value: ["replace", "# / #", "#", ["request", "page", "string"], ["request", "numpage", "string"]]
//       }
//
//     	static nextpage = {
//         id: "nextpage",
//     		type: "button",
//         action: "nextpage",
//         title: "Next Page",
//         text: "›",
//         disabled: ["request", "lastpage", "boolean"]
//       }
//
//     	static lastpage = {
//         id: "lastpage",
//     		type: "button",
//         action: "tolastpage",
//         title: "Last Page",
//         text: "»",
//         disabled: ["request", "lastpage", "boolean"]
//       }
//
//     }
//
//   }
//
//   static filters = class extends KarmaFieldsAlpha.field.group {
//
//   }
//
//
//   static modal = class extends KarmaFieldsAlpha.field.group {
//
//     static header = class extends KarmaFieldsAlpha.field.group {
//
//       constructor(resource) {
//
//         const defaultResource = {
//           id: "header",
//           display: "flex",
//           children: [
//             "title",
//             "separator",
//             "prev",
//             "next",
//             "close"
//           ]
//         };
//
//
//         super({...defaultResource, ...resource});
//       }
//
//       static title = class extends KarmaFieldsAlpha.field.text {
//
//         constructor(resource, ...args) {
//           const defaultResource = {
//             id: "title",
//             tag: "h1",
//             style: "flex-grow:1",
//             class: "ellipsis",
//             value: "Single"
//           };
//
//           super({...defaultResource, ...resource});
//         }
//
//       }
//
//       static prev = {
//         id: "prev",
//         type: "button",
//         action: "prev",
//         title: "Previous Item",
//         text: "‹"
//       }
//
//       static next = {
//         id: "next",
//         type: "button",
//         action: "next",
//         title: "Next Item",
//         text: "›"
//       }
//
//       static close = {
//         id: "close",
//         type: "button",
//         title: "Close Modal",
//         text: "×",
//         action: "close"
//       }
//
//     }
//
//   }
//
//
//
//
//
// }
