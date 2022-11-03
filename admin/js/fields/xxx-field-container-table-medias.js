
KarmaFieldsAlpha.field.medias = class extends KarmaFieldsAlpha.field.table {

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
