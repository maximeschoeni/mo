KarmaFieldsAlpha.field.gallery = class extends KarmaFieldsAlpha.field {

  constructor(resource) {
    super(resource);

    this.uploader = this.createUploader(resource);
    // this.clipboard = new KarmaFieldsAlpha.Clipboard();
    this.clipboard = this.createChild("clipboard");

  }

  async fetchMedias() {

		if (this.resource.driver) {


			const form = new KarmaFieldsAlpha.field.Form({
				driver: this.resource.driver,
				joins: this.resource.joins
			});

	    const results = await form.query(this.resource.params || {});

			for (let item of results) {
				options.push({
					id: item.id,
					name: item[this.resource.nameField || "name"] || await form.getInitial(item.id, this.resource.nameField || "name")
				});
			}

		} else if (this.resource.table) {

			const table = await this.parent.request("table", {id: this.resource.table});

			const results = await table.query({...table.resource.params, ...this.resource.params});

			for (let item of results) {
				options.push({
					id: item.id,
					name: item[this.resource.nameField || "name"] || await table.getInitial(item.id, this.resource.nameField || "name")
				});
			}

		}

		return options;

	}

  async openLibrary() {

    const ids = await this.getArray();
    let selectedIds = [];

    if (this.selection && this.selection.length) {

      selectedIds = ids.slice(this.selection.index, this.selection.index + this.selection.length);

    }

    if ((this.resource.uploader || this.resource.library)  === "wp") {

      this.uploader.open(selectedIds);

    } else {

      // const index = this.selection && this.selection.index;
      // const length = this.selection && this.selection.length;

      const {index: index, length: length} = this.selection || {index: this.resource.insertAt || 99999, length: 0};

      let parentId = 0;

      if (this.resource.folder && this.resource.table) {

        const table = await this.request("table", {id: this.resource.table});
        const results = await table.query("name="+this.resource.folder);

        if (results.length) {

          parentId = results[0].id;

        }

      }

      await this.parent.request("fetch", {
        params: {
          table: this.resource.table || "medias",
          selection: selectedIds.join(","),
          parent: parentId
        },
        callback: async inputIds => {
          await this.insert(inputIds, index, length);
        }
      });

      // console.log("fetch response", request);
      //
      // const inputIds = KarmaFieldsAlpha.Type.toArray([...request.data]);
      //
      //
      //
      // const ids = await this.getArray();
      // const insertIds = [...ids];
      //
      // if (this.selection) {
      //
      //   insertIds.splice(this.selection.index, this.selection.length, ...inputIds);
      //
      //   this.selection = null; //inputIds.length && {index: this.selection.index, length: inputIds.length} || null;
      //
      // } else if (inputIds.length) {
      //
      //   insertIds.push(...inputIds);
      //
      // }
      //
      // // KarmaFieldsAlpha.History.save();
      //
      // await this.dispatch({
      //   action: "set",
      //   data: insertIds
      // });
      //
      // await this.dispatch({
      //   action: "render"
      // });



    }

  }

  async exportValue() {
    // -> export as string
		const key = this.getKey();
    const response = await this.parent.request("get", {}, key);
    const ids = KarmaFieldsAlpha.Type.toArray(response);
    // return ids.join(",");

    const jsonData = ids.map(id => {
      return {
        id: id,
        filetype: "file"
      };
    });

    return KarmaFieldsAlpha.Clipboard.unparse(jsonData);
	}

	async importValue(value) {
    // -> import as string
		const key = this.getKey();
    // const ids = value.split(",").map(item => item.trim());
    const ids = [];
    const arrayData = KarmaFieldsAlpha.Clipboard.parse(jsonData);
    const jsonData = KarmaFieldsAlpha.Clipboard.toJson(arrayData);


    for (let row of jsonData) {
      if (row.filetype === "file" && row.id !== undefined) {
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
      if (row.filetype === "file" && row.id !== undefined) {
        ids.push(row.id);
      } else if (row.filetype === "folder") {
        // const store = new KarmaFieldsAlpha.Store(this.resource.driver || "medias", this.resource.joins || ["files"]);
        // const results =  await store.query("parent="+row.id);
        // await this.importJson(results.map(result => {
        //   return {
        //     id: result.id,
        //     filetype: await store.getValue(result.id, "filetype");
        //   }
        // }));
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

      // for (let i in ids) {
      //
      //   const subkey = `${key}-${i}`;
      //   object[subkey] = ids[i];
      //
      // }

		}

    return object;
	}

	async import(object) {

    const key = this.getKey();
    // const ids = [];

    // for (let key in object) {
    //
    //   const matches = key.match(/^(.*?)-(\d+)$/);
    //
    //   if (matches && matches[1] === key) {
    //
    //     const subkey = `${key}-${matches[2]}`;
    //     const id = object[subkey];
    //     ids.push(id);
    //
    //   }
    //
    // }

    // -> delete images if value is empty

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

    // const ids = await this.getArray();
    // const insertIds = [...ids];

    const {index: index, length: length} = this.selection || {index: this.resource.insertAt || 99999, length: 0};


    // if (this.selection || inputIds.length) {
    //
    //   if (this.selection) {
    //
    //     insertIds.splice(this.selection.index, this.selection.length, ...inputIds);
    //
    //     this.selection = null; //inputIds.length && {index: this.selection.index, length: inputIds.length} || null;
    //
    //   } else if (inputIds.length) {
    //
    //     insertIds.push(...inputIds);
    //
    //   }

      KarmaFieldsAlpha.History.save();

      await this.insert(inputIds, index, length);

      // await this.dispatch({
      //   action: "set",
      //   data: insertIds
      // });
      //
      // await this.dispatch({
      //   action: "render"
      // });

      await this.parent.request("render");

    // }

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

  // async dispatch(event) {
  //
  //   switch(event.action) {
  //
  //     case "add":
  //       // this.uploader.open([]);
  //       await this.openLibrary([]);
  //       break;
  //
  //     case "edit": {
  //       // const ids = await this.slice(event.selection.index, event.selection.length);
  //       // this.editSelection = event.selection;
  //
  //       const ids = await this.getSelectedIds();
  //
  //       await this.openLibrary(ids);
  //
  //       break;
  //     }
  //
  //     case "delete": {
  //         // const ids = await this.dragAndDrop.items.map(item => item.id);
  //         // ids.splice(this.dragAndDrop.selection.index, this.dragAndDrop.selection.length);
  //         //
  //         // this.dragAndDrop.clearSelection();
  //
  //       if (this.selection) {
  //
  //         const ids = await this.getArray();
  //         const deleteIds = [...ids];
  //
  //         deleteIds.splice(this.selection.index, this.selection.length);
  //
  //         this.selection = null;
  //
  //         KarmaFieldsAlpha.History.save();
  //
  //         await this.dispatch({
  //           action: "set",
  //           data: deleteIds
  //         });
  //         await this.dispatch({
  //           action: "render"
  //         });
  //
  //       }
  //
  //
  //       break;
  //     }
  //
  //     // case "insert": {
  //     //
  //     //   const ids = await this.getArray();
  //     //   const insertIds = [...event.data];
  //     //
  //     //   insertIds.splice(event.index, event.length, ...ids);
  //     //
  //     //   KarmaFieldsAlpha.History.save();
  //     //
  //     //   await this.dispatch({
  //     //     action: "set",
  //     //     data: insertIds
  //     //   });
  //     //
  //     //   await this.dispatch({
  //     //     action: "render"
  //     //   });
  //     //
  //     //   break;
  //     // }
  //     //
  //     // case "push": {
  //     //
  //     //   const ids = await this.getArray();
  //     //   const newIds = [...ids, ...event.data];
  //     //
  //     //   KarmaFieldsAlpha.History.save();
  //     //
  //     //   await this.dispatch({
  //     //     action: "set",
  //     //     data: newIds
  //     //   });
  //     //
  //     //   await this.dispatch({
  //     //     action: "render"
  //     //   });
  //     //
  //     //   break;
  //     // }
  //     //
  //     // case "swap": {
  //     //
  //     //   const ids = event.data;
  //     //   const index = event.index;
  //     //   const target = this.selection.index;
  //     //   const length = this.selection.length;
  //     //   const newIds = [...ids];
  //     //
  //     //   newIds.splice(target, 0, ...newIds.splice(index, length));
  //     //
  //     //   KarmaFieldsAlpha.History.save();
  //     //
  //     //   await super.dispatch({
  //     //     action: "set",
  //     //     data: newIds
  //     //   });
  //     //   await super.dispatch({
  //     //     action: "render"
  //     //   });
  //     //
  //     //   // const ids = await this.getArray();
  //     //   // const newIds = [...ids];
  //     //   //
  //     //   // const items = newIds.splice(event.index, event.length);
  //     //   // newIds.splice(event.target, 0, ...items);
  //     //   //
  //     //   // KarmaFieldsAlpha.History.save();
  //     //   //
  //     //   // await super.dispatch({
  //     //   //   action: "set",
  //     //   //   data: newIds
  //     //   // });
  //     //   // await super.dispatch({
  //     //   //   action: "render"
  //     //   // });
  //     //
  //     //   break;
  //     // }
  //
  //     case "selection": {
  //
  //       // event.data = this.selectedIds;
  //       // event.data = this.dragAndDrop.getSelectedItems().map(item => item.id);
  //       if (this.selection && this.selection.length) {
  //         event.data = this.selection;
  //       } else {
  //         event.data = null;
  //       }
  //
  //       break;
  //     }
  //
  //     case "max": {
  //       event.data = this.getMax();
  //       break;
  //     }
  //
  //     case "edit-selection": {
  //       await this.renderControls();
  //       break;
  //     }
  //
  //     // case "get": {
  //     //   const value = await this.getValue(...event.path);
  //     //   event.setValue(value);
  //     //   break;
  //     // }
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
        if (this.onRenderControls) {
          await this.onRenderControls();
        }
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

  createUploader(resource) {
    const uploader = {};
    uploader.addFrame = null;
    uploader.open = (imageIds) => {
      uploader.imageIds = imageIds || [];
      if (!uploader.addFrame) {
        uploader.addFrame = wp.media({
          title: "Select file",
          button: {
            text: "Use this file"
          },
          library: {
            type: resource.file && (resource.file.type || resource.file.types)
              || resource.mime_types
              || resource.mimeTypes
              || resource.mimetypes
              || resource.mimeType
              || resource.mimetype
              || resource.mime_type
              || "image" //'application/font-woff'
          },
          multiple: this.getMax() > 1 ? true : false
        });
        uploader.addFrame.on("select", async () => {
          const attachments = uploader.addFrame.state().get("selection").toJSON();
          const attachmentIds = attachments.map(attachment => attachment.id.toString());
          uploader.imageIds = attachmentIds; //.map(id => id.toString());
          // await this.setArray(attachmentIds);

          KarmaFieldsAlpha.History.save();

          if (this.editSelection) {


            await this.insert(attachmentIds, this.editSelection.index, this.editSelection.length);
            this.editSelection = null;
          } else {
            await this.add(attachmentIds);
          }
          // await this.render();
          // await this.dispatch({action: "render"});
          await this.parent.request("render");
        });
        uploader.addFrame.on("open", () => {
          let selection = uploader.addFrame.state().get("selection");
          for (let id of uploader.imageIds) {
            selection.add(wp.media.attachment(id));
          }
        });
      }
      uploader.addFrame.open();
    }
    return uploader;
  }

  getMax() {
    return this.resource.max || this.resource.single && 1 || 999999;
  }

  isSingle() {
    return this.getMax() === 1;
  }

  build() {
    return {
			class: "karma-gallery karma-field",
			init: container => {
        this.render = container.render;
			},
      update: async container => {

        container.element.classList.toggle("single", this.isSingle());

        const array = await this.getIds();

        const ids = array.map(id => id.toString()).slice(0, this.getMax());

        // const store = new KarmaFieldsAlpha.Store(this.resource.driver || "medias", this.resource.joins || ["files"]);
        //
        // if (ids.length) {
        //   await store.query("ids="+ids.join(","));
        // }

        let table;



        if (ids.length) {

          if (this.resource.driver) { // -> compat wp uploader

            table = new KarmaFieldsAlpha.field.layout.table({
              driver: this.resource.driver,
              joins: this.resource.joins || []
            });

          } else if (this.resource.table && typeof this.resource.table === "object") {

            table = new KarmaFieldsAlpha.field.layout.table(this.resource.table);

          } else {

            table = await this.parent.request("table", {id: this.resource.table || "medias"});

          }



          table.query("ids="+ids.join(","));

        }




        container.children = [
          this.clipboard.build(),
          {
            class: "gallery",
            init: async gallery => {
              gallery.element.tabIndex = -1;




              // gallery.element.onfocus = event => {
              //   this.clipboard.set("");
              // }
              // this.clipboard.ta.onfocus = event => {
              //   gallery.element.classList.add("focus");
              // }
              // this.clipboard.ta.onblur = event => {
              //   gallery.element.classList.remove("focus");
              //   if (this.selection) {
              //     this.selection.kill();
              //     this.render();
              //   }
              // }
            },
            update: async gallery => {

              gallery.element.onfocus = event => {

                if (this.selection) {

                  const sortManager = new KarmaFieldsAlpha.SortManager(gallery.element, 1, ids.length, 0, 0);
                  sortManager.clear(this.selection);
                  this.selection = null;

                }

                this.clipboard.output("");
                this.clipboard.focus();
              }

              this.clipboard.onBlur = event => {

                if (this.selection) {

                  const sortManager = new KarmaFieldsAlpha.SortManager(gallery.element, 1, ids.length, 0, 0);
                  sortManager.clear(this.selection);
                  this.selection = null;

                }

                if (this.onRenderControls) {
                  this.onRenderControls();
                }
              }

              this.clipboard.onInput = async value => {

                const array = [];
                const arrayData = KarmaFieldsAlpha.Clipboard.parse(value);
                const jsonData = KarmaFieldsAlpha.Clipboard.toJson(arrayData);

                for (let row of jsonData) {
                  if (row.filetype === "file" && row.id !== undefined) {
                    array.push(row.id);
                  }
                }

                if (this.selection || array.length) {

                  const selection = this.selection || {index: 999999, length: 0};

                  KarmaFieldsAlpha.History.save();
                  await this.insert(array, selection.index, selection.length);
                  this.selection = null;
                  await this.parent.request("render");

                }

              }

              gallery.element.ondblclick = event => {
                this.openLibrary([]);
              }

              gallery.children = ids.map((id, rowIndex) => {
                return {
                  class: "frame",
                  init: async frame => {
                    frame.element.tabIndex = -1;
                  },
                  update: async frame => {

                    frame.element.classList.remove("selected");

                    frame.element.onmousedown = async event => {

                      if (event.buttons === 1) {

                        const sortManager = new KarmaFieldsAlpha.SortManager(gallery.element, 1, ids.length, 0, 0);

                        sortManager.segment = this.selection;

                        sortManager.onSelect = async (segment, hasChange) => {

                          this.selection = segment;

                          const selectedIds = ids.slice(segment.index, segment.index + segment.length);
                          const jsonData = selectedIds.map(id => ({id: id, filetype: "file"}));
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

                    // const thumb = await store.getValue(id, "thumb").then(value => KarmaFieldsAlpha.Type.toObject(value));
                    // const type = await store.getValue(id, "type").then(value => KarmaFieldsAlpha.Type.toString(value));

                    const thumb = await table.getInitial(id, "thumb").then(value => KarmaFieldsAlpha.Type.toObject(value));
                    const type = await table.getInitial(id, "type").then(value => KarmaFieldsAlpha.Type.toString(value));

                    frame.element.classList.remove("loading");

                    frame.children = [
                      {
                        tag: "figure",
                        update: figure => {

                          const [mediaType] = type.split("/");

                          figure.element.classList.toggle("dashicons", !thumb);
                          figure.element.classList.toggle("dashicons-media-video", !thumb && mediaType === "video");
                          figure.element.classList.toggle("dashicons-media-audio", !thumb && mediaType === "audio");
                          figure.element.classList.toggle("dashicons-media-text", !thumb && mediaType === "text");
                          figure.element.classList.toggle("dashicons-media-document", !thumb && type === "application/pdf");
                          figure.element.classList.toggle("dashicons-media-default", !thumb && mediaType !== "video" && mediaType !== "audio" && mediaType !== "text" && type !== "application/pdf");


                          if (thumb) {
                            figure.children = [{
                              tag: "img",
                              update: image => {
                                image.element.src = KarmaFieldsAlpha.uploadURL+"/"+thumb.filename;
                                image.element.width = thumb.width;
                                image.element.height = thumb.height;
                              }
                            }];
                            figure.element.classList.toggle("type-image", type.startsWith("image") || false);
                          } else {
                            figure.children = [];
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
        id: "controls",
        display: "flex",
        children: [
          "add",
          "edit",
          "remove"
        ],
        ...resource
      });

    }

    static test = {
      type: "button",
      title: "Test",
      action: "test"
    }

    static add = {
      type: "button",
      title: "Add",
      text: "+",
      action: "add",
      hidden: [">=", ["count", ["get", "array"]], ["request", "max", "number"]]
    }

    static remove = {
      type: "button",
      title: "Remove",
      text: "×",
      action: "delete",
      disabled: ["!", ["selection"]],
      hidden: ["empty", ["get", "array"]]
    }

    static edit = {
      type: "button",
      title: "Edit",
      // dashicon: "update",
      action: "edit",
      disabled: ["!", ["selection"]],
      hidden: ["empty", ["get", "array"]]
    }

  }


}

KarmaFieldsAlpha.field.files = class extends KarmaFieldsAlpha.field.gallery {}
KarmaFieldsAlpha.field.file = class extends KarmaFieldsAlpha.field.gallery {
  constructor(resource) {
    super({...resource, max: 1});
  }
}
