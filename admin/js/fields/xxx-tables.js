
KarmaFieldsAlpha.field.tables = class extends KarmaFieldsAlpha.field {


  constructor(...args) {
    super(...args);

    KarmaFieldsAlpha.tables = this; // -> debug

  }

  // async dispatch(event) {
  //
  //   switch (event.action) {
  //
  //     case "close":
  //       // KarmaFieldsAlpha.Gateway.clearOptions();
  //       KarmaFieldsAlpha.Nav.empty();
  //       await this.render();
  //       break;
  //
  //     case "undo":
  //     case "redo":
  //       await this.render();
  //       break;
  //
  //     case "render": {
  //       // const tableId = KarmaFieldsAlpha.Nav.get("karma");
  //       // const tableField = this.getChild(tableId);
  //       //
  //       // if (tableField) {
  //       //   await tableField.queryIds();
  //       // }
  //
  //       await this.render();
  //       break;
  //     }
  //
  //     // case "media-library":
  //     //   KarmaFieldsAlpha.Nav.setObject(new URLSearchParams({karma: "medias"})); // , id: event.id
  //     //   await this.render();
  //     //   break;
  //
  //     // case "nav":
  //     //   this.render(true);
  //     //   break;
  //
  //   }
  //
  //   return event;
  // }

  async request(subject, content = {}, ...path) {

    switch (subject) {

      case "close":
        KarmaFieldsAlpha.Nav.remove();
        KarmaFieldsAlpha.History.buffer.remove("history");
        await this.render();
        break;

      case "undo":
      case "redo":
        await this.render();
        break;

      case "table": {
        const resource = this.resource.tables.find(resource => resource.id === content.id);
        if (resource) {
          return this.createChild(resource);
        }
        break;
      }

      case "render": {
        await this.render();
        break;
      }

    }

  }

  async queryTable() {

    // -> not on undo/redo !

    const tableId = KarmaFieldsAlpha.Nav.get("table");
    const resource = this.resource.tables.find(resource => resource.id === tableId);

    if (resource) {
      const table = this.createChild(resource);
      await table.queryIds();
    }

    // await this.render();
  }

  build() {
    return {
      class: "popup",
      init: async container => {

        this.render = container.render;

        // window.addEventListener("popstate", async event => {
        //
        //   let index = KarmaFieldsAlpha.History.getIndex();
        //   const hash = KarmaFieldsAlpha.Nav.getHash();
        //   const newHash = location.hash.slice(1);
        //   const newParams = KarmaFieldsAlpha.Nav.toObject(newHash);
        //
        //   if (event.state) {
        //
        //     while (event.state.index < index) {
        //       KarmaFieldsAlpha.History.undo();
        //       index = KarmaFieldsAlpha.History.getIndex();
        //     }
        //
        //     while (event.state.index > index) {
        //       KarmaFieldsAlpha.History.redo();
        //       index = KarmaFieldsAlpha.History.getIndex();
        //     }
        //
        //   } else if (hash !== location.hash.slice(1) && newParams.table) {
        //
        //     const currentParams = KarmaFieldsAlpha.Nav.get();
        //
        //     KarmaFieldsAlpha.History.save();
        // 		KarmaFieldsAlpha.History.backup(newParams, currentParams, false, "nav");
        // 		this.set(newParams);
        //     history.replaceState({index: index}, null, newHash);
        //
        //     await this.queryTable();
        //
        //   }
        //
        //   return this.render();
        // });

        window.addEventListener("popstate", async event => {

          // let index = KarmaFieldsAlpha.History.getIndex();
          const params = KarmaFieldsAlpha.Nav.get() || {};
          const hash = KarmaFieldsAlpha.Nav.toString(params);
          const newHash = location.hash.slice(1);
          const newParams = KarmaFieldsAlpha.Nav.toObject(newHash);

          if (newHash !== hash) {

            if (params.table) { // -> not when open first

              KarmaFieldsAlpha.History.save();

            }

            KarmaFieldsAlpha.Nav.change(newParams);

            await this.queryTable();

          }

          return this.render();
        });

        // window.addEventListener("popstate", event => {
        //
        //   console.log(window.history, event, location.hash);
        //
        //   KarmaFieldsAlpha.History.save();
        //   this.queryTable();
        // });

        const newHash = location.hash.slice(1);
        const newParams = KarmaFieldsAlpha.Nav.toObject(newHash);

        if (newParams.table) {
          KarmaFieldsAlpha.Nav.set(newParams);
          await this.queryTable();
        }




      },
      update: popup => {

        popup.element.classList.toggle("hidden", !KarmaFieldsAlpha.Nav.has("table") && !this.resource.navigation);
      },
      child: {
        class: "popup-content",
        children: [
          {
            class: "navigation karma-field-frame",
            update: navigation => {
              navigation.element.classList.toggle("hidden", !this.resource.navigation);
              if (this.resource.navigation) {
                navigation.child = this.createChild({
                  ...this.resource.navigation,
                  type: "navigation"
                }).build();
              }
            }
          },
          {
            class: "tables",
            update: container => {
              document.body.classList.toggle("karma-table-open", KarmaFieldsAlpha.Nav.has("table"));

              const tableId = KarmaFieldsAlpha.Nav.get("table");



              container.children = this.resource.tables.map((resource, index) => {
                return {
                  class: "table-container",
                  update: async container => {
                    container.element.classList.toggle("hidden", tableId !== resource.id);

                    if (tableId === resource.id) {
                      const table = this.createChild(resource);

                      if (!table.idsBuffer.get()) {
                        await table.queryIds(); // -> needed when fetching (table transfer)
                      }

                      // if (table.hash !== location.hash.slice(1)) {
                        // table.hash = location.hash.slice(1);

                        // table.server.store.empty();



                        // await table.queryIds();
                      // }
                      container.child = table.build();
                    } else {
                      container.children = []
                    }
                  }
                };
              });
            }
          }
        ]
      }
    };
  }

  static navigation = class extends KarmaFieldsAlpha.field.group {

    static menu = class extends KarmaFieldsAlpha.field {

      getItems() {
        return this.resource.items || [];
      }

      build() {
        return {
          tag: "ul",
          children: this.getItems().map((item, index) => {
            return {
              tag: "li",
              children: [
                {
                  tag: "a",
                  init: li => {
                    li.element.innerHTML = item.title;
                    li.element.href = "#"+item.hash;
                  }
                },
                this.createChild({
                  items: this.resource.children,
                  type: "menu"
                }, index).build()
              ],
              update: li => {
                this.active = location.hash.slice(1) === item.hash;
                li.element.classList.toggle("active", this.active);
              },
              complete: li => {
                this.current = this.children.some(child => child.active || child.current);
                // this.active = this.resource.children.some((child, index) => this.getChild(index).active);
                li.element.classList.toggle("current", this.current);
              }
            };
          })
        }
      }
    }

  }



}
