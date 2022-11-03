

KarmaFieldsAlpha.fields.tableOptions = class extends KarmaFieldsAlpha.fields.field {

  constructor(...path) {
    super(...path);


    this.buffer = new KarmaFieldsAlpha.DeltaNEW(this.resource.driver, "options");

    this.child = this.createChild({
      type: "form",
      children: [
        {
          type: "input",
          key: "ppp",
          label: "Items number",
          input: {type: "number", style: "max-width:5em;"}
        },
        {
          key: "columns",
          type: "checkboxes",
          label: "Display columns",
          options: this.resource.columns.map((column, index) => {
            return {
              key: index.toString(),
              name: column.title
            }
          })
        },
        {
          type: "group",
          display: "flex",
          children: [
            {
              type: "submit",
              style: "min-width:0",
              value: "submit",
              title: "Save"
            },
            {
              type: "button",
              style: "min-width:0;",
              value: "closeoptions",
              title: "Close"
            }
          ]
        }

      ]
    });

  }

  async edit(value) {

    if (value === "closeoptions") {

      this.open = false;

    }

    super.edit("editoptions");

  }

  async save(delta) {

    this.buffer.merge(delta);

    if (delta.ppp && KarmaFieldsAlpha.Nav.hasParam("ppp") && KarmaFieldsAlpha.Nav.getParam("ppp") !== delta.ppp) {

      KarmaFieldsAlpha.Nav.setParam("ppp", delta.ppp.toString());
      // this.setValue(null, ppp, "ppp");

    }

    super.edit("option");

  }

  async fetchValue(deprec, key) {

    // if (key === "ppp") {
    //
    //   return KarmaFieldsAlpha.Nav.hasParam("ppp") && [KarmaFieldsAlpha.Nav.getParam("ppp")] || this.buffer.get("ppp") || super.fetchValue(null, key);
    //
    // }

    return this.buffer.get(key) || super.fetchValue(null, key);

  }

  getValue(key) {

    return this.buffer.get(key) || super.getValue(null, key);

  }

  build() {
    return this.child.build();
  }


}
