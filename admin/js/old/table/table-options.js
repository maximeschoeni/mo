

// KarmaFieldsAlpha.fields.table.optionElement = class extends KarmaFieldsAlpha.fields.table.element {
//
//   constructor(table) {
//
//     this.table = table;
//
//   }
//
//   createForm(content) {
//
//     this.form ||= new KarmaFieldsAlpha.fields.form.options({
//       children: [
//         {
//           type: "input",
//           key: "ppp",
//           label: "Items number",
//           input: {type: "number", style: "max-width:5em;"}
//           // style: "min-width:9em;flex-grow:0"
//         },
//         {
//           key: "columns",
//           type: "checkboxes",
//           label: "Display columns",
//           options: content.resource.columns.map((column, index) => {
//             return {
//               key: index.toString(),
//               name: column.title
//             }
//           })
//         },
//         {
//           type: "group",
//           display: "flex",
//           children: [
//             {
//               type: "submit",
//               style: "min-width:0",
//               value: "save",
//               title: "Save"
//             },
//             {
//               type: "button",
//               style: "min-width:0;",
//               title: "Close"
//             }
//           ]
//         }
//
//       ]
//     });
//
//     return this.form;
//
// 	}
//
//
//   build(content) {
//     return {
//       class: "karma-field-frame final",
//       child: this.getForm(content).build()
//     };
//   }
//
// }

KarmaFieldsAlpha.fields.optionsForm = class extends KarmaFieldsAlpha.fields.formBasic {

  constructor(...path) {
    super(...path);


    this.buffer = new KarmaFieldsAlpha.DeltaNEW(this.resource.driver);

  }

  async fetchValue(deprec, key) {

    if (key === "ppp") {

      return this.delta.get(key) || this.getCurrentItem();

    } else if (key === "columns") {

      return this.delta.get(key) || this.getCurrentColumns();

    }

  }

  getCurrentItem() {
    const ppp = KarmaFieldsAlpha.Nav.hasParam("ppp") && [KarmaFieldsAlpha.Nav.getParam("ppp")];
    return ppp || this.buffer.get("ppp") || [this.resource.ppp.toString()];
  }

  getCurrentColumns() {
    return this.buffer.get( "columns") || this.resource.columns || [];
  }

  isItemsModified(key) {
    // let value = this.buffer.get("ppp");
    // let current = this.getCurrentItem();
    //
    // return value && value.toString() !== current.toString() || false;


    return this.delta.has("ppp") && this.delta.get("ppp").toString() !== this.getCurrentItem().toString();
  }

  isColumnsModified(key) {
    // let value = this.buffer.get("columns");
    // let current = this.getCurrentColumns();
    //
    // return value && !KarmaFieldsAlpha.DeepObject.equal(value, current) || false;


    return this.delta.has("columns") && !KarmaFieldsAlpha.DeepObject.equal(this.delta.get("columns"), this.getCurrentColumns());
  }

  isModified(key) {

    if (key === "ppp") {

      return this.isItemsModified(key);

    } else if (key === "columns") {

      return this.isColumnsModified(key);

    } else {

      return this.isItemsModified(key) || this.isColumnsModified(key);

    }

  }

  async submit(value) {

    if (value === "save") {

      const ppp = this.delta.get("ppp");
      const columns = this.delta.get("columns");

      if (ppp) {

        this.buffer.set(ppp, "ppp");

      }

      if (columns) {

        this.buffer.set(columns, "columns");

      }

      if (KarmaFieldsAlpha.Nav.hasParam("ppp") && KarmaFieldsAlpha.Nav.getParam("ppp") !== ppp) {

        KarmaFieldsAlpha.Nav.setParam("ppp", ppp);

      }

      this.delta.empty();


    } else {

      this.open = false;


    }

    this.parent.render(true);

	}


  getContent() {

    return this.content ||= this.createChild({
      type: "group",
      children: [
        {
          type: "input",
          key: "ppp",
          label: "Items number",
          input: {type: "number", style: "max-width:5em;"}
          // style: "min-width:9em;flex-grow:0"
        },
        {
          key: "columns",
          type: "checkboxes",
          label: "Display columns",
          options: this.parent.resource.columns.map((column, index) => {
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
              value: "save",
              title: "Save"
            },
            {
              type: "button",
              style: "min-width:0;",
              title: "Close"
            }
          ]
        }

      ]
    });

	}


  build() {
    return {
      class: "karma-field-frame final",
      child: this.getContent().build()
    };
  }


}



// KarmaFieldsAlpha.fields.table.options = class extends KarmaFieldsAlpha.fields.formBasic {
//
//   constructor(...path) {
//     super(...path);
//
//
//     this.buffer = new KarmaFieldsAlpha.DeepObject();
//
//   }
//
//   fetchValue(deprec, key) {
//
//     if (key === "ppp") {
//
//       return this.buffer.get(key) || this.getCurrentItem();
//
//     } else if (key === "columns") {
//
//       return this.buffer.get(key) || this.getCurrentColumns();
//
//     }
//
//   }
//
//   setValue(deprec, value, key) {
//
//     this.buffer.set(value, key);
//
//   }
//
//   getCurrentItem() {
//     const ppp = KarmaFieldsAlpha.Nav.hasParam("ppp") && [KarmaFieldsAlpha.Nav.getParam("ppp")];
//     return ppp || super.fetchValue(null, "ppp") || [this.parent.resource.ppp.toString()] || ["10"];
//   }
//
//   getCurrentColumns() {
//     return super.fetchValue(null, "columns") || this.parent.resource.columns.map((column, index) => index.toString());
//   }
//
//   isItemsModified(key) {
//     // let value = this.buffer.get("ppp");
//     // let current = this.getCurrentItem();
//     //
//     // return value && value.toString() !== current.toString() || false;
//
//
//     return this.buffer.has("ppp") && this.buffer.get("ppp").toString() !== this.getCurrentItem().toString();
//   }
//
//   isColumnsModified(key) {
//     // let value = this.buffer.get("columns");
//     // let current = this.getCurrentColumns();
//     //
//     // return value && !KarmaFieldsAlpha.DeepObject.equal(value, current) || false;
//
//
//     return this.buffer.has("columns") && !KarmaFieldsAlpha.DeepObject.equal(this.buffer.get("columns"), this.getCurrentColumns());
//   }
//
//   isModified(key) {
//
//     if (key === "ppp") {
//
//       return this.isItemsModified(key);
//
//     } else if (key === "columns") {
//
//       return this.isColumnsModified(key);
//
//     } else {
//
//       return this.isItemsModified(key) || this.isColumnsModified(key);
//
//     }
//
//   }
//
//   async submit(value) {
//
//     if (value === "save") {
//
//       const ppp = this.buffer.get("ppp");
//       const columns = this.buffer.get("columns");
//
//       if (ppp) {
//
//         super.setValue(null, ppp, "ppp");
//
//       }
//
//       if (columns) {
//
//         super.setValue(null, columns, "columns");
//
//       }
//
//       if (KarmaFieldsAlpha.Nav.hasParam("ppp") && KarmaFieldsAlpha.Nav.getParam("ppp") !== ppp) {
//
//         KarmaFieldsAlpha.Nav.setParam("ppp", ppp);
//
//       }
//
//       this.buffer.empty();
//
//
//     } else {
//
//       this.open = false;
//
//
//     }
//
//     this.parent.render(true);
//
//
// 	}
//
//
//   getContent() {
//
//     return this.content ||= this.createChild({
//       type: "group",
//       children: [
//         {
//           type: "input",
//           key: "ppp",
//           label: "Items number",
//           input: {type: "number", style: "max-width:5em;"}
//           // style: "min-width:9em;flex-grow:0"
//         },
//         {
//           key: "columns",
//           type: "checkboxes",
//           label: "Display columns",
//           options: this.parent.resource.columns.map((column, index) => {
//             return {
//               key: index.toString(),
//               name: column.title
//             }
//           })
//         },
//         {
//           type: "group",
//           display: "flex",
//           children: [
//             {
//               type: "submit",
//               style: "min-width:0",
//               value: "save",
//               title: "Save"
//             },
//             {
//               type: "button",
//               style: "min-width:0;",
//               title: "Close"
//             }
//           ]
//         }
//
//       ]
//     });
//
// 	}
//
//
//   build() {
//     return {
//       class: "karma-field-frame final",
//       child: this.getContent().build()
//     };
//   }
//
//
// }
