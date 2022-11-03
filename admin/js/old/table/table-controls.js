

KarmaFieldsAlpha.fields.table.button = class {

  build() {
    return {
      tag: "button",
      class: "karma-button footer-item",
      init: (button) => {
        button.element.title = this.resource.title || "?";
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = this.resource.name || "?";
          }
        }
      ]
    }
  }
}

KarmaFieldsAlpha.fields.table.save = class {


  play() {
    setTimeout(async () => {
      if (this.onSave) {
        await this.onSave();
      }
      this.play();
    }, this.table.resource.saveinterval || 10000);
  }



  build() {
    return {
      tag: "button",
      class: "karma-button footer-item primary",
      init: (button) => {
        this.render = button.render;
        button.element.title = this.resource.title || "Save";
        button.element.innerHTML = '<span class="button-content">'+(this.resource.name || "Save")+'</span>';
        if (this.table.resource.autosave && !this.playing) {
          this.playing = true;
          this.onSave = async () => {
            const modified = await this.table.content.isModified();
            if (modified) {
              button.element.classList.add("loading");
              await this.table.content.save();
              await this.table.content.edit();
              button.element.classList.remove("loading");
            }
          }
          this.play();
        }
        document.addEventListener("keydown", async event => {
          if (event.key === "s" && event.metaKey) {
            event.preventDefault();
            event.stopPropagation();
            button.element.classList.add("loading");
            await this.table.content.save();
            await this.table.content.edit();
            button.element.classList.remove("loading");
          }
        });
      },
      // children: [
      //   {
      //     tag: "span",
      //     class: "button-content",
      //     init: content => {
      //       content.element.innerHTML = this.resource.name || "Save";
      //     }
      //   }
      // ],
      update: async button => {
        const isModified = await this.table.content.isModified();
        button.element.onclick = async (event) => {
          if (isModified) {
            button.element.classList.add("loading");
            await this.table.sync();
            // KarmaFieldsAlpha.Gateway.clearCache();
            await this.table.render();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
        button.element.disabled = !isModified;
      }
    };
  }
}

KarmaFieldsAlpha.fields.table.reload = class {
  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: button => {
        button.element.innerHTML = '<span class="dashicons dashicons-image-rotate" style="transform:scaleX(-1);"></span>';
        button.element.onclick = async event => {
          button.element.classList.add("loading");

          // KarmaFieldsAlpha.Gateway.original = {};
          // KarmaFieldsAlpha.Gateway.clearCache();
          this.table.content.reset();

          await this.table.render();
          button.element.classList.remove("loading");
        }
      }

    };
  }
}

KarmaFieldsAlpha.fields.table.undo = class {
  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: button => {
        button.element.innerHTML = '<span class="button-content dashicons dashicons-undo"></span>';
      },
      update: button => {
        // const location = KarmaFieldsAlpha.Nav.getParamString();
        // let index = (KarmaFieldsAlpha.Delta.get("history", location, "index") || 0);

        button.element.onclick = async event => {

          button.element.classList.add("loading");

          KarmaFieldsAlpha.History.undo();

          await this.table.content.render(true);
          await this.table.renderModal();
          await this.table.renderFooter();

          button.element.classList.remove("loading");

          // if (index > 0) {
          //
          //   // decrement index and save
          //   index--;
          //   KarmaFieldsAlpha.Delta.set(index, "history", location, "index");
          //
          //   // rewind previous state
          //   const state = KarmaFieldsAlpha.Delta.get("history", location, index) || {};
          //   KarmaFieldsAlpha.Delta.merge(state);
          //
          //   // clear history id
          //   KarmaFieldsAlpha.Delta.remove("history", location, "id");
          //
          //   await this.table.content.render();
          //   await this.table.renderFooter();
          // }


          // if (KarmaFieldsAlpha.History.current > 0) {
          //   KarmaFieldsAlpha.History.current--;
          //
          //   const state = KarmaFieldsAlpha.Delta.get("history", KarmaFieldsAlpha.History.current) || {};
          //
          //   if (state.location) {
          //     location.href = state.location;
          //   } else {
          //     KarmaFieldsAlpha.Delta.merge(state);
          //   }
          //
          //   // save history id
        	// 	KarmaFieldsAlpha.Delta.id = null;
          // }
        }

        button.element.disabled = !KarmaFieldsAlpha.History.hasUndo();
      }
    };
  }

  // build() {
  //   return {
  //     tag: "button",
  //     class: "karma-button",
  //     init: button => {
  //       button.element.innerHTML = '<span class="button-content dashicons dashicons-undo"></span>';
  //       button.element.onclick = event => {
  //         history.back();
  //       }
  //     },
  //     update: button => {
  //       const currentIndex = history.state && history.state.karmaIndex || 0;
  //       const maxIndex = KarmaFieldsAlpha.History.index || 0;
  //       button.element.disabled = !(currentIndex > 0);
  //     }
  //   };
  // }
}

KarmaFieldsAlpha.fields.table.redo = class {
  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: button => {
        button.element.innerHTML = '<span class="button-content dashicons dashicons-redo"></span>';
      },
      update: button => {
        // const location = KarmaFieldsAlpha.Nav.getParamString();
        // let index = (KarmaFieldsAlpha.Delta.get("history", location, "index") || 0);
        // const max = (KarmaFieldsAlpha.Delta.get("history", location, "max") || 0);

        button.element.onclick = async event => {

          button.element.classList.add("loading");

          KarmaFieldsAlpha.History.redo();

          await this.table.content.render(true);
          await this.table.renderModal();
          await this.table.renderFooter();

          button.element.classList.remove("loading");

          // if (index < max) {
          //
          //
          //
          //   // increment index and save
          //   index++;
          //   KarmaFieldsAlpha.Delta.set(index, "history", location, "index");
          //
          //   // set next state
          //   const state = KarmaFieldsAlpha.Delta.get("history", location, index) || {};
          //   KarmaFieldsAlpha.Delta.merge(state);
          //
          //   // clear history id
          //   KarmaFieldsAlpha.Delta.remove("history", location, "id");
          //
          //   await this.table.content.render();
          //   await this.table.renderFooter();
          // }

          // if (KarmaFieldsAlpha.History.current < KarmaFieldsAlpha.History.max) {
          //   KarmaFieldsAlpha.History.current++
          //
          //   const state = KarmaFieldsAlpha.Delta.get("history", KarmaFieldsAlpha.History.current) || {};
          //
          //   if (state.location) {
          //     location.href = state.location;
          //   } else {
          //     KarmaFieldsAlpha.Delta.merge(state);
          //   }
          //
          //   // save history id
        	// 	KarmaFieldsAlpha.Delta.id = null;
          // }
        }

        button.element.disabled = !KarmaFieldsAlpha.History.hasRedo();
      }
    };
  }
  // build() {
  //   return {
  //     tag: "button",
  //     class: "karma-button",
  //     init: button => {
  //       button.element.innerHTML = '<span class="button-content dashicons dashicons-redo"></span>';
  //       button.element.onclick = event => {
  //         history.forward();
  //       }
  //     },
  //     update: button => {
  //       const currentIndex = history.state && history.state.karmaIndex || 0;
  //       const maxIndex = KarmaFieldsAlpha.History.index || 0;
  //       button.element.disabled = !(currentIndex < maxIndex);
  //     }
  //   };
  //   // return {
  //   //   ...this.buildBasicButton(name || "Redo", title || "Redo"),
  //   //   update: button => {
  //   //     button.element.onclick = async (event) => {
  //   //       // field.content.redo();
  //   //       // field.setHistoryIndex(field.content.historyIndex-0);
  //   //
  //   //       button.element.classList.add("loading");
  //   //       await field.render();
  //   //       button.element.classList.remove("loading");
  //   //     }
  //   //
  //   //     button.element.disabled = !field.content.hasRedo(); //field.domain.index >= field.domain.max;
  //   //     button.element.title = field.content.countRedo();
  //   //   }
  //   // };
  // }
}

KarmaFieldsAlpha.fields.table.add = class  {
  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: (button) => {
        button.element.title = this.resource.title || "Add";
        button.element.innerHTML = '<span class="button-content">'+(this.resource.name || "Add")+'</span>';
      },
      update: button => {
        button.element.onclick = async (event) => {
          button.element.classList.add("loading");
          const ids = await this.table.content.add();


          if (KarmaFieldsAlpha.Nav.hasParam("id")) {

            if (ids.length === 1) {
              KarmaFieldsAlpha.Nav.setParam("id", ids[0]);
            } else {
              KarmaFieldsAlpha.Nav.removeParam("id");
            }

            await this.table.editParam();

          } else {

            await this.table.content.render(true);
            await this.table.content.edit();
            // await this.table.renderFooter();

          }

          button.element.classList.remove("loading");
        };
      }
    };
  }
}

KarmaFieldsAlpha.fields.table.delete = class {
  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: (button) => {
        button.element.title = this.resource.title || "Delete";
        button.element.innerHTML = '<span class="button-content">'+(this.resource.name || "Delete")+'</span>';
      },
      update: button => {
        button.element.onmousedown = async (event) => {
          button.element.classList.add("loading");
          await this.table.content.remove();

          // if modal open
          if (KarmaFieldsAlpha.Nav.getParam("id")) {

            KarmaFieldsAlpha.Nav.removeParam("id");
            await this.table.editParam();

          } else {

            await this.table.content.render(true);
            await this.table.renderFooter();

          }

          button.element.classList.remove("loading");
        }

        button.element.disabled = !KarmaFieldsAlpha.Nav.hasParam("id") && !(this.table.content.selection && this.table.content.selection.width === this.table.content.grid.width);
      }
    };
  }
}

KarmaFieldsAlpha.fields.table.duplicate = class {
  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: (button) => {
        button.element.title = this.resource.title || "Duplicate";
        button.element.innerHTML = '<span class="button-content">'+(this.resource.name || "Duplicate")+'</span>';
      },
      update: button => {
        button.element.onmousedown = async (event) => {
          button.element.classList.add("loading");
          const ids = await this.table.content.duplicate();

          if (KarmaFieldsAlpha.Nav.hasParam("id")) {

            if (ids.length === 1) {
              KarmaFieldsAlpha.Nav.setParam("id", ids[0]);
            } else {
              KarmaFieldsAlpha.Nav.removeParam("id");
            }

            await this.table.editParam();

          } else {

            await this.table.content.render(true);
            await this.table.renderFooter();

          }

          button.element.classList.remove("loading");
        }

        button.element.disabled = !KarmaFieldsAlpha.Nav.hasParam("id") && !(this.table.content.selection && this.table.content.selection.width === this.table.content.grid.width);
      }
    };
  }
}


  // static buildReloadButton(field, name, title) {
  //   return {
  //     ...this.buildBasicButton(name || "Reload", title || "Reload"),
  //     update: button => {
  //       button.element.onclick = async (event) => {
  //         KarmaFieldsAlpha.Form.cache = {}; // deprecated
  //         KarmaFieldsAlpha.cache = {};
  //         field.content.original = {};
  //         field.paramString = undefined;
  //
  //         // debugger;
  //
  //         button.element.classList.add("loading");
  //         await field.render();
  //         button.element.classList.remove("loading");
  //       }
  //     }
  //   };
  // }


  // static buildOrderLink(field, column) {
  //   return {
  //     tag: "a",
  //     class: "header-cell-order",
  //     child: {
  //       class: "karma-field-spinner"
  //     },
  //     update: a => {
  //       const orderby = KarmaFieldsAlpha.History.getParam("orderby");
  //       const order = KarmaFieldsAlpha.History.getParam("order");
  //       const key = column.orderby || column.field.key;
  //
  //
  //
  //       a.element.onclick = async event => {
  //         event.preventDefault();
  //
  //         a.element.classList.add("loading");
  //         await field.reorder(column);
  //
  //         // await field.render();
  //         a.element.classList.remove("loading");
  //       };
  //       a.element.classList.toggle("asc", orderby === key && order === "asc");
  //       a.element.classList.toggle("desc", orderby === key && order === "desc");
  //     }
  //   };
  // }

KarmaFieldsAlpha.fields.table.orderLink = class {

  getOrderby() {
    return KarmaFieldsAlpha.Nav.getParam("orderby") || this.table.getDefaultOrderby();
  }

  getOrder() {
    return KarmaFieldsAlpha.Nav.getParam("order") || this.table.getDefaultOrder();
  }

  reorder(column) {
    const orderby = this.getOrderby();
    const order = this.getOrder();
    const key = column.orderby || column.field.key;

    if (key) {
      if (orderby === key) {
        KarmaFieldsAlpha.Nav.setParam("order", order === "asc" ? "desc" : "asc");
      } else {
        KarmaFieldsAlpha.Nav.setParam("order", column.order || "asc");
        KarmaFieldsAlpha.Nav.setParam("orderby", key);
      }
      if (this.table.getPage() !== 1) {
        KarmaFieldsAlpha.Nav.setParam("page", 1);
      }
    }
  }

  isAsc(column) {
    return this.getOrderby() === (column.orderby || column.field.key) && this.getOrder() === "asc";
  }

  isDesc(column) {
    return this.getOrderby() === (column.orderby || column.field.key) && this.getOrder() === "desc";
  }

  build(column) {
    return {
      tag: "a",
      class: "header-cell-order",
      child: {
        tag: "span",
        class: "dashicons",
        update: span => {
          const isAsc = this.isAsc(column);
          const isDesc = this.isDesc(column);
          span.element.classList.toggle("dashicons-arrow-up", isAsc);
          span.element.classList.toggle("dashicons-arrow-down", isDesc);
          span.element.classList.toggle("dashicons-leftright", !isAsc && !isDesc);
        }
      },
      update: a => {
        a.element.onclick = async event => {
          event.preventDefault();
          a.element.parentNode.classList.add("loading");
          this.reorder(column);
          await this.table.editParam();
          a.element.parentNode.classList.remove("loading");
        };

        // a.element.classList.toggle("asc", this.isAsc(column));
        // a.element.classList.toggle("desc", this.isDesc(column));
      }
    };
  }

}
