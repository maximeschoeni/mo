KarmaFieldsAlpha.field.tagLinks = class extends KarmaFieldsAlpha.field {


  build() {

    return {
      tag: "ul",
			class: "text tag-links karma-field",
			init: container => {
				if (this.resource.classes) {
					container.element.classList.add(...this.resource.classes);
				}
				container.element.tabIndex = -1;
			},
			update: async container => {
        container.element.classList.add("loading");

        const key = this.getKey();
        const state = await this.parent.request("state", {}, key);
        const ids = KarmaFieldsAlpha.Type.toArray(state.value).map(id => id.toString());
        const table = await this.request("table", {id: this.resource.table});

        if (!table) {
          console.error("table not found", this.resource.table);
        }

        const {ppp, ...params} = {
          ...table.resource.params,
          ...this.resource.params,
        };

        await table.query(params);

        container.children = ids.map(id => {
          return {
            tag: "li",
            child: {
              tag: "a",
              update: async a => {
                a.element.innerHTML = await table.getValue(id, this.resource.nameField || "name");
                // const params = KarmaFieldsAlpha.Params.parse(location.hash.slice(1));
                // const paramString = KarmaFieldsAlpha.Params.stringify({...params, [key]: id});
                // a.element.href = `#${paramString}`;
                a.element.href = `#${KarmaFieldsAlpha.Params.stringify({...KarmaFieldsAlpha.Params.parse(location.hash.slice(1)), [key]: id})}`;
                a.element.onclick = async event => {
                  const currentId = KarmaFieldsAlpha.Nav.get(key);
                  // const currentTable = KarmaFieldsAlpha.Nav.get("table");
                  if (currentId !== id) {
                    container.element.classList.add("loading");
                    KarmaFieldsAlpha.History.save();
                    // KarmaFieldsAlpha.Nav.change(this.resource.table, currentTable, "table");
                    KarmaFieldsAlpha.Nav.change(id, currentId, key);
                    await this.parent.request("load");
                    await this.parent.request("render");
                    // container.element.classList.remove("editing");
                  }
                }
              }
            }
          };
        });
      },
      complete: container => {
        container.element.classList.remove("loading");
      }
    };
  }


  // async export(keys = []) {
  //   const object = {};
	// 	const key = this.getKey();
  //
  //
  //   const response = await this.parent.request("get", {}, key);
  //   const ids = KarmaFieldsAlpha.Type.toArray(response);
  //
  //   object[key] = ids.join(",");
  //
  //
  //   return object;
	// }

	// async import(object) {
  //
  //   const key = this.getKey();
  //
  //   if (object[key] !== undefined) {
  //
  //     let ids = [];
  //
  //     if (object[key]) {
  //
  //       ids = object[key].split(",");
  //
  //     }
  //
  //     await this.parent.request("set", {data: ids}, key);
  //
  //   }
  //
	// }



}
