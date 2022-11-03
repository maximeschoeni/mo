

KarmaFieldsAlpha.field.layout.medias = class extends KarmaFieldsAlpha.field.layout.collection {

  async createFolder(index) {
    let createdId = await KarmaFieldsAlpha.Gateway.post("add/"+this.resource.driver);

    const id = KarmaFieldsAlpha.Type.toString(createdId);

    this.buffer.change(["0"], null, id, "trash");

    const params = {
      filetype: "folder",
      parent: KarmaFieldsAlpha.Nav.get("parent") || "0"
    };

    for (let key in params) {

      this.buffer.change([params[key]], null, id, key);

    }

    const ids = [...this.getIds()];

    ids.splice(index, 0, id);

    this.idsBuffer.change(ids);

    return id;
  }

  async openFolder(id) {

    const current = KarmaFieldsAlpha.Nav.get("parent");

    if (id !== current) {

      KarmaFieldsAlpha.History.save();

      this.unselect();

      KarmaFieldsAlpha.Nav.change(id, current, "parent");

      await this.queryIds();
      await this.parent.request("render");

    }

  }

  async upperFolder() {

    const id = KarmaFieldsAlpha.Nav.get("parent");

    if (id && id !== "0") {

      const parent = await this.getValue(id, "parent").then(response => KarmaFieldsAlpha.Type.toString(response));

      KarmaFieldsAlpha.History.save();

      this.unselect();

      KarmaFieldsAlpha.Nav.change(parent, id, "parent");

      const page = KarmaFieldsAlpha.Nav.get("page") || "1";

      if (page !== "1") {
        KarmaFieldsAlpha.Nav.change(1, page, "page");
      }

      await this.queryIds();
      await this.parent.request("render");

    }

  }

  async uploadFile(file) {

    let id = await KarmaFieldsAlpha.Gateway.upload(file);

    id = id.toString();

    await this.query("id="+id);

    this.initialBuffer.set(["0"], id, "trash");
    this.buffer.change(["0"], ["1"], id, "trash");

    const parent = KarmaFieldsAlpha.Nav.get("parent");

    if (parent) {

      await this.setValue(parent, id, "parent");

    }

    // const ids = [...this.getIds()];
    //
    // ids.splice(index, 0, id);
    //
    // this.idsBuffer.change(ids);
    //
    // this.selectionBuffer.change({index: index, length: 1});
    //
    // this.uploading = false;

    return id;
  }

  async uploadFiles(files) {

    const newIds = [];

    for (let file of files) {

      const id = await this.uploadFile(file);

      newIds.push(id);

    }

    return newIds;
  }

  // async uploadX(files, index = 0) {
  //
  //   const ids = [...this.getIds()];
  //
  //   index = Math.min(index, ids.length);
  //
  //   const newIds = await this.uploadFiles(files);
  //
  //   ids.splice(index, 0, ...newIds);
  //
  //   this.idsBuffer.change(ids);
  //
  //   this.selectionBuffer.change({index: index, length: files.length});
  //
  // }

  async upload(files, index = 0) {

//     const ids = this.getIds();
//
//     const newIds = [...ids];
//
//     index = Math.min(index, ids.length);
//
//     newIds.splice(index, 0, ...Array(data.length).fill("0"));
//
//     for (let file of files) {
//
//       newIds[index + i] = await this.uploadFile(file);
//
//     }
//
//     ids.splice(index, 0, ...newIds);
//
//     this.idsBuffer.change(ids);
//
//     this.selectionBuffer.change({index: index, length: files.length});
//

    const ids = this.getIds();

    const newIds = [...ids];

    index = Math.min(index, ids.length);

    newIds.splice(index, 0, ...Array(files.length).fill("0"));

    // const newIds = [];

    for (let i = 0; i < files.length; i++) {

      newIds[index+i] = "0";

      this.idsBuffer.set(newIds);
      await this.parent.request("render");

      newIds[index+i] = await this.uploadFile(files[i]);

      // ids[index+i] = id;





    }

    // ids.splice(index, 0, ...newIds);

    this.idsBuffer.change(newIds, ids);

  }



  // async upload(files, params = {}) {
  //
  //   // KarmaFieldsAlpha.History.save();
  //
  //   let index = Math.min(this.resource.add_index || 0, this.getIds().length);
  //
  //   // this.unselect();
  //
  //   const newIds = [];
  //
  //   for (let file of files) {
  //
  //     let id = await KarmaFieldsAlpha.Gateway.upload(file, params);
  //
  //     id = id.toString();
  //
  //     newIds.push(id);
  //
  //     await this.query("id="+id);
  //
  //     this.initialBuffer.set(["0"], id, "trash");
  //     this.buffer.change(["0"], ["1"], id, "trash");
  //
  //     const parent = KarmaFieldsAlpha.Nav.get("parent");
  //
  //     if (parent) {
  //
  //       await this.setValue(parent, id, "parent");
  //
  //     }
  //
  //
  //
  //     // const ids = [id, ...this.getIds()];
  //
  //     const ids = [...this.getIds()];
  //
  //     ids.splice(index, 0, id);
  //
  //     this.idsBuffer.change(ids);
  //
  //     index++;
  //
  //
  //
  //     // for (let key in params) {
  //     //
  //     //   const value = params[key];
  //     //
  //     //   this.buffer.change([value], undefined, id, key);
  //     //
  //     // }
  //
  //     // await this.parent.request("render");
  //
  //   }
  //
  //   this.selectionBuffer.change({index: index - files.length, length: files.length});
  //
  //   return newIds;
  // }

  async changeFile(file, id, params = {}) {

    const item = this.initialBuffer.get(id);
    const original = KarmaFieldsAlpha.DeepObject.clone(item);

    KarmaFieldsAlpha.History.save();

    await KarmaFieldsAlpha.Gateway.upload(file, {...params, id: id});

    await this.get(id);

    const newItem = this.initialBuffer.get(id);
    const newClone = KarmaFieldsAlpha.DeepObject.clone(newItem);

    this.buffer.change(newClone, original, id);

  }

  async regen(id) {

    await KarmaFieldsAlpha.Gateway.post("regen/"+id);

  }

  async export(keys = [], index = 0, length = this.getIds().length) {

    // const ids = this.getIds();
    //
    // segment ||= this.selectionBuffer.get() || {index: 0, length: ids.length};

    const ids = this.getIds().slice(index, index + length);

    const rows = [];

    for (let id of ids) {

      const name = await this.getValue(id, "name").then(response => KarmaFieldsAlpha.Type.toString(response));
      const filetype = await this.getValue(id, "filetype").then(response => KarmaFieldsAlpha.Type.toString(response));

      if (filetype === "file") {

        const filename = await this.getValue(id, "filename").then(response => KarmaFieldsAlpha.Type.toString(response));

        rows.push({
          url: `${KarmaFieldsAlpha.uploadURL}/${filename}`,
          id: id,
          name: name
        });

      } else {

        rows.push({
          id: id,
          name: name
        });

      }

    }

  	return rows;
  }

  async importObject(object) {

    if (typeof object === "string") {

      object = {id: object};

    }

    const filetype = await this.getValue(object.id, "filetype").then(response => KarmaFieldsAlpha.Type.toString(response));
    const filename = await this.getValue(object.id, "filename").then(response => KarmaFieldsAlpha.Type.toString(response));

    if (object.url && object.url.split('/').pop() !== filename) {

      return this.uploadFromUrl(object.url);

    } else {

      const parent = KarmaFieldsAlpha.Nav.get("parent") || "0";

      await this.setValue(parent, object.id, "parent");

      return object.id;

    }

  }

  async import(data, index = 0) { // expect json array

    const ids = this.getIds();

    const newIds = [...ids];

    index = Math.min(index, ids.length);

    newIds.splice(index, 0, ...Array(data.length).fill("0"));

    // const newIds = [];

    for (let i = 0; i < data.length; i++) {

      newIds[index+i] = "0";
      this.idsBuffer.set(newIds);
      await this.parent.request("render");

      newIds[index+i] = await this.importObject(data[i]);

      // ids[index+i] = id;

      // this.idsBuffer.set(newIds);
      //
      // await this.render();

    }

    // ids.splice(index, 0, ...newIds);

    this.idsBuffer.change(newIds, ids);

  }

  async uploadFromUrl(url) {

    // url = "https://upload.wikimedia.org/wikipedia/commons/6/65/Schwalbenschwanz-Duell_Winterthur_Schweiz.jpg";
    const response = await fetch(url);
    const blob = await response.blob();
    const filename = url.split('/').pop();

    // const file = new File([blob], filename, {type: "image/jpg"});
    const file = new File([blob], filename);
    // const [fileId] = await this.upload([file]);
    const fileId = await this.uploadFile(file);

    return fileId;

  }

  async request(subject, content, ...path) {

    switch(subject) {

      case "open-folder": {
        const [id] = path;
        await this.openFolder(id);
        break;
      }

      case "upper-folder": {
        await this.upperFolder();
        break;
      }

      case "change-file": {
        const [id] = path;
        await this.changeFile(content.files[0], id, content.params);
        await this.parent.request("render");
      }

      default:
        return super.request(subject, content, ...path);

    }

  }

  build() {

    return {
      class: "karma-field-table-grid-container karma-field-frame karma-field-group final",
      init: body => {

        body.element.tabIndex = -1;
        body.element.ondrop = async event => {
          event.preventDefault();
          const files = event.dataTransfer.files;
          if (event.dataTransfer.files.length) {

            body.element.classList.add("loading");

            KarmaFieldsAlpha.History.save();

            await this.upload(event.dataTransfer.files);

            // await this.parent.request("upload", {
            //   files: event.dataTransfer.files
            //   params: {
            //     parent: KarmaFieldsAlpha.Nav.get("parent") || "0"
            //   }
            // });

            // const parent = KarmaFieldsAlpha.Nav.get("parent");
            //
            // if (parent) {
            //   // this.buffer.change([parent], undefined, id, "parent");
            //   // this.request("set", {data: parent}, id, "parent");
            //   await this.setValue(parent, id, "parent");
            // }

            // const index = this.resource.add_index || 0;
            //
            // table.selectionBuffer.change({index: index, length: 1});

            await this.parent.request("render");

            body.element.classList.remove("loading");
          }
        }
        body.element.ondragover = function(event) {
          event.preventDefault();
        }
      },
      update: body => {
        this.clipboard = this.createChild("clipboard");
        body.element.onfocus = async event => {
          const selection = this.selectionBuffer.get();
          if (selection) {
            KarmaFieldsAlpha.History.save();
            this.selectionBuffer.change(null);
            await this.parent.request("render");
          }
          this.clipboard.output("");
          this.clipboard.focus();
        }
        body.children = [
          this.clipboard.build(),
          {
            class: "media-table",
            tag: "ul",
            init: async grid => {
              if (this.resource.style) {
                grid.element.style = this.resource.style;
              }

            },
            update: async grid => {

              const ids = this.getIds();
              const page = this.getPage();
              const ppp = this.getPpp();
              const offset = (page - 1)*ppp;
              const parent = KarmaFieldsAlpha.Nav.get("parent");
              const items = ids.map(id => {
                if (id === "0") {
                  return {type: "upload"};
                }
                return {type: "media", id: id};
              });

              if (parent && parent !== "0") {
                items.unshift({type: "exit"});
              }




              this.clipboard.onInput = async value => {
                const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
                const data = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
                // this.importSelection(data);

                const selection = this.selectionBuffer.get() || {};

                if (data.length) {
                  KarmaFieldsAlpha.History.save();
                  await this.import(data, selection && selection.index || this.resource.addIndex || 0);
                  this.selectionBuffer.change(selection);
                  await this.parent.request("render");
                } else if (selection.length) {
                  KarmaFieldsAlpha.History.save();
                  await this.remove(selection.index, selection.length);
                  this.selectionBuffer.change(null);
                  await this.parent.request("render");
                }

                // if (selection.length || data.length) {
                //   KarmaFieldsAlpha.History.save();
                //
                //   await this.import(data, selection.index, selection.length);
                //   this.selectionBuffer.change(null);
                //   await this.parent.request("render");
                // }
              }

              const currentSelection = this.selectionBuffer.get();

              grid.element.classList.toggle("has-selection", Boolean(currentSelection));

              grid.element.colCount = 1;
              grid.element.rowCount = ids.length;
              grid.element.colHeader = parent && parent !== "0" ? 1 : 0;



              // if (ids.length) {
              //   grid.element.classList.add("filled"); // -> draw table borders
                grid.children = [0].filter(item => parent && parent !== "0").map(item => {
                  return {
                    tag: "li",
                    update: li => {
                      li.element.classList.add("exit");
                      li.element.classList.remove("uploading");
                      li.element.classList.remove("selected");
                      li.element.classList.add("media-dropzone");

                      li.element.dropZone = true;
                      li.element.style.transform = "none";

                      li.element.ondblclick = event => {
                        this.upperFolder();
                      }

                      li.child = {
                        class: "frame",
                        init: frame => {
                          frame.element.tabIndex = -1;
                        },
                        update: async frame => {
                          frame.children = [
                            {
                              tag: "figure",
                              update: async figure => {
                                figure.element.classList.add("dashicons");
                                figure.element.classList.remove("dashicons-category");
                                figure.element.classList.remove("dashicons-format-image");
                                figure.element.classList.remove("dashicons-media-video");
                                figure.element.classList.remove("dashicons-media-audio");
                                figure.element.classList.remove("dashicons-media-text");
                                figure.element.classList.remove("dashicons-media-document");
                                figure.element.classList.remove("dashicons-media-archive");
                                figure.element.classList.remove("dashicons-media-default");
                                figure.element.classList.remove("dashicons-upload");
                                figure.element.classList.add("dashicons-open-folder");
                                figure.children = [];
                              }
                            },
                            {
                              class: "file-caption",
                              child: {
                                class: "filename",
                                update: async filename => {
                                  filename.element.innerHTML = "..";
                                }
                              }
                            }
                          ];
                        }
                      }
                    }
                  }
                }).concat(ids.map((id, index) => {

                  return {
                    tag: "li",

                    update: async li => {
                      let thumb;
                      let icon;

                      if (id === "0") {

                        icon = "upload";

                      } else {

                        const filetype = await this.request("get", {}, id, "filetype").then(response => KarmaFieldsAlpha.Type.toString(response));

                        if (filetype === "folder") {

                          icon = "folder";

                        } else {

                          const type = await this.request("get", {}, id, "type").then(response => KarmaFieldsAlpha.Type.toString(response));

                          if (type === "image/jpeg" || type === "image/png") {

                            const response = await this.request("get", {}, id, "thumb");

                            if (response) {

                              icon = "thumb";
                              thumb = KarmaFieldsAlpha.Type.toObject(response);

                            } else {

                              icon = "image";

                            }

                          } else if (type === "application/pdf") {

                            icon = "document";

                          } else if (type === "application/zip") {

                            icon = "archive";

                          } else if (type.startsWith("image")) {

                            icon = "image";

                          } else if (type.startsWith("video")) {

                            icon = "video";

                          } else if (type.startsWith("audio")) {

                            icon = "audio";

                          } else if (type.startsWith("text")) {

                            icon = "text";

                          } else {

                            icon = "default";

                          }

                        }

                      }

                      li.element.classList.remove("exit");
                      li.element.classList.toggle("uploading", id === "0");
                      li.element.classList.toggle("media-dropzone", icon === "folder");
                      li.element.dropZone = icon === "folder";
                      li.element.style.transform = "none";

                      const isSelected = currentSelection && KarmaFieldsAlpha.Segment.contains(currentSelection, index);

                      li.element.classList.toggle("selected", Boolean(isSelected));

                      li.element.onmousedown = async event => {

                        if (icon !== "uploading") {

                          const selectionManager = new KarmaFieldsAlpha.DropManager(grid.element);

                          const currentSelection = selectionManager.selection = this.selectionBuffer.get();

                          selectionManager.onSelect = async (selection) => {

                            if (!KarmaFieldsAlpha.Segment.compare(selection, currentSelection)) {
                              KarmaFieldsAlpha.History.save();
                              this.selectionBuffer.change(selection, currentSelection);
                            }

                            const jsonData = await this.export([], selection.index, selection.length);
                            const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                            const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                            this.clipboard.output(value);
                            this.clipboard.focus();

                            await this.parent.request("render");
                          };

                          selectionManager.onDrop = async (col, row) => {
                            if (row === -1) {
                              KarmaFieldsAlpha.History.save();
                              const sourceIds = this.getSelectedIds(selectionManager.selection);
                              const grandParent = await this.request("get", {}, parent, "parent").then(response => KarmaFieldsAlpha.Type.toString(response));
                              for (let sourceId of sourceIds) {
                                // await this.setValue(parent, sourceId, "parent");
                                await this.request("set", {data: grandParent || "0", autosave: true}, sourceId, "parent");
                              }
                              this.cache.empty();
                              this.idsBuffer.empty();
                              await this.parent.request("render");
                            } else {
                              const id = ids[row];
                              const filetype = await this.request("get", {}, id, "filetype").then(response => KarmaFieldsAlpha.Type.toString(response));
                              if (filetype === "folder") {
                                KarmaFieldsAlpha.History.save();
                                const sourceIds = this.getSelectedIds(selectionManager.selection);
                                for (let sourceId of sourceIds) {
                                  // await this.setValue(id, sourceId, "parent");
                                  await this.request("set", {data: id, autosave: true}, sourceId, "parent");
                                }
                                this.cache.empty();
                                this.idsBuffer.empty();
                                await this.parent.request("render");
                              }
                            }
                          }

                          selectionManager.select(event, 0, index);

                        }

                      }

                      li.element.ondblclick = event => {
                        if (icon === "folder" && id) {
                          this.openFolder(id);
                        }
                      }

                      li.child = {
                        class: "frame",
                        init: frame => {
                          frame.element.tabIndex = -1;
                        },
                        update: async frame => {

                          frame.element.classList.add("loading");

                          frame.children = [
                            {
                              tag: "figure",
                              update: async figure => {

                                figure.element.classList.toggle("dashicons", icon !== "thumb");
                                figure.element.classList.toggle("dashicons-category", icon === "folder");
                                figure.element.classList.toggle("dashicons-format-image", icon === "image");
                                figure.element.classList.toggle("dashicons-media-video", icon === "video");
                                figure.element.classList.toggle("dashicons-media-audio", icon === "audio");
                                figure.element.classList.toggle("dashicons-media-text", icon === "text");
                                figure.element.classList.toggle("dashicons-media-document", icon === "document");
                                figure.element.classList.toggle("dashicons-media-archive", icon === "archive");
                                figure.element.classList.toggle("dashicons-media-default", icon === "default");
                                figure.element.classList.remove("dashicons-open-folder");
                                figure.element.classList.toggle("dashicons-upload", icon === "upload");


                                if (icon === "thumb" && thumb) {
                                  figure.children = [{
                                    tag: "img",
                                    update: async img => {
                                      const src = KarmaFieldsAlpha.uploadURL+"/"+thumb.filename;
                                      if (!img.element.src.endsWith(src)) { // -> setting same src will reload image!
                                        img.element.src = KarmaFieldsAlpha.uploadURL+"/"+thumb.filename;
                                      }
                                    }
                                  }];
                                } else {
                                  figure.children = [];
                                }
                              }
                            },
                            {
                              class: "file-caption",
                              child: {
                                class: "filename",
                                update: async filename => {
                                  if (id === "0") {
                                    filename.element.innerHTML = "uploading...";
                                  } else {
                                    const name = await this.request("get", {}, id, "name").then(response => KarmaFieldsAlpha.Type.toString(response));
                                    filename.element.innerHTML = name || "no name";
                                  }
                                }
                              }
                            }
                          ];
                        },
                        complete: frame => {
                          frame.element.classList.remove("loading");
                        }
                      }
                    }

                  };
                }));
              // } else {
              //   grid.children = [];
              //   grid.element.classList.remove("filled");
              // }
            },
            complete: async grid => {

              // -> caution not lose focus i.e. search field!

              if (document.activeElement === document.body) {
                const jsonData = await this.exportSelection();
                const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                this.clipboard.output(value);
                this.clipboard.focus();
              }

            }
          }
        ];
      }
    };

  }

}
