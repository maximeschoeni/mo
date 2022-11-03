

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

}
