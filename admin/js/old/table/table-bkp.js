KarmaFieldsAlpha.tables = {};

KarmaFieldsAlpha.fields.table = class extends KarmaFieldsAlpha.fields.form {

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
    this.select.events.paste = function() {
      field.paste(this.selection).then(function() {

        field.render();
      })

    }

    field.select.events.select = function() {
      field.renderFooter();
    };


    // filters

    this.filters = new KarmaFieldsAlpha.fields.group(resource.filters, this, this);

    this.filters.events.change = async (target, value) => {



      this.setParam("page", 1);
      await this.render();

      // this.promise = this.promise && this.promise.then(() => {
      //   this.update();
      // }) || this.update();
      //
      // await this.promise;

      // await this.update();


      // await this.enqueue(this.update());
      // if (this.modified) {
      //
      //   // await this.render();
      //   await this.enqueue(this.render());
      //
      // }

    }

    this.filters.edit = async (target, value) => {
      this.setParam("page", 1);
      await this.render();
    }


    this.filters.events.optionparams = function(origin, optionparamlist) {

      console.error("deprecated event optionparams");

    }


    this.content = new KarmaFieldsAlpha.fields.form({
      driver: resource.driver
      // key: "content"
    }, this);

    // this.data.ids = new KarmaFieldsAlpha.fields.field({
    this.content.ids = new KarmaFieldsAlpha.fields.arrayField({
      key: "ids",
    }, this.content, this.content);
    this.content.types["ids"] = "json";
    this.content.original["ids"] = "[]";

    this.content.initHistory();


    this.content.events.history = function(targetField, state) {
      console.log("Deprecated Event history");
      // console.log("updatehistory", targetField);
      // this.domain.update(targetField.getId(), state);
      // field.domain.index = this.domain.index;
    };



    this.content.events.optionparams = function(origin) {
      console.error("deprecated event optionparams");

      return params;

    }

    this.content.getRelatedValue = key => {
      return this.filters.getRelatedValue(key);
    }

    // -> for link fields
    // this.content.events.nav = params => {
    //
    //   this.setValue(params);
    //   return this.render();
    //
    //
    // };


    this.content.events.change = async function(targetField, value) {
      await field.editAll(targetField, value);
      // await field.renderModal();
      await field.renderFooter();
    };

    this.content.edit = async () => {
      await field.editAll();
      // await field.renderModal();
      await field.renderFooter();
    };

    // this.addChild(this.content);


    // this.controls = new KarmaFieldsAlpha.fields.tableControl(field);

    let nav;
    if (location.hash) {
      nav = this.decodeParams(location.hash.slice(1));
    } else if (resource.default) {
      nav = resource.default;
    } else {
      nav = {};
    }
    nav.page = Number(this.getParam("page")) || 1;
    nav.ppp = Number(this.getParam("ppp")) || 100;
    if (this.resource.orderby) {
      nav.orderby = this.resource.orderby;
    }
    const column = this.resource.orderby && this.resource.columns.find(column => {
      return column.field && column.field.key === this.resource.orderby;
    });
    if (column && column.field.order) {
      nav.order = column.field.order;
    }
    const hash = this.encodeParams(nav);
    history.replaceState(null, null, "#"+hash);


    this.nav = KarmaFieldsAlpha.fields.form.getForm("nav");
  }


  editFull() {
    return this.render();
  }



  decodeParams(paramString) {
    return paramString.split("&").reduce((object, item) => {
      const parts = item.split("=");
      if (parts.length === 2) {
        let key = decodeURIComponent(parts[0]);
        let value = decodeURIComponent(parts[1]);
        object[key] = value;
      }
      return object;
    }, {});
  }

  encodeParams(object) {
    return KarmaFieldsAlpha.Form.encodeParams(object, "");
  }


  hasModifiedValue() {
		return false;
	}

	getModifiedValue() {
	}

  async fetchValue(keys) {
    const path = keys.join("/");
		let value = this.getDeltaValue(path);
		return this.parse(value, path);
  }

  async fetchArray(keys) {
    return this.fetchValue(keys);
  }

  setDeltaValue(value, path) {
    return this.setParam(path, value);
  }

  getDeltaValue(path) {
    return this.getParam(path);
  }

  async update() {

    let paramString = location.hash.slice(1);

    // if (paramString !== this.getFormOriginal(["paramString"])) {
    //   this.setFormOriginal(paramString, ["paramString"]);
    if (paramString !== this.paramString) {
      this.paramString = paramString;
      await this.query();
      this.modified = true;
    } else {
      this.modified = false;
    }
  }

  async render() {
    //
  }
  async renderFooter() {
    //
  }
  async renderModal() {
    //
  }





  getParam(key) {
    return this.getParams()[key];
  }

  getParams() {
    const hash = location.hash.slice(1);
    return this.decodeParams(hash);
  }

  setParam(key, value) {
    const params = this.getParams();
    params[key] = value;
    this.setParams(params);
  }

  setParams(params) {
    let hash = this.encodeParams({
      ...this.getParams(),
      ...params
    });
    this.writeHistory("nav", hash);
    history.replaceState(null, null, "#"+hash);
  }

  async query() {

    const nav = this.decodeParams(this.paramString);
    if (!nav.page) nav.page = 1;
    if (!nav.ppp) nav.ppp = 100;
    let paramString = this.encodeParams(nav);


    const results = await this.content.getRemoteTable(paramString, this.resource.driver);

    this.count = results.count;
    this.queriedIds = results.ids;

    this.queriedIds.forEach(id => {
      const row = this.content.getChild(id) || this.content.createChild({
        type: "tableRow",
        key: id
      });
      row.create(this.resource.columns || []);
    });

    return results;
  };

  async sync() {

    this.queriedIds = this.getCurrentIds();

    const results = await this.content.save();

    return results;
  };


  async add(num, noBackup) {
    const results = await KarmaFieldsAlpha.Form.add(this.resource.driver, {num: num || 1})

    const ids = results.map(item => (item.id || item).toString());
    const rows = ids.map(id => {
      let row = this.content.createChild({
        type: "tableRow",
        key: id
      });
      row.create(this.resource.columns);
      // row.trash.initValue(1);
      // row.trash.initValue("1");
      this.content.setOriginalValue("1", [id, "trash"]);

      // row.trash.setValue("1");
      return row;
    });

    if (!noBackup) {
      this.content.backup(["add"]);
      // this.backup(["add"]);
    }

    await Promise.all(rows.map(row => {
      return row.fill(this.resource.columns); // -> also set trash to "0"
    }));


    // this.queriedIds = ids.concat(this.queriedIds);
    await this.content.ids.add(ids);


  }

  async remove() {
    if (this.select.selection && this.select.selection.width === this.select.grid.width) {
      let ids = this.getCurrentIds();

      ids = ids.slice(this.select.selection.y, this.select.selection.y+this.select.selection.height);
      if (ids.length) {
        const rows = ids.map(id => this.content.getChild(id));
        await Promise.all(rows.map(row => row.trash.setValue("0")));

        this.content.backup(["remove"]);
        // this.content.ids.remove(ids);

        await Promise.all(rows.map(row => row.removeValue()));
        await Promise.all(rows.map(row => row.trash.setValue("1")));

      }
    }
  }


  selectRow(rowId) {

    const ids = this.getCurrentIds();
    let index = ids.indexOf(rowId);
    if (index > -1) {
      this.select.setFocus({x:0, y:index});
    }

  }

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
        console.log(text);
        await navigator.clipboard.writeText(text);
      }

    }
  }

  async paste(selection) {

    const field = this;
    const x = selection.x;
    const y = selection.y;

    let ids = this.getCurrentIds();
    const text = await navigator.clipboard.readText();

    if (text) {
      let rows = text.split(/[\r\n]+/).map(function(row) {
        return row.split("\t");
      });

      field.content.backup(["paste"]);

      if (rows.length > ids.length-y) {
        await this.add(rows.length-(ids.length-y), false);
        ids = this.getCurrentIds();
      }

      const promises = [];
      for (let j = 0; j < rows.length; j++) {
        const rowField = field.content.getChild(ids[j+y]);
        for (let i = 0; i < rows[j].length; i++) {
          const cellField = rowField.children[i+1+x];
          const value = rows[j][i];
          const promise = cellField.importValue(value);
          promises.push(promise);
        }
      }
      await Promise.all(promises);
      await field.content.bubble("change");
    }
  }

  async editAll() {
    // console.log(conductor, value);
    if (this.select && this.select.selection && this.select.focusRect && this.select.selection.height > 1) {

      let ids = this.getCurrentIds();
      let field = this.content.getChild(ids[this.select.focusRect.y]).children[this.select.focusRect.x+1];
      let value = await field.fetchValue();

      field.backup();

      for (var j = 0; j < this.select.selection.height; j++) {
        if (j+this.select.selection.y !== this.select.focusRect.y) {
          const rowField = this.content.getChild(ids[j+this.select.selection.y]);
          const cellField = rowField.children[this.select.focusRect.x+1];
          await cellField.setValue(value);
        }
      }

      await this.render();
    }
  }

  getIds() {
    console.error("Deprecated getIds()");
    return this.queriedIds;
  }
  getCurrentIds() {
    const ids = this.content.ids.getValue() || [];
    return ids.concat(this.queriedIds);
  }

  getCount() {
    const ids = this.content.ids.getValue() || [];
    return this.count + ids.length;
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




  getModalField() {
    const column = this.resource.columns.find(column => column.field && column.field.type === "modal");

    if (column) {
      // const key = column.field.modalkey || "id";
      const value = this.getParam("id");


      if (value) {
        const rowField = this.content.getChild(value);

        return rowField && rowField.children.find(child => child.resource.type === "modal");
        // modalContainer.children = [
        //   field.buildModal(value, column.field)
        // ];
      }
      // else {
      //   modalContainer.children = [];
      // }
    }
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
          const orderBtn = new KarmaFieldsAlpha.fields.tableControls.order();
          th.children.push(orderBtn.build(column, this));
        }
      }
    };
  }

  buildIndexCell(rowIndex) {
    return {
      class: "th table-row-index karma-field",
      update: th => {
        let page = Number(this.getParam("page")) || 1;
        let ppp = Number(this.getParam("ppp")) || 100;
        th.element.textContent = (page - 1)*ppp + rowIndex + 1;
      }
    };
  }

  buildGrid() {
    return {
      class: "table grid",
      update: async grid => {

        // await 0; // -> delay rendering in order to registerTable after rendering

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

        const rows = this.getCurrentIds().map(id => this.content.getChild(id) || this.content.createChild({
          type: "tableRow",
          key: id
        })).filter(row => row.trash.getValue() !== "1").forEach((rowField, rowIndex) => {
          if (this.hasIndex()) {
            grid.children.push(this.buildIndexCell(rowIndex));
          }

        // ids.forEach((id, rowIndex) => {
        //   if (this.hasIndex()) {
        //     grid.children.push(this.buildIndexCell(rowIndex));
        //   }
        //   // const rowField = this.content.getChild(id);
        //   const rowField = this.content.getChild(id) || this.content.createChild({
        //     type: "tableRow",
        //     key: id
        //   });

          this.getColumns().forEach((column, colIndex) => {
            // const cellField = rowField.getChild(column.field.key) || rowField.createChild(column.field);
            const cellField = rowField.children[colIndex+1];

            // cellField.render = grid.render;
            grid.children.push(cellField.build());
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

  buildFooterBar() {
    return {
      class: "footer-bar",
      children: [
        {
          class: "footer-group table-info",
          update: group => {
            let buttons = this.resource.controls || [
              {
                type: "save",
                name: "Save",
                primary: true
              },
              {
                type: "undo",
                name: "Undo"
              },
              {
                type: "redo",
                name: "Redo"
              },
              {
                type: "add",
                name: "Add"
              },
              {
                type: "delete",
                name: "Delete"
              }
            ];
            group.children = buttons.map(resource => {
              if (KarmaFieldsAlpha.fields.tableControls[resource.type]) {
                const button = new KarmaFieldsAlpha.fields.tableControls[resource.type](resource);
                return button.build(this);
              }
            });
          }
        },
        {
          class: "footer-group table-pagination",
          update: group => {
            const modal = this.getParam("id");
            if (modal) {
              group.children = [];
            } else {
              let buttons = [
                {
                  type: "ppp"
                },
                {
                  type: "firstPage",
                  name: "«"
                },
                {
                  type: "prevPage",
                  name: "‹"
                },
                {
                  type: "currentPage",
                },
                {
                  type: "nextPage",
                  name: "›"
                },
                {
                  type: "lastPage",
                  name: "»"
                }
              ];
              group.children = buttons.map(resource => {
                if (KarmaFieldsAlpha.fields.tableControls[resource.type]) {
                  const button = new KarmaFieldsAlpha.fields.tableControls[resource.type](resource);
                  return button.build(this);
                }
              });
            }
          }
        },
        {
          class: "footer-group modal-navigation",
          update: group => {
            const modal = this.getParam("id");

            if (modal) {
              let buttons = [
                {
                  type: "prevModal",
                  name: "‹"
                },
                {
                  type: "nextModal",
                  name: "›"
                }
              ];
              group.children = buttons.map(resource => {
                if (KarmaFieldsAlpha.fields.tableControls[resource.type]) {
                  const button = new KarmaFieldsAlpha.fields.tableControls[resource.type](resource);
                  return button.build(this);
                }
              });
            } else {
              group.children = [];
            }
          }
        }
        // this.buildModalNav()
      ]
    };
  }



  build() {

    return {
      class: "karma-field-table",
      init: container => {

        // DEPRECATED for modals + filters + order + pagination
        // this.render = () => {
        //   console.error("deprecated field.render!");
        // };




        this.render = container.render;

        // -> first load table
        // this.query().then(results => {
        //   this.try("onSetHeader");
        //   this.try("onSetModal");
        //   this.try("onSetBody");
        //   this.try("onSetFooter");
        // });
      },
      update: async container => {



        await this.update();

        if (this.modified) {
          container.children = [
            {
              class: "table-header",
              update: (header) => {
                // this.onSetHeader = () => {
                  header.children = [
                    {
                      tag: "h1",
                      init: h1 => {
                        h1.element.textContent = this.resource.title || "";
                      }
                    },
                    this.filters.build()
                  ];
                  // header.render();
                // }
              }
            },

            // modal
            {
              class: "modal-container",
              update: modalContainer => {
                // this.onSetModal = () => {
                //   const modal = this.getCurrentModal();
                //   if (modal) {
                //     modalContainer.children = [
                //       modal.buildModal()
                //     ];
                //     document.body.style.overflow = "hidden";
                //   } else {
                //     modalContainer.children = [];
                //     document.body.style.overflow = "visible";
                //   }
                //   modalContainer.render();
                // }
                const field = this.getModalField();
                modalContainer.children = field && [field.buildModal()] || [];
                this.renderModal = modalContainer.render;
              }
            },

            // table body
            {
              class: "table-body",
              update: async body => {
                // this.onSetBody = async () => {
                //   body.child = await this.buildGrid();
                //
                //   await body.render();
                // }

                this.content.render = body.render;

                body.child = this.buildGrid();
              },
              complete: () => {
                this.renderFooter();
              }
            },

            // table footer
            {
              class: "table-footer",
              update: footer => {
                this.renderFooter = footer.render;

                footer.child = this.buildFooterBar();
              }
            }
          ];
        }



      }

    };
  }

}
