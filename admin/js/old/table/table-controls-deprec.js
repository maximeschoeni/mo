// KarmaFieldsAlpha.fields.tableControls =  {}


// KarmaFieldsAlpha.fields.tableControls.button = class {
//
//   constructor(resource) {
//     this.resource = resource;
//   }
//
//   init() {}
//   update() {}
//   onLoad() {}
//
//   async load(promise) {
//     this.onLoad(true);
//     const results = await promise;
//     this.onLoad(false);
//     return results;
//   }
//
//   build(...args) {
//     return {
//       tag: "button",
//       class: "karma-button footer-item",
//       init: (button) => {
//         if (this.resource.primary) {
//           button.element.classList.add("primary");
//         }
//         button.element.title = this.resource.name || this.resource.type || "";
//         this.init(button.element, ...args);
//       },
//       children: [
//         {
//           tag: "span",
//           class: "button-content",
//           init: content => {
//             content.element.innerHTML = this.resource.name || this.resource.type || "";
//           }
//         },
//         {
//           class: "karma-field-spinner"
//         }
//       ],
//       update: button => {
//         // this.onLoad = loading => button.element.classList.toggle("loading", loading);
//         this.update(button.element, ...args);
//       }
//     }
//   }
//
//
//
//
// }

// KarmaFieldsAlpha.fields.tableControls.optionsButton = class {
//
//   buildMain(element, field) {
//   }
//
//   buildOption(element, item, field) {
//   }
//
//   build(...field) {
//     return {
//       class: "ppp-selector footer-item",
//       init: item => {
//         item.element.tabIndex = "-1"; // for safari
//       },
//       children: [
//         {
//           tag: "button",
//           class: "karma-button current-page footer-item",
//           update: item => {
//             this.buildMain(item.element, ...field);
//           }
//         },
//         {
//           class: "ppp-selector-options",
//           child: {
//             tag: "ul",
//             children: this.options.map(item => {
//               return {
//                 tag: "li",
//                 update: li => {
//                   const button = new KarmaFieldsAlpha.fields.tableControls.button({
//                     name: item.value
//                   });
//                   button.update = element => {
//                     this.buildOption(element, item, ...field);
//                   }
//                   li.child = button.build();
//                 }
//               };
//             })
//           }
//         }
//       ]
//     }
//   }
// }


// KarmaFieldsAlpha.fields.tableControls.save = class extends KarmaFieldsAlpha.fields.tableControls.button {
//
//   // constructor() {
//   //   super();
//   //   this.class = "primary";
//   //   this.resource.name = "Save";
//   // }
//
//   update(element, field) {
//     element.onclick = async (event) => {
//       if (field.content.hasDelta()) {
//         element.classList.add("loading");
//         await field.sync();
//         await field.render();
//         element.blur();
//         element.classList.remove("loading");
//       }
//     }
//     element.disabled = !field.content.hasDelta();
//   }
//
// }

// KarmaFieldsAlpha.fields.tableControls.undo = class extends KarmaFieldsAlpha.fields.tableControls.button {
//
//   // constructor() {
//   //   super();
//   //   this.name = "Undo";
//   // }
//
//   update(element, field) {
//     element.onclick = async (event) => {
//       //await this.load(field.content.undo());
//
//       field.content.undo();
//       field.setHistoryIndex(field.content.historyIndex);
//
//       element.classList.add("loading");
//       // await field.update();
//       await field.render();
//       element.classList.remove("loading");
//
//
//
//
//       // await field.try("onSetHeader");
//       // await this.load(field.try("onSetBody"));
//       // await field.try("onSetFooter");
//
//       // this.load(new Promise(resolve => {
//       //
//       //
//       //   requestIdleCallback(() => {
//       //
//       //     resolve();
//       //   });
//       //   // setTimeout(() => {
//       //   //   field.try("onSetBody");
//       //   //   field.try("onSetFooter");
//       //   //   resolve();
//       //   // }, 100);
//       // }));
//
//
//
//
//
//     }
//     element.disabled = !field.content.hasUndo();
//     element.title = field.content.countUndo();
//   }
//
// }

// KarmaFieldsAlpha.fields.tableControls.redo = class extends KarmaFieldsAlpha.fields.tableControls.button {
//
//   // constructor() {
//   //   super();
//   //   this.name = "Redo";
//   // }
//
//   update(element, field) {
//     element.onclick = async (event) => {
//       // field.content.redo();
//       field.content.redo()
//
//       // await this.load(field.content.update());
//
//
//
//
//       field.setHistoryIndex(field.content.historyIndex-0);
//
//       element.classList.add("loading");
//       // await field.update();
//       await field.render();
//       element.classList.remove("loading");
//
//       // field.try("onSetHeader");
//       // field.try("onSetBody");
//       // field.try("onSetFooter");
//
//       // this.load(new Promise(resolve => {
//       //
//       //
//       //   requestIdleCallback(() => {
//       //     field.try("onSetHeader");
//       //     field.try("onSetBody");
//       //     field.try("onSetFooter");
//       //     resolve();
//       //   });
//       //   // setTimeout(() => {
//       //   //   field.try("onSetBody");
//       //   //   field.try("onSetFooter");
//       //   //   resolve();
//       //   // }, 100);
//       // }));
//
//       // field.try("onSetBody");
//       // field.try("onSetFooter");
//
//
//     }
//
//     element.disabled = !field.content.hasRedo(); //field.domain.index >= field.domain.max;
//     element.title = field.content.countRedo();
//   }
//
// }

// KarmaFieldsAlpha.fields.tableControls.add = class extends KarmaFieldsAlpha.fields.tableControls.button {
//
//   // constructor() {
//   //   super();
//   //   this.name = "Add";
//   // }
//
//   update(element, field) {
//     element.onclick = async (event) => {
//
//       element.classList.add("loading");
//       await field.add();
//       await field.render();
//       element.classList.remove("loading");
//
//       // this.load(field.add()).then(() => {
//       //   // field.render();
//       //
//       //   field.try("onSetBody");
//       //   field.try("onSetFooter");
//       // });
//     }
//   }
//
// }

// KarmaFieldsAlpha.fields.tableControls.delete = class extends KarmaFieldsAlpha.fields.tableControls.button {
//
//   // constructor() {
//   //   super();
//   //   this.name = "Delete";
//   // }
//
//   update(element, field) {
//     element.onmousedown = async (event) => {
//       event.preventDefault(); // prevent current table cell losing focus
//       // await this.load(this.load(field.remove()));
//       // await this.load(field.update());
//
//       element.classList.add("loading");
//       await field.remove();
//       await field.render();
//       element.classList.remove("loading");
//
//       // this.load(field.remove()).then(() => {
//       //
//       //   field.select.removeFocus();
//       //   // field.render();
//       //
//       //   field.try("onSetBody");
//       //   field.try("onSetFooter");
//       // });
//     }
//     element.disabled = !(field.select.selection && field.select.selection.width === field.select.grid.width);
//   }
//
// }

// KarmaFieldsAlpha.fields.tableControls.reload = class extends KarmaFieldsAlpha.fields.tableControls.button {
//
//   // constructor() {
//   //   super();
//   //   this.name = "Reload";
//   // }
//
//   update(element, field) {
//     element.onclick = async (event) => {
//       KarmaFieldsAlpha.Form.cache = {}; // deprecated
//       KarmaFieldsAlpha.cache = {};
//   		field.content.original = {};
//       field.paramString = undefined;
//
//       // debugger;
//
//       element.classList.add("loading");
//       // await field.update();
//       await field.render();
//       element.classList.remove("loading");
//
//       // this.load(field.query().then(() => {
//       //   // field.render();
//       //
//       //   field.try("onSetHeader");
//       //   field.try("onSetBody");
//       //   field.try("onSetFooter");
//       // }));
//     }
//   }
//
// }

//
// KarmaFieldsAlpha.fields.tableControls.firstPage = class extends KarmaFieldsAlpha.fields.tableControls.button {
//   update(element, field) {
//     const count = field.getCount();
//     const page = Number(field.getParam("page") || 1);
//     const ppp = Number(field.getParam("ppp") || 100);
//
//     element.classList.toggle("hidden", ppp < 1 || count < ppp);
//     element.disabled = (page == 1);
//     element.onclick = async (event) => {
//       if (page > 0) {
//         element.classList.add("loading");
//         field.setParam("page", page-1);
//         await field.render();
//         element.classList.remove("loading");
//       }
//     }
//   }
// }
// KarmaFieldsAlpha.fields.tableControls.prevPage = class extends KarmaFieldsAlpha.fields.tableControls.button {
//   update(element, field) {
//     const count = field.getCount();
//     const page = Number(field.getParam("page") || 1);
//     const ppp = Number(field.getParam("ppp") || 100);
//
//     element.classList.toggle("hidden", ppp < 1 || count < ppp);
//     element.disabled = (page === 1);
//
//     element.onclick = async (event) => {
//       if (page > 0) {
//         element.classList.add("loading");
//         field.setParam("page", page-1);
//
//         await field.render();
//         element.classList.remove("loading");
//       }
//     }
//   }
// }
// KarmaFieldsAlpha.fields.tableControls.nextPage = class extends KarmaFieldsAlpha.fields.tableControls.button {
//   update(element, field) {
//     const count = field.getCount();
//     const page = Number(field.getParam("page") || 1);
//     const ppp = Number(field.getParam("ppp") || 100);
//     const numPage = Math.ceil(count/ppp);
//
//     element.classList.toggle("hidden", ppp < 1 || count < ppp);
//     element.disabled = page >= numPage;
//
//     element.onclick = async (event) => {
//       if (page < numPage) {
//         element.classList.add("loading");
//         field.setParam("page", page+1);
//         await field.render();
//         element.classList.remove("loading");
//       }
//     }
//   }
// }
// KarmaFieldsAlpha.fields.tableControls.lastPage = class extends KarmaFieldsAlpha.fields.tableControls.button {
//   update(element, field) {
//     const count = field.getCount();
//     const page = Number(field.getParam("page") || 1);
//     const ppp = Number(field.getParam("ppp") || 100);
//     const numPage = Math.ceil(count/ppp);
//
//     element.classList.toggle("hidden", ppp < 1 || count < ppp);
//     element.disabled = page >= numPage;
//
//     element.onclick = async (event) => {
//       if (page < numPage) {
//         element.classList.add("loading");
//         field.setParam("page", numPage);
//         await field.render();
//         element.classList.remove("loading");
//       }
//     }
//   }
// }
//
// KarmaFieldsAlpha.fields.tableControls.currentPage = class {
//   build(field) {
//     return {
//       class: "current-page footer-item",
//       update: item => {
//         const count = field.getCount();
//         const page = Number(field.getParam("page") || 1);
//         const ppp = Number(field.getParam("ppp") || 100);
//
//         item.element.classList.toggle("hidden", ppp < 1 || count < ppp);
//         item.element.textContent = count && page+" / "+Math.ceil(count/ppp) || "";
//       }
//     }
//   }
// }
//
//
// KarmaFieldsAlpha.fields.tableControls.ppp = class extends KarmaFieldsAlpha.fields.tableControls.optionsButton {
//
//   constructor(resource) {
//     super();
//     this.options = resource.options || [
//       {key: 100, value: "100&nbsp;items/page"},
//       {key: 200, value: "200&nbsp;items/page"},
//       {key: 500, value: "500&nbsp;items/page"},
//       {key: 0, value: "all"}
//     ];
//   }
//
//   buildMain(element, field) {
//     let num = field.getCount();
//     element.textContent = num ? num + " items" : "";
//   }
//
//   buildOption(element, item, field) {
//     const ppp = Number(field.getParam("ppp") || 100);
//     element.classList.toggle("active", ppp == item.key);
//
//     element.onclick = async (event) => {
//
//       field.setParam("ppp", item.key);
//       field.setParam("page", 1);
//       element.classList.add("loading");
//       await field.render();
//       element.classList.remove("loading");
//
//       document.activeElement.blur(); // for safari
//     }
//   }
//
// }


// KarmaFieldsAlpha.fields.tableControls.order = class {
//
//   reorder(column, field) {
//     const orderby = field.getParam("orderby");
//     const order = field.getParam("order");
//
//     if (orderby === column.field.key) {
//       field.setParam("order", order === "asc" ? "desc" : "asc");
//     } else {
//       field.setParam("order", column.order || "asc");
//       field.setParam("orderby", column.field.key);
//     }
//   }
//
//   build(column, field) {
//     return {
//       tag: "a",
//       class: "header-cell-order",
//       child: {
//         class: "karma-field-spinner"
//       },
//       update: a => {
//         const orderby = field.getParam("orderby");
//         const order = field.getParam("order") || column.order;
//
//         a.element.onclick = async event => {
//           event.preventDefault();
//           a.element.classList.add("loading");
//           this.reorder(column, field);
//
//           await field.render();
//           a.element.classList.remove("loading");
//         };
//         a.element.classList.toggle("asc", orderby === column.field.key && order === "asc");
//         a.element.classList.toggle("desc", orderby === column.field.key && order === "desc");
//       }
//     };
//   }
// }


// KarmaFieldsAlpha.fields.table.Order = class {
//
//   buildOrderLink(field, column) {
//     return {
//       tag: "a",
//       class: "header-cell-order",
//       child: {
//         class: "karma-field-spinner"
//       },
//       update: a => {
//         const orderby = field.getParam("orderby");
//         const order = field.getParam("order") || column.order;
//
//         a.element.onclick = async event => {
//           event.preventDefault();
//           a.element.classList.add("loading");
//           field.reorder(column);
//
//           await field.render();
//           a.element.classList.remove("loading");
//         };
//         a.element.classList.toggle("asc", orderby === column.field.key && order === "asc");
//         a.element.classList.toggle("desc", orderby === column.field.key && order === "desc");
//       }
//     };
//   }
// }


//
// KarmaFieldsAlpha.fields.tableControls.prevModal = class extends KarmaFieldsAlpha.fields.tableControls.button {
//   update(element, field) {
//     const ids = field.getCurrentIds();
//     let id = field.getParam("id");
//     let index = ids.indexOf(id);
//     element.disabled = index < 1;
//
//     element.onclick = async (event) => {
//       if (index > 0) {
//         id = ids[index-1];
//         element.classList.add("loading");
//         field.setParam("id", id);
//         await field.renderModal();
//         await field.renderFooter();
//         element.classList.remove("loading");
//       }
//     }
//   }
// }
//
// KarmaFieldsAlpha.fields.tableControls.nextModal = class extends KarmaFieldsAlpha.fields.tableControls.button {
//   update(element, field) {
//     const ids = field.getCurrentIds();
//     let id = field.getParam("id");
//     let index = ids.indexOf(id);
//     element.disabled = index === -1 || index >= ids.length - 1;
//
//     element.onclick = async (event) => {
//       if (index > -1 && index < ids.length - 1) {
//         id = ids[index+1];
//         element.classList.add("loading");
//         field.setParam("id", id);
//         await field.renderModal();
//         await field.renderFooter();
//         element.classList.remove("loading");
//       }
//     }
//   }
// }



KarmaFieldsAlpha.fields.table.Controls = class {

  static buildBasicButton(name, title) {
    return {
      tag: "button",
      class: "karma-button footer-item",
      init: (button) => {
        button.element.title = title || "Save";
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "Save";
          }
        }
        // ,
        // {
        //   class: "karma-field-spinner"
        // }
      ]
    }
  }


  static buildSaveButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button footer-item primary",
      init: (button) => {
        button.element.title = title || "Save";
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "Save";
          }
        },
        {
          class: "karma-field-spinner"
        }
      ],
      update: button => {
        // const delta = field.getDelta();
        button.element.onclick = async (event) => {
          // if (field.content.hasDelta()) {
          // if (delta && delta.has()) {
          if (field.content.getDeltaValue()) {
            button.element.classList.add("loading");
            await field.sync();
            await field.render();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
        // button.element.disabled = !field.content.hasDelta();
        // console.log(field.content.hasDeltaEntry());
        button.element.disabled = !field.content.getDeltaValue();
      }
    };
  }


  static buildUndoButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button",
      init: button => {
        button.element.innerHTML = '<span class="button-content dashicons dashicons-undo"></span>';
        button.element.onclick = event => {
          history.back();
        }
      },
      update: button => {
        const currentIndex = history.state && history.state.karmaIndex || 0;
        const maxIndex = KarmaFieldsAlpha.History.index || 0;
        button.element.disabled = !(currentIndex > 0);
      }
    };
  }




  static buildRedoButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button",
      init: button => {
        button.element.innerHTML = '<span class="button-content dashicons dashicons-redo"></span>';
        button.element.onclick = event => {
          history.forward();
        }
      },
      update: button => {
        const currentIndex = history.state && history.state.karmaIndex || 0;
        const maxIndex = KarmaFieldsAlpha.History.index || 0;
        button.element.disabled = !(currentIndex < maxIndex);
      }
    };
    // return {
    //   ...this.buildBasicButton(name || "Redo", title || "Redo"),
    //   update: button => {
    //     button.element.onclick = async (event) => {
    //       // field.content.redo();
    //       // field.setHistoryIndex(field.content.historyIndex-0);
    //
    //       button.element.classList.add("loading");
    //       await field.render();
    //       button.element.classList.remove("loading");
    //     }
    //
    //     button.element.disabled = !field.content.hasRedo(); //field.domain.index >= field.domain.max;
    //     button.element.title = field.content.countRedo();
    //   }
    // };
  }


  static buildAddButton(field, name, title) {
    return {
      ...this.buildBasicButton(name || "Add", title || "Add"),
      update: button => {
        if (field.resource.controls && field.resource.controls.add === false || field.resource.controls === false) {
          button.element.disabled = true;
        } else {
          button.element.onclick = async (event) => {
            button.element.classList.add("loading");
            await field.add();

            // console.log("add");
            // await field.render();
            await field.editParam();
            button.element.classList.remove("loading");
          };
        }
      }
    };
  }


  static buildDeleteButton(field, name, title) {
    return {
      ...this.buildBasicButton(name || "Delete", title || "Delete"),
      update: button => {
        if (field.resource.controls && field.resource.controls.delete === false || field.resource.controls === false) {
          button.element.disabled = true;
        } else {
          button.element.onmousedown = async (event) => {
            // event.preventDefault(); // prevent current table cell losing focus
            button.element.classList.add("loading");
            // field.select.removeFocus();
            await field.remove();

            // await field.render();
            button.element.classList.remove("loading");
          }

          button.element.disabled = !KarmaFieldsAlpha.History.hasParam("id") && !(field.select.selection && field.select.selection.width === field.select.grid.width);
        }
      }
    };
  }

  static buildDuplicateButton(field, name, title) {
    return {
      ...this.buildBasicButton(name || "Duplicate", title || "Duplicate"),
      update: button => {
        if (field.resource.controls && field.resource.controls.add === false || field.resource.controls === false) {
          button.element.disabled = true;
        } else {
          button.element.onmousedown = async (event) => {
            // event.preventDefault(); // prevent current table cell losing focus
            button.element.classList.add("loading");
            // field.select.removeFocus();
            await field.duplicate();

            await field.content.render();
            await field.renderFooter();
            button.element.classList.remove("loading");
          }

          button.element.disabled = !KarmaFieldsAlpha.History.hasParam("id") && !(field.select.selection && field.select.selection.width === field.select.grid.width);
        }
      }
    };
  }


  static buildReloadButton(field, name, title) {
    return {
      ...this.buildBasicButton(name || "Reload", title || "Reload"),
      update: button => {
        button.element.onclick = async (event) => {
          KarmaFieldsAlpha.Form.cache = {}; // deprecated
          KarmaFieldsAlpha.cache = {};
          field.content.original = {};
          field.paramString = undefined;

          // debugger;

          button.element.classList.add("loading");
          await field.render();
          button.element.classList.remove("loading");
        }
      }
    };
  }


  static buildOrderLink(field, column) {
    return {
      tag: "a",
      class: "header-cell-order",
      child: {
        class: "karma-field-spinner"
      },
      update: a => {
        const orderby = KarmaFieldsAlpha.History.getParam("orderby");
        const order = KarmaFieldsAlpha.History.getParam("order");
        const key = column.orderby || column.field.key;



        a.element.onclick = async event => {
          event.preventDefault();

          a.element.classList.add("loading");
          await field.reorder(column);

          // await field.render();
          a.element.classList.remove("loading");
        };
        a.element.classList.toggle("asc", orderby === key && order === "asc");
        a.element.classList.toggle("desc", orderby === key && order === "desc");
      }
    };
  }


}
