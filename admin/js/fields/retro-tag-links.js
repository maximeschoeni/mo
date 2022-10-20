KarmaFieldsAlpha.field.retroTagLinks = class extends KarmaFieldsAlpha.field {

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

        const response = await this.parent.request("get", {}, "id");
        const id = KarmaFieldsAlpha.Type.toString(response);

        container.children = this.resource.tables.map(tableId => {
          return {
            tag: "li",
            child: {
              tag: "a",
              update: async a => {

                const key = this.resource.key;
                const table = await this.request("table", {id: tableId});

                if (!table) {
                  console.error("table not found", params.table);
                }

                const {ppp, order, orderby, ...params} = {
                  ...table.resource.params,
                  [key]: id,
                };

                const count = await table.count(params);

                a.element.innerHTML = `${tableId} (${count})`;
                a.element.href = `#${KarmaFieldsAlpha.Params.stringify({...KarmaFieldsAlpha.Params.parse(location.hash.slice(1)), table: tableId, [key]: id})}`;
                a.element.onclick = async event => {
                  const currentId = KarmaFieldsAlpha.Nav.get(key);
                  const currentTable = KarmaFieldsAlpha.Nav.get("table");
                  if (currentId !== id || currentTable !== tableId) {
                    container.element.classList.add("loading");
                    KarmaFieldsAlpha.History.save();
                    KarmaFieldsAlpha.Nav.change(tableId, currentTable, "table");
                    KarmaFieldsAlpha.Nav.change(id, currentId, key);
                    await this.parent.request("load");
                    await this.parent.request("render");
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

}
