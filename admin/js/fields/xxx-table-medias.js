

KarmaFieldsAlpha.field.tableMedias = class extends KarmaFieldsAlpha.field.table {

  // async dispatch(event) {
  //
  //   switch (event.action) {
  //
  //     case "change-file": {
  //
  //       const selectedIds = this.getSelectedIds();
  //
  //       if (selectedIds.length === 1) {
  //         await this.changeFile(event.files[0], selectedIds[0], event.params);
  //         await this.render();
  //       }
  //
  //       break;
  //     }
  //
  //     case "upload": {
  //
  //       this.interface.unselect();
  //       const ids = await this.upload(event.files, event.params);
  //       event.data = ids;
  //
  //       await this.render();
  //       break;
  //     }
  //
  //     case "regen": {
  //       const selectedIds = this.getSelectedIds();
  //       for (let id of selectedIds) {
  //         await this.regen(id);
  //       }
  //       await this.render();
  //       break;
  //     }
  //
  //     default:
  //       await super.dispatch(event);
  //
  //
  //   }
  //
  //
  //   return event;
  // }

  async request(subject, content, ...path) {

    switch (subject) {

      case "change-file": {

        const selectedIds = this.getSelectedIds();

        if (selectedIds.length === 1) {
          await this.changeFile(content.files[0], selectedIds[0], content.params);
          await this.render();
        }

        break;
      }

      case "upload": {

        this.interface.unselect();

        const ids = await this.upload(content.files, content.params);

        await this.render();

        return ids;
      }

      case "regen": {
        const selectedIds = this.getSelectedIds();
        for (let id of selectedIds) {
          await this.regen(id);
        }
        return this.render();
      }

      default:
        return super.request(subject, content, ...path);

    }

  }



  async upload(files, params = {}) {

    KarmaFieldsAlpha.History.save();

    const newIds = [];

    for (let file of files) {

      let id = await KarmaFieldsAlpha.Gateway.upload(file, params);

      id = id.toString();

      newIds.push(id);

      await this.server.store.query("id="+id);

      this.server.buffer.set(["0"], id, "trash");

      // this.grid.buffer.set(["1"], id, "trash");
      // this.grid.buffer.backup(["0"], id, "trash");
      // this.grid.buffer.set(["0"], id, "trash");
      this.interface.buffer.change(["0"], ["1"], id, "trash");

      const ids = [id, ...this.getIds()];

      // this.idsBuffer.backup(ids);
      // this.idsBuffer.set(ids);

      this.idsBuffer.change(ids);


      for (let key in params) {

        const value = params[key];

        // this.grid.buffer.backup([value], id, key);
        // this.grid.buffer.set([value], id, key);

        this.interface.buffer.change([value], undefined, id, key);

      }

      await this.render();

    }

    return newIds;
  }

  async changeFile(file, id, params = {}) {

    const item = this.server.buffer.get(id);
    const original = KarmaFieldsAlpha.DeepObject.clone(item);

    // const name = this.buffer.get(id, "name");
    // const filename = this.buffer.get(id, "filename");
    // const type = this.buffer.get(id, "type");
    // const size = this.buffer.get(id, "size");

    KarmaFieldsAlpha.History.save();

    await KarmaFieldsAlpha.Gateway.upload(file, {...params, id: id});

    await this.server.store.get(id);

    const newItem = this.buffer.get(id);
    const newClone = KarmaFieldsAlpha.DeepObject.clone(newItem);

    // this.grid.buffer.set(original, id);
    // this.grid.buffer.backup(newClone, id);
    // this.grid.buffer.set(newClone, id);

    this.interface.buffer.change(newClone, original, id);

  }

  async regen(id) {

    await KarmaFieldsAlpha.Gateway.post("regen/"+id);

  }




  static interface = class extends KarmaFieldsAlpha.field.table.interface {

    constructor(...args) {

      super(...args);

      this.selectionBuffer = new KarmaFieldsAlpha.Buffer("state", this.resource.context, "selection");

      // this.clipboard = new KarmaFieldsAlpha.Clipboard();

      this.clipboard = this.createChild("clipboard");

    }

    // async dispatch(event) {
    //
    //   switch(event.action) {
    //
    //     // case "get": {
    //     //
    //     //   event.path = ["content", ...path];
    //     //   await super.dispatch(event);
    //     //   break;
    //     // }
    //
    //     // case "get": {
    //     //   return super.dispatch(event, "content", ...path);
    //     // }
    //
    //     // case "unselect": {
    //     //
    //     //   const ids = this.selectionBuffer.get() || [];
    //     //
    //     //   if (ids.length) {
    //     //
    //     //     KarmaFieldsAlpha.History.save();
    //     //
    //     //     this.selectionBuffer.backup();
    //     //     this.selectionBuffer.remove();
    //     //
    //     //   }
    //     //
    //     //   this.idSelector.clearSelection();
    //     //   break;
    //     // }
    //
    //     case "open-folder": {
    //       const [id] = event.path;
    //       // const id = KarmaFieldsAlpha.Type.toString(event.data);
    //
    //       if (id !== KarmaFieldsAlpha.Nav.get("parent")) {
    //
    //         KarmaFieldsAlpha.History.save();
    //
    //         this.unselect();
    //
    //         KarmaFieldsAlpha.Nav.change(id, "parent");
    //
    //         await super.dispatch({
    //           action: "query-ids"
    //         });
    //
    //         await super.dispatch({
    //           action: "render"
    //         });
    //
    //       }
    //       break;
    //     }
    //
    //     // case "actives": // -> deprec
    //     // case "selection":
    //     //   event.data = this.selectionBuffer.get() || [];
    //     //   break;
    //
    //     case "upper-folder": {
    //
    //       const id = KarmaFieldsAlpha.Nav.get("parent");
    //
    //       if (id && id !== "0") {
    //
    //         const parent = await this.getString(id, "parent");
    //
    //         KarmaFieldsAlpha.History.save();
    //
    //         this.unselect();
    //
    //         KarmaFieldsAlpha.Nav.backup(parent, "parent");
    //         KarmaFieldsAlpha.Nav.set(parent, "parent"); // -> will remove key instead of setting ""
    //
    //         const page = KarmaFieldsAlpha.Nav.get("page") || "1";
    //
    //         if (page !== "1") {
    //           KarmaFieldsAlpha.Nav.backup(1, "page");
    //           KarmaFieldsAlpha.Nav.change(1, "page");
    //         }
    //
    //         await super.dispatch({
    //           action: "query-ids"
    //         });
    //
    //         await super.dispatch({
    //           action: "render"
    //         });
    //       }
    //
    //       break;
    //     }
    //
    //     // case "prev": {
    //     //   const selectedIds = this.selectionBuffer.get() || [];
    //     //   const ids = await this.dispatch({action: "ids"});
    //     //   const index = ids.findIndex(id => id === selectedIds[0]);
    //     //   if (selectedIds.length === 1 && index > 0) {
    //     //     const id = ids[index-1];
    //     //     this.selectionBuffer.backup([id]);
    //     //     this.selectionBuffer.set([id]);
    //     //     await this.dispatch({action: "render"});
    //     //   }
    //     //
    //     //   break;
    //     // }
    //     //
    //     // case "next": {
    //     //   const selectedIds = this.selectionBuffer.get() || [];
    //     //   const ids = await this.dispatch({action: "ids"});
    //     //   const index = ids.findIndex(id => id === selectedIds[0]);
    //     //   if (selectedIds.length === 1 && index > -1 && index < ids.length-1) {
    //     //     const id = ids[index+1];
    //     //     this.selectionBuffer.backup([id]);
    //     //     this.selectionBuffer.set([id]);
    //     //     await this.dispatch({action: "render"});
    //     //   }
    //     //   break;
    //     // }
    //     //
    //     // case "has-prev": {
    //     //   const selectedIds = this.selectionBuffer.get() || [];
    //     //   const ids = await this.dispatch({action: "ids"});
    //     //   event.data = selectedIds.length === 1 && selectedIds[0] !== ids[0];
    //     //   break;
    //     // }
    //     //
    //     // case "has-next": {
    //     //   const selectedIds = this.selectionBuffer.get() || [];
    //     //   const ids = await this.dispatch({action: "ids"});
    //     //   event.data = selectedIds.length === 1 && selectedIds[0] !== ids[ids.length-1];
    //     //   break;
    //     // }
    //
    //
    //
    //     default:
    //       await super.dispatch(event);
    //
    //   }
    //
    //   return event;
    // }

    async openFolder(id) {

      const current = KarmaFieldsAlpha.Nav.get("parent");

      if (id !== current) {

        KarmaFieldsAlpha.History.save();

        this.unselect();

        KarmaFieldsAlpha.Nav.change(id, current, "parent");

        await this.parent.request("query-ids");
        await this.parent.request("render");

      }

    }

    async upperFolder() {

      const id = KarmaFieldsAlpha.Nav.get("parent");

      if (id && id !== "0") {

        const parent = await this.getString(id, "parent");

        KarmaFieldsAlpha.History.save();

        this.unselect();

        // KarmaFieldsAlpha.Nav.backup(parent, "parent");
        // KarmaFieldsAlpha.Nav.set(parent, "parent"); // -> will remove key instead of setting ""

        KarmaFieldsAlpha.Nav.change(parent, id, "parent");

        const page = KarmaFieldsAlpha.Nav.get("page") || "1";

        if (page !== "1") {
          // KarmaFieldsAlpha.Nav.backup(1, "page");
          KarmaFieldsAlpha.Nav.change(1, page, "page");
        }

        await this.parent.request("query-ids");
        await this.parent.request("render");

      }

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

        default:
          return super.request(subject, content, ...path);

      }

    }


    // async updateSelection(index, length) {
    //
    //   const selection = this.selectionBuffer.get() || {};
    //   const segment = new KarmaFieldsAlpha.Segment(index, length);
    //
    //   if (!segment.equals(selection.index, selection.length)) {
    //
    //     KarmaFieldsAlpha.History.save();
    //
    //     this.select(index, length);
    //
    //     // const ids = await this.dispatch({
    //     //   action: "ids"
    //     // }).then(request => KarmaFieldsAlpha.Type.toArray(request.data));
    //
    //     const ids = await this.parent.request("ids");
    //
    //     const selectedIds = ids.slice(index, index + length);
    //
    //     this.clipboard.setData(selectedIds.map(id => [id]));
    //     await this.parent.request("edit-selection");
    //
    //   } else {
    //
    //     this.clipboard.focus();
    //
    //   }
    //
    // }

    build() {

      return {
        class: "karma-field-table-grid-container karma-field-frame karma-field-group final",
        init: body => {
          body.element.tabIndex = -1;
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
        },
        children: [
          this.clipboard.build(),
          {
            class: "media-table",
            tag: "ul",
            init: async grid => {
              if (this.resource.style) {
                grid.element.style = this.resource.style;
              }
              grid.element.ondrop = async event => {
                event.preventDefault();
                const files = event.dataTransfer.files;
                if (event.dataTransfer.files.length) {

                  grid.element.classList.add("loading");

                  await this.parent.request("upload", {
                    files: event.dataTransfer.files,
                    params: {
                      parent: KarmaFieldsAlpha.Nav.get("parent") || "0"
                    }
                  });
                  grid.element.classList.remove("loading");
                }
              }
              grid.element.ondragover = function(event) {
                event.preventDefault();
              }
            },
            update: async grid => {

              const ids = await this.parent.request("ids");
              const page = await this.parent.request("page");
              const ppp = await this.parent.request("ppp");
              const offset = (page - 1)*ppp;

              // const columns = await this.parent.request("columns");

              this.clipboard.onInput = value => {
                const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
                const data = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
                this.parent.request("import", {data: data});

                // const data = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
                // const selection = this.selectionBuffer.get();
                // if (selection) {
                //   this.parent.request("import", {data: data});
                // }
              }

              // this.clipboard.ta.onfocus = event => {
              //   grid.element.classList.add("focus");
              // }
              // this.clipboard.ta.onblur = event => {
              //   grid.element.classList.remove("focus");
              // }

              const currentSelection = this.selectionBuffer.get() || {};

              if (ids.length) {
                grid.element.classList.add("filled"); // -> draw table borders
                grid.children = ids.map((id, index) => {

                  return {
                    tag: "li",
                    update: li => {



                      const isSelected = KarmaFieldsAlpha.Segment.contains(currentSelection, index);

                      li.element.classList.toggle("selected", isSelected);

                      li.element.onmousedown = async event => {

                        const selectionManager = new KarmaFieldsAlpha.SelectionManager(grid.element, 1, ids.length, 0, 0);

                        selectionManager.selection = this.selectionBuffer.get();

                        selectionManager.onSelect = async (selection, hasChange) => {
                          if (hasChange) {
                            KarmaFieldsAlpha.History.save();
                            this.selectionBuffer.change(selection);
                          }

                          // const data = await this.export();
                          const jsonData = await this.parent.request("export");
                          const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                          const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                          this.clipboard.output(value);
                          this.clipboard.focus();

                          await this.parent.request("render");
                        };

                        selectionManager.select(event, 1, index);





                        // const currentSelection = this.selectionBuffer.get();
                        //
                        // const newSelection = new KarmaFieldsAlpha.Selection(event, grid.element, [...grid.element.children], 1, ids.length, 0, index, currentSelection);
                        //
                        // await newSelection.select();
                        //
                        // await this.updateSelection(newSelection.index, newSelection.length);

                      }
                    },
                    child: {
                      class: "frame",
                      init: frame => {
                        frame.element.tabIndex = -1;
                      },
                      update: async frame => {

                        frame.element.classList.add("loading");

                         // => mime type
                        const type = await this.request("get", {}, id, "type").then(response => KarmaFieldsAlpha.Type.toString(response));
                        const filetype = await this.request("get", {}, id, "filetype").then(response => KarmaFieldsAlpha.Type.toString(response));
                        const thumb = await this.request("get", {}, id, "thumb").then(response => KarmaFieldsAlpha.Type.toObject(response));

                        const isFolder = !filetype || filetype === "folder";

                        frame.element.ondblclick = event => {
                          if (isFolder && id != "0") {
                            this.request("open-folder", {}, id);
                          }
                        }

                        frame.children = [
                          {
                            tag: "figure",
                            update: async figure => {

                              const [mediaType] = type.split("/");

                              figure.element.classList.toggle("dashicons", !thumb);
                              figure.element.classList.toggle("dashicons-category", isFolder);
                              figure.element.classList.toggle("dashicons-media-video", !thumb && mediaType === "video");
                              figure.element.classList.toggle("dashicons-media-audio", !thumb && mediaType === "audio");
                              figure.element.classList.toggle("dashicons-media-text", !thumb && mediaType === "text");
                              figure.element.classList.toggle("dashicons-media-document", !thumb && type === "application/pdf");
                              figure.element.classList.toggle("dashicons-media-default", !thumb && !isFolder && mediaType !== "video" && mediaType !== "audio" && mediaType !== "text" && type !== "application/pdf");

                              if (thumb) {
                                figure.child = {
                                  tag: "img",
                                  update: async img => {
                                    const src = KarmaFieldsAlpha.uploadURL+"/"+thumb.filename;
                                    if (!img.element.src.endsWith(src)) { // -> setting same src will reload image!
                                      img.element.src = KarmaFieldsAlpha.uploadURL+"/"+thumb.filename;
                                    }
                                  }
                                }
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
                                const name = await this.request("get", {}, id, "name").then(response => KarmaFieldsAlpha.Type.toString(response));
                                filename.element.innerHTML = name || "no name";
                              }
                            }
                          }
                        ];
                      },
                      complete: frame => {
                        frame.element.classList.remove("loading");
                      }
                    }

                  };
                });
              } else {
                grid.children = [];
                grid.element.classList.remove("filled");
              }
            },
            complete: async grid => {

              // -> caution not lose focus i.e. search field!

              if (document.activeElement === document.body) {

                // const jsonData = await this.parent.request("export");
                //
                // this.clipboard.setJson(jsonData);
                // this.clipboard.focus();
                const jsonData = await this.parent.request("export");
                const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                this.clipboard.output(value);
                this.clipboard.focus();

              }

            }
          }
        ]
      };

    }

    static row = class extends KarmaFieldsAlpha.field.table.interface.row {

      async export(keys) {
        const key = this.getKey();
        if (!keys.length || keys.includes("id")) {
          return {
            id: key,
            filetype: await super.request("get", {}, "filetype").then(response => KarmaFieldsAlpha.Type.toString(response))
          };
        }
      }

      async import(object) {
        // noop
      }

    }


    static modal = class extends KarmaFieldsAlpha.field.table.interface.modal {

      async request(subject, content, ...path) {

        switch (subject) {

          case "close": {

            const selection = await this.parent.request("selection");

            if (selection) {

              await this.parent.request("unselect");

            } else {

              await this.parent.request("upper-folder");

            }

            await this.parent.request("render");

            break;
          }

          case "is-attachment": {
            const ids = await this.parent.request("selectedIds");
            for (let id in ids) {
              const response = await this.parent.request("get", {}, id, "filetype");
              const filetype = KarmaFieldsAlpha.Type.toString(response);
              if (filetype !== "file") {
                return false;
              }
            }
            return true;
          }

          case "is-folder": {
            // const data = await this.parent.request("read", {});
            // return data.every(row => KarmaFieldsAlpha.Type.toString(row.filetype) === "folder");
            const ids = await this.parent.request("selectedIds");
            for (let id in ids) {
              const response = await this.parent.request("get", {}, id, "filetype");
              const filetype = KarmaFieldsAlpha.Type.toString(response);
              if (filetype === "file") {
                return false;
              }
            }
            return true;
          }

          default:
            return super.request(subject, content, ...path);

        }

      }

      static mediaDescription = class extends KarmaFieldsAlpha.field {

        build() {
          return {
            class: "karma-field karma-field-container media-description display-flex",
            update: async container => {

              const selection = await this.parent.request("selection");
              const filetype = await this.getString("filetype");
              // const filetype = await this.request("get", {}, "filetype").then(response => KarmaFieldsAlpha.Type.toString(response));
              const isAttachment = await this.parent.request("is-attachment");


              container.children = [
                {
                  class: "karma-field-frame",
                  children: [
                    {
                      // -> multiple attachments/folders
                      update: frame => {
                        frame.element.classList.toggle("hidden", !selection || selection.length <= 1);
                        if (selection && selection.length > 1) {
                          frame.child = {
                            tag: "span",
                            class: "dashicons dashicons-format-gallery",
                            init: span => {
                              span.element.style = "font-size:10em;text-align:left;height:auto;width:auto;";
                            }
                          }
                        }
                      }
                    },
                    {
                      // -> 1 attachment
                      update: async frame => {
                        frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || filetype !== "file");
                        if (selection && selection.length === 1 && filetype === "file") {
                          const type = await this.getString("type");
                          frame.children = [
                            {
                              tag: "figure",
                              class: "image",
                              update: figure => {
                                if (type.startsWith("image")) {
                                  figure.child = {
                                    tag: "img",
                                    init: img => {
                                      img.element.sizes = "40em";
                                    },
                                    update: async img => {
                                      const filename = await this.getString("filename");
                                      const src = KarmaFieldsAlpha.uploadURL+"/"+filename;
                                      const sizes = await this.getArray("sizes");
                                      const sources = sizes.filter(size => size.width).map(size => `${KarmaFieldsAlpha.uploadURL}/${encodeURI(size.filename)} ${size.width}w`);
                                      const srcset = [...new Set(sources)].join(",");

                                      img.element.src = src;
                                      img.element.srcset = srcset;
                                    }
                                  }
                                } else {
                                  figure.children = [];
                                }
                              }
                            },
                            {
                              tag: "figure",
                              class: "video",
                              update: figure => {
                                if (type.startsWith("video")) {
                                  figure.child = {
                                    tag: "video",
                                    child: {
                                      tag: "source",
                                      update: async source => {
                                        const filename = await this.getString("filename");
                                        source.element.src = KarmaFieldsAlpha.uploadURL+"/"+filename;
                                        source.element.type = type;
                                      }
                                    },
                                    update: async video => {
                                      video.element.setAttribute("controls", "1");
                                      // img.element.src = await this.getString("src");
                                      // img.element.srcset = await this.getString("srcset");
                                    }
                                  }
                                } else {
                                  figure.children = [];
                                }
                              }
                            }
                          ];
                        }
                      }
                    },
                    {
                      // -> 1 folder
                      update: frame => {
                        frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || filetype === "file");
                        if (selection && selection.length === 1 && filetype !== "file") {
                          frame.child = {
                            tag: "span",
                            class: "dashicons dashicons-category",
                            init: span => {
                              span.element.style = "font-size:8em;height:auto;width:auto;"
                            }
                          }
                        }
                      }
                    },
                    {
                      // -> no selection
                      update: frame => {
                        frame.element.classList.toggle("hidden", Boolean(selection));
                        if (!selection) {
                          frame.child = {
                            tag: "span",
                            class: "dashicons dashicons-open-folder",
                            init: span => {
                              span.element.style = "font-size:8em;height:auto;width:auto;"
                            }
                          }
                        }
                      }
                    }
                  ]
                },
                {
                  class: "karma-field-frame",
                  children: [
                    {
                      // -> multiple attachments/folders
                      update: frame => {
                        frame.element.classList.toggle("hidden", !selection || selection.length <= 1);
                        if (selection && selection.length > 1) {
                          frame.children = [
                            {
                              tag: "label",
                              update: span => {
                                span.element.innerHTML = `${selection.length} items selected`;
                              }
                            }
                          ];
                        }
                      }
                    },
                    {
                      // -> 1 attachment
                      class: "karma-field karma-field-container display-block",
                      update: frame => {
                        frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || filetype !== "file");
                        if (selection && selection.length === 1 && filetype === "file") {
                          frame.children = [
                            {
                              class: "filename",
                              children: [
                                {
                                  tag: "label",
                                  init: label => {
                                    label.element.innerHTML = "Filename";
                                  }
                                },
                                {
                                  class: "value",
                                  child: {
                                    tag: "a",
                                    update: async a => {
                                      const name = await this.getString("name");
                                      const filename = await this.getString("filename");
                                      a.element.innerHTML = name;
                                      a.element.href = KarmaFieldsAlpha.uploadURL+"/"+filename;
                                    }
                                  }
                                }
                              ]
                            },
                            {
                              children: [
                                {
                                  tag: "label",
                                  init: label => {
                                    label.element.innerHTML = "Size";
                                  }
                                },
                                {
                                  update: async node => {
                                    const size = await this.getNumber("size");
                                    node.element.innerHTML = `${(size/1000).toFixed()} KB`;
                                  }
                                }
                              ]
                            },
                            {
                              children: [
                                {
                                  tag: "label",
                                  init: label => {
                                    label.element.innerHTML = "Dimensions";
                                  }
                                },
                                {
                                  update: async node => {
                                    node.element.innerHTML = `${await this.getString("width")} x ${await this.getString("height")} pixels`;
                                  }
                                }
                              ]
                            },
                            {
                              children: [
                                {
                                  tag: "label",
                                  init: label => {
                                    label.element.innerHTML = "Uploaded on";
                                  }
                                },
                                {
                                  update: async node => {
                                    const value = await this.getString("date");
                                    const date = new Date(value || null);

                                    node.element.innerHTML = new Intl.DateTimeFormat(KarmaFieldsAlpha.locale, {
                                      year: "numeric",
                                      month: "long",
                                      day: "2-digit"
                                    }).format(date);
                                  }
                                }
                              ]
                            }
                          ]
                        }
                      }
                    },
                    {
                      // -> 1 folder
                      class: "one-folder",
                      update: async frame => {
                        frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || filetype === "file");
                        if (selection && selection.length === 1 && filetype !== "file") {
                          frame.children = [
                            this.createChild({
                              id: "open-folder",
                              type: "button",
                              title: "Open",
                              action: "open-folder"
                            }).build()
                          ];

                        }
                      }
                    },
                    {
                      // -> no selection
                      update: frame => {
                        frame.element.classList.toggle("hidden", Boolean(selection));
                        if (!selection) {
                          frame.children = [
                            this.createChild({
                              id: "breadcrumb",
                              type: "breadcrumb",
                              title: "Path"
                            })
                          ]
                        }
                      }
                    }
                  ]
                }
              ];


            }
          }
        }

      }





    }

  }


  static upload = class extends KarmaFieldsAlpha.field.button {

    constructor(resource) {
      super({
        action: "upload",
        ...resource
      });
    }

    build() {

      return {
        class: "karma-upload karma-field",
        init: button => {
          button.element.id = "upload-button";
        },
        children: [
          {
            tag: "input",
            init: input => {
              input.element.type = "file",
              input.element.id = this.getId();
              input.element.multiple = true;
              input.element.hidden = true;
            },
            update: input => {
              input.element.onchange = async event => {
                const files = input.element.files;
                if (files.length) {
                  input.element.classList.add("editing");
                  // requestIdleCallback(async () => {
                  setTimeout(async () => {
                    // this.dispatch({
                    //   action: "upload",
                    //   files: files,
                    //   params: {
                    //     parent: KarmaFieldsAlpha.Nav.get("parent") || "0"
                    //   }
                    // }).then(async request => {
                    //   input.element.classList.remove("editing");
                    //   input.element.blur();
                    // });
                    await this.parent.request(this.resource.action, {
                      files: files,
                      params: {
                        parent: KarmaFieldsAlpha.Nav.get("parent") || "0"
                      }
                    });
                    input.element.classList.remove("editing");
                    input.element.blur();
                  }, 50);
                }
              }
            }
          },
          {
            tag: "label",
            init: input => {
              input.element.htmlFor = this.getId();
              input.element.textContent = this.resource.title || "Add File";
            }
          }
        ]

      };
    }

  }

  static changeFile = class extends this.upload {

    // async dispatch(event) {
    //   if (event.action === "upload") {
    //     event.action = "change-file";
    //   }
    //   await super.dispatch(event);
    //   return event;
    // }

    constructor(resource) {
      super({
        action: "change-file",
        ...resource
      });
    }

  }







  static directoryDropdown = class extends KarmaFieldsAlpha.field.dropdown {

    async getAncestors() {

      let parent = KarmaFieldsAlpha.Nav.get("parent");
      const ancestors = [];

      while (parent && parent != "0") {

        let media = await this.parent.request("queryid", {id: parent});

        ancestors.unshift({
          id: parent,
          name: media.name || ""
          // active: id === parent
        });

        parent = media && media.parent;

      }

      return ancestors;
    }

    async fetchOptions() {

      const options = this.resource.options || [
        {
          id: "",
          name: "–"
        },
        {
          id: "0",
          name: "Uploads"
        }
      ];


      const ancestors = await this.getAncestors();

      return [...options, ...ancestors];

    }

  }

  static breadcrumb = class extends this.directoryDropdown {

    build() {
      return {
        class: "karma-breadcrumb",
        tag: "ul",
        update: async ul => {

          const ancestors = await this.getAncestors();

          ul.children = [{
            id: "0",
            name: "Uploads",
            active: ancestors.length === 0
          }, ...ancestors].map((item, index, array) => {
            return {
              tag: "li",
              child: {
                tag: "a",
                update: a => {
                  a.element.classList.toggle("active", index === array.length - 1);
                  a.element.innerHTML = item.name || "no name";
                  a.element.onclick = async event => {

                    const id = KarmaFieldsAlpha.Nav.get("parent");

                    if (!item.active && id !== item.id) {
                      KarmaFieldsAlpha.History.save();
                      KarmaFieldsAlpha.Nav.change(item.id, id, this.resource.key);

                      // await this.dispatch({
                      //   action: "query-ids"
                      // });
                      //
                      // await this.dispatch({
                      //   action: "render"
                      // });

                      await this.parent.request("query-ids");
                      await this.parent.request("render");

                    }

                  }
                }
              }
            };
          });

        }
      }
    }

  }




}
