

KarmaFieldsAlpha.field.table.media = class extends KarmaFieldsAlpha.field.table.collection {

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

      const parent = await this.getString(id, "parent");

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

  async upload(files, params = {}) {

    KarmaFieldsAlpha.History.save();

    const newIds = [];

    for (let file of files) {

      let id = await KarmaFieldsAlpha.Gateway.upload(file, params);

      id = id.toString();

      newIds.push(id);

      await this.query("id="+id);

      this.initialBuffer.set(["0"], id, "trash");
      this.buffer.change(["0"], ["1"], id, "trash");

      const ids = [id, ...this.getIds()];

      this.idsBuffer.change(ids);

      for (let key in params) {

        const value = params[key];

        this.buffer.change([value], undefined, id, key);

      }

      await this.parent.request("render");

    }

    return newIds;
  }

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

  build() {

    return {
      class: "karma-field-table-grid-container karma-field-frame karma-field-group final",
      init: body => {
        body.element.tabIndex = -1;
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

            const ids = this.getIds();
            const page = this.getPage();
            const ppp = this.getPpp();
            const offset = (page - 1)*ppp;

            this.clipboard.onInput = value => {
              const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
              const data = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
              this.importSelection(data);
            }

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

                        const jsonData = await this.export(selection.index, selection.length);
                        const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                        const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                        this.clipboard.output(value);
                        this.clipboard.focus();

                        await this.parent.request("render");
                      };

                      selectionManager.select(event, 1, index);
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
                          this.openFolder(id);
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
              const jsonData = await this.exportSelection();
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

  // static row = class extends KarmaFieldsAlpha.field.table.interface.row {
  //
  //   async export(keys) {
  //     const key = this.getKey();
  //     if (!keys.length || keys.includes("id")) {
  //       return {
  //         id: key,
  //         filetype: await super.request("get", {}, "filetype").then(response => KarmaFieldsAlpha.Type.toString(response))
  //       };
  //     }
  //   }
  //
  //   async import(object) {
  //     // noop
  //   }
  // 
  // }

  static mediaDescription = class extends KarmaFieldsAlpha.field {

    build() {
      return {
        class: "karma-field karma-field-container media-description display-flex",
        update: async container => {

          const selection = await this.parent.request("selection");
          // const filetype = await this.getString("filetype");
          // const isAttachment = await this.parent.request("is-attachment");

          const filetype = await this.parent.request("state", {}, "filetype");

          const uniqueFileType = filetype.values.length === 1 && KarmaFieldsAlpha.Type.toString(filetype.values[0]);


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
                    frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || uniqueFileType !== "file");
                    if (selection && selection.length === 1 && uniqueFileType === "file") {
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
                                  const filename = await this.parent.request("get", {}, "filename").then(response => KarmaFieldsAlpha.Type.toString(response));
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
                                    const filename = await this.parent.request("get", {}, "filename").then(response => KarmaFieldsAlpha.Type.toString(response));
                                    source.element.src = KarmaFieldsAlpha.uploadURL+"/"+filename;
                                    source.element.type = type;
                                  }
                                },
                                update: async video => {
                                  video.element.setAttribute("controls", "1");
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
                    frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || uniqueFileType !== "folder");
                    if (selection && selection.length === 1 && uniqueFileType === "folder") {
                      frame.child = {
                        tag: "span",
                        class: "dashicons dashicons-category",
                        init: span => {
                          span.element.style = "font-size:8em;height:auto;width:auto;"
                        }
                      }
                    }
                  }
                }
                // {
                //   // -> no selection
                //   update: frame => {
                //     frame.element.classList.toggle("hidden", Boolean(selection));
                //     if (!selection) {
                //       frame.child = {
                //         tag: "span",
                //         class: "dashicons dashicons-open-folder",
                //         init: span => {
                //           span.element.style = "font-size:8em;height:auto;width:auto;"
                //         }
                //       }
                //     }
                //   }
                // }
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
                    frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || uniqueFileType !== "file");
                    if (selection && selection.length === 1 && uniqueFileType === "file") {
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
                    frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || uniqueFileType !== "folder");
                    if (selection && selection.length === 1 && uniqueFileType === "folder") {
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
                }
                // {
                //   // -> no selection
                //   update: frame => {
                //     frame.element.classList.toggle("hidden", Boolean(selection));
                //     if (!selection) {
                //       frame.children = [
                //         this.createChild({
                //           id: "breadcrumb",
                //           type: "breadcrumb",
                //           title: "Path"
                //         })
                //       ]
                //     }
                //   }
                // }
              ]
            }
          ];


        }
      }
    }

  }


}


KarmaFieldsAlpha.field.mediaTable = class extends KarmaFieldsAlpha.field.table {

  async request(subject, content, ...path) {

    switch (subject) {

      case "change-file": {

        const selectedIds = this.interface.getSelectedIds();

        if (selectedIds.length === 1) {
          await this.interface.changeFile(content.files[0], selectedIds[0], content.params);
          await this.render();
        }

        break;
      }

      case "upload": {

        this.interface.unselect();

        const ids = await this.interface.upload(content.files, content.params);

        await this.render();

        return ids;
      }

      case "regen": {
        const selectedIds = this.interface.getSelectedIds();
        for (let id of selectedIds) {
          await this.interface.regen(id);
        }
        return this.interface.render();
      }

      default:
        return super.request(subject, content, ...path);

    }

  }

  static changeFile = class extends this.upload {

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
        // let media = await mediaTable.interface.get(parent);

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
