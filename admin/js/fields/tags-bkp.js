KarmaFieldsAlpha.field.tags = class extends KarmaFieldsAlpha.field {

  constructor(resource) {
    super(resource);

    this.clipboard = this.createChild("clipboard");

  }

  async openLibrary() {

    const ids = await this.getArray();
    let selectedIds = [];

    if (this.selection && this.selection.length) {

      selectedIds = ids.slice(this.selection.index, this.selection.index + this.selection.length);

    }

    const {index: index, length: length} = this.selection || {index: this.resource.insertAt || 99999, length: 0};

    await this.parent.request("fetch", {
      params: {
        table: this.resource.table,
        selection: selectedIds.join(","),
        ...this.resource.fetchParams
      },
      callback: async inputIds => {
        await this.insert(inputIds, index, length);
      }
    });


  }

  async exportValue() {
    // -> export as string
		const key = this.getKey();
    const response = await this.parent.request("get", {}, key);
    const ids = KarmaFieldsAlpha.Type.toArray(response);

    const jsonData = ids.map(id => {
      return {
        id: id
      };
    });

    return KarmaFieldsAlpha.Clipboard.unparse(jsonData);
	}

	async importValue(value) {
    // -> import as string
		const key = this.getKey();
    const ids = [];
    const arrayData = KarmaFieldsAlpha.Clipboard.parse(jsonData);
    const jsonData = KarmaFieldsAlpha.Clipboard.toJson(arrayData);

    for (let row of jsonData) {
      if (row.id !== undefined) {
        ids.push(row.id);
      }
    }

    await this.parent.request("set", {data: ids}, key);

    // or

    // await this.importJson(jsonData);
	}

  async importJson(data) {
    const ids = [];
    for (let row of data) {
      if (row.id !== undefined) {
        ids.push(row.id);
      }
    }
    await this.parent.request("set", {data: ids}, key);
  }

  async export(keys = []) {
    const object = {};
		const key = this.getKey();

    if (keys.length === 0 || keys.includes(key)) {

      const response = await this.parent.request("get", {}, key);
      const ids = KarmaFieldsAlpha.Type.toArray(response);

      object[key] = ids.join(",");

		}

    return object;
	}

	async import(object) {

    const key = this.getKey();

    if (object[key] !== undefined) {

      let ids = [];

      if (object[key]) {

        ids = object[key].split(",");

      }

      await this.parent.request("set", {data: ids}, key);

    }

	}

  async getSelectedIds() {

    if (this.selection) {

      const key = this.getKey();
  		const response = await this.parent.request("get", {}, key);
      const ids = KarmaFieldsAlpha.Type.toArray(response);

      return ids.slice(this.selection.index, this.selection.length);

    }

    return [];
  }

  async input(inputIds) {

    const {index: index, length: length} = this.selection || {index: this.resource.insertAt || 99999, length: 0};

    KarmaFieldsAlpha.History.save();

    await this.insert(inputIds, index, length);

    await this.parent.request("render");

  }

  async swap(index, length, target) {

    if (target !== index) {

      this.selection = null;

      const key = this.getKey();
      const response = await this.parent.request("get", {}, key);
      const ids = KarmaFieldsAlpha.Type.toArray(response);
      const newIds = [...ids];
      newIds.splice(target, 0, ...newIds.splice(index, length));

      KarmaFieldsAlpha.History.save();

      await this.parent.request("set", {data: newIds}, key);
      await this.parent.request("render");

    }

  }

  async request(subject, content, ...path) {

    switch(subject) {

      case "add":
        await this.openLibrary([]);
        break;

      case "edit": {
        const ids = await this.getSelectedIds();
        await this.openLibrary(ids);
        break;
      }

      case "delete": {
        if (this.selection) {
          KarmaFieldsAlpha.History.save();
          await this.insert([], this.selection.index, this.selection.length);
          await this.parent.request("render");
        }
        break;
      }

      case "selection": {
        if (this.selection && this.selection.length) {
          return this.selection;
        }
        break;
      }

      case "max": {
        return this.getMax();
      }

      case "edit-selection": {
        await this.renderControls();
        break;
      }

      default: {
        const key = this.getKey();
        return this.parent.request(subject, content, key, ...path);
      }

    }

  }

  async getIds() {
    const key = this.getKey();
    const response = await this.parent.request("get", {}, key);
    return KarmaFieldsAlpha.Type.toArray(response);
  }

  async add(ids) {
    return this.insert(ids, 99999, 0);
  }

  async insert(ids, index, length) {

    const key = this.getKey();
    const response = await this.parent.request("get", {}, key);
    const values = KarmaFieldsAlpha.Type.toArray(response);
    const clones = [...values];

    clones.splice(index, length || 0, ...ids);

    const slice = clones.slice(0, this.getMax());

    await this.parent.request("set", {data: slice}, key);

  }

  getMax() {
    return this.resource.max || this.resource.single && 1 || 999999;
  }

  isSingle() {
    return this.getMax() === 1;
  }

  build() {
    return {
			class: "karma-tags karma-field",
      update: async container => {

        container.element.classList.toggle("single", this.isSingle());

        const array = await this.getIds();
        const ids = array.map(id => id.toString()).slice(0, this.getMax());
        const table = await this.request("table", {id: this.resource.table});

        if (!table) {
          console.error("table not found", this.resource.table);
        }

        if (ids.length) {
          // await table.server.store.query("ids="+ids.join(","));
          await table.query("ids="+ids.join(","));
        }



        container.children = [
          this.clipboard.build(),
          {
            tag: "ul",
            init: async content => {
              content.element.tabIndex = -1;
            },
            update: async content => {

              content.element.classList.toggle("hidden", ids.length === 0);

              content.element.onfocus = event => {

                if (this.selection) {

                  const sortManager = new KarmaFieldsAlpha.SortManager(content.element, 1, ids.length, 0, 0);
                  sortManager.clear(this.selection);
                  this.selection = null;

                }

                this.clipboard.output("");
                this.clipboard.focus();
              }

              this.clipboard.onBlur = event => {

                if (this.selection) {

                  const sortManager = new KarmaFieldsAlpha.SortManager(content.element, 1, ids.length, 0, 0);
                  sortManager.clear(this.selection);
                  this.selection = null;

                }

              }

              this.clipboard.onInput = async value => {

                // const array = [];
                const arrayData = KarmaFieldsAlpha.Clipboard.parse(value);
                const jsonData = KarmaFieldsAlpha.Clipboard.toJson(arrayData);

                // for (let row of jsonData) {
                //   if (row.id !== undefined) {
                //     array.push(row.id);
                //   }
                // }

                const array = jsonData.map(row => row.id).filter(id => id !== undefined);

                if (this.selection || array.length) {

                  const selection = this.selection || {index: 999999, length: 0};

                  KarmaFieldsAlpha.History.save();
                  await this.insert(array, selection.index, selection.length);
                  this.selection = null;
                  await this.parent.request("render");

                }

              }

              content.element.ondblclick = event => {
                this.openLibrary([]);
              }

              content.children = ids.map((id, rowIndex) => {
                return {
                  tag: "li",
                  init: frame => {
                    frame.element.tabIndex = -1;
                  },
                  update: async frame => {

                    frame.element.classList.remove("selected");

                    frame.element.onmousedown = async event => {

                      if (event.buttons === 1) {

                        const sortManager = new KarmaFieldsAlpha.SortManager(content.element, 1, ids.length, 0, 0);

                        sortManager.segment = this.selection;

                        sortManager.onSelect = async (segment, hasChange) => {

                          this.selection = segment;

                          const selectedIds = ids.slice(segment.index, segment.index + segment.length);
                          const jsonData = selectedIds.map(id => ({id: id, key: this.resource.key}));
                          const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                          const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);

                          this.clipboard.output(value);
                          this.clipboard.focus();

                          if (this.onRenderControls) {

                            await this.onRenderControls();

                          }

                        }

                        sortManager.onSort = async (index, length, target) => {

                          await this.swap(index, length, target);

                          sortManager.clear();

                          await this.parent.request("render");

                        }

                        await sortManager.sort(event, 0, rowIndex);

                      }

                    }

                    frame.element.classList.add("loading");

                    const row = table.createChild({
                      type: "row",
                      key: id
                    });

                    const name = await row.request("get", {}, this.resource.nameField || "name") || await row.parse(this.resource.value) || "?";

                    // const name = await table.server.store.getValue(id, "name").then(value => KarmaFieldsAlpha.Type.toString(value));

                    frame.element.classList.remove("loading");

                    frame.children = [
                      {
                        tag: "span",
                        update: async span => {
                          span.element.innerHTML = KarmaFieldsAlpha.Type.toString(name);
                        }
                      },
                      {
                        tag: "a",
                        class: "close",
                        init: close => {
                          close.element.textContent = "×";
                        },
                        update: close => {
                          close.element.onclick = async event => {
                            KarmaFieldsAlpha.History.save();
                            await this.insert([], rowIndex, 1);
                            this.selection = null;
                            await this.parent.request("render");
                          }
                        }
                      }
                    ];
                  }
                };
              });
            }
          },
          {
            class: "controls",
            update: controls => {
              controls.element.classList.toggle("hidden", this.resource.controls === false);
            },
            child: {
              class: "footer-content",
              init: controls => {
                controls.element.onmousedown = event => {
                  event.preventDefault(); // -> prevent losing focus on selected items
                }
              },
              update: controls => {
                this.onRenderControls = controls.render;
                if (this.resource.controls !== false) {
                  controls.child = this.createChild(this.resource.controls || "controls").build();
                }
              }
            }
          }
        ]
      }
		};

  }

  static controls = class extends KarmaFieldsAlpha.field.group {

    constructor(resource) {

      super({
        display: "flex",
        children: [
          "add"
        ],
        ...resource
      });

    }

    static add = {
      type: "button",
      // title: "Add",
      title: "+",
      // dashicon: "plus-alt2",
      action: "add",
      hidden: [">=", ["count", ["get", "array"]], ["request", "max", "number"]]
    }

    static remove = {
      type: "button",
      title: "Remove",
      action: "delete",
      disabled: ["!", ["selection"]],
      hidden: ["empty", ["get", "array"]]
    }

    static edit = {
      type: "button",
      title: "Change",
      action: "edit",
      disabled: ["!", ["selection"]],
      hidden: ["empty", ["get", "array"]]
    }

  }


}
