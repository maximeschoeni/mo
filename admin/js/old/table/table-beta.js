

KarmaFieldsAlpha.tables = {};

KarmaFieldsAlpha.fields.table = {

  constructor(resource, parent, form) {

    // window.karma_table = this; // -> debug
    KarmaFieldsAlpha.tables[resource.driver] = this;

    this.subsections = [];

    // filters
    if (resource.filters) {

      this.filters = new KarmaFieldsAlpha.fields.table.tableFilters({
        driver: resource.driver, // ->  for fetching options (dropdown)
        ...resource.filters
      }, this);

      this.subsections.push(this.filters);
    }

    this.content = new KarmaFieldsAlpha.fields.table.grid({
      driver: resource.driver,
      autosave: resource.autosave
    }, this);

    this.content.table = this;


    this.options = new KarmaFieldsAlpha.fields.table.options({
      driver: resource.driver+"-options"
    }, this);

    this.options.open = true;

    if (this.resource.subsections) {
      const subsections = this.resource.subsections.map(resource => this.createChild(resource));
      this.subsections = this.subsections.concat(subsections);
    }

  }

  // getPage() {
  //   const page = KarmaFieldsAlpha.Nav.getParam("page");
  //   return Number(page) || 1;
  // }
  //
  // getPpp() {
  //   // return Number(KarmaFieldsAlpha.History.getParam("ppp")) || this.getDefaultPpp();
  //   return Number(KarmaFieldsAlpha.Nav.getParam("ppp") || this.options.getValue("ppp") || this.getDefaultPpp());
  // }
  // setPpp(ppp) {
  //   this.options.setValue(null, [ppp], "ppp");
  // }
  //
  // getDefaultPpp() {
  //   return this.resource.ppp || "20";
  // }

  getDefaultOrderby() {
    if (!this.defaultOrderby) {
      this.defaultOrderby = this.resource.orderby;
      if (!this.defaultOrderby) {
        const column = this.resource.columns.find(column => (column.orderby || column.field && column.field.key));
        this.defaultOrderby = column && (column.orderby || column.field && column.field.key) || "x";
      }
    }
    return this.defaultOrderby;
  }

  getDefaultOrder() {
    if (!this.defaultOrder) {
      const column = this.resource.orderby && this.resource.columns.find(column => (column.orderby || column.field && column.field.key) === this.resource.orderby);
      this.defaultOrder = column && column.order || "asc";
    }
    return this.defaultOrder;
  }




  getParamString() {

    const params = new URLSearchParams(KarmaFieldsAlpha.Nav.params);

    if (!params.has("page")) {
      params.set("page", "1");
    }

    if (!params.has("ppp")) {
      params.set("ppp", this.getPpp());
    }

    if (!params.has("orderby")) {
      const orderby = this.getDefaultOrderby();
      if (orderby) {
        params.set("orderby", orderby);
      }
    }

    if (!params.has("order")) {
      const order = this.getDefaultOrder(params.get("orderby"));
      if (order) {
        params.set("order", order);
      }
    }

    params.sort();

    return params.toString();
  }

  getRow(id) {
    return this.content.getChild(id) || this.content.createChild({
      type: "tableRow",
      key: id,
      columns: this.resource.columns
    });
    // row.create(this.resource.columns || []);
  }

  async getCount() {
    const results = await this.content.getRemoteTable();
    return Number(results && results.count || 0);
  }

  getModalColumn() {
    return this.resource.columns.find(column => column.field && column.field.type === "modal");
  }

  getModalField(id) {
    // const rowField = this.getRow(id);

    // const rowField = this.content.getChild(id);

    const rowField = this.getRow(id);

    // console.log(id);

    return rowField && rowField.children.find(child => child.resource.type === "modal");
  }



  buildSubsections() {
    return this.subsections.map(field => {
      return {
  			class: "karma-field-table-section karma-field-frame final",
        child: field.build()
  		};
    });
  }

  getButton(resource) {

    if (typeof resource === "string") {
      resource = {type: resource};
    }

    if (!resource.type || !KarmaFieldsAlpha.fields.table[resource.type]) {
      console.error("Table error: button ["+resource.type+"] does not exist");
    }

    if (!this.buttons) {
      this.buttons = {};
    }

    if (!this.buttons[resource.type]) {
      this.buttons[resource.type] = new KarmaFieldsAlpha.fields.table[resource.type]();
      this.buttons[resource.type].parent = this;
      this.buttons[resource.type].table = this;
      this.buttons[resource.type].resource = resource;
    }

    return this.buttons[resource.type];
  }

  build() {

    return {
      class: "karma-field-table",
      init: table => {
      },
      children: [
        {
          class: "table-view",
          children: [
            this.getElement("modal").build(content)
            {
              class: "table-main",
              children: [
                {
                  class: "table-header",
                  init: header => {
                    this.renderHeader = header.render;
                  },
                  update: (header) => {
                    header.children = (this.resource.header || ["title", "total", "settings", "pagination", "close"]).map(resource => this.getButton(resource).build())
                  }
                },
                {
                  class: "table-body karma-field-table-columns",
                  init: body => {
                    this.renderBody = body.render;
                  },
                  children: [
                    {
                      class: "karma-field-table-column grid-column",
                      children: [
                        ...this.buildSubsections(),
                        this.content.build()
                      ]
                    },
                    {
                      class: "karma-field-table-column options-column",
                      update: column => {
                        column.element.classList.toggle("hidden", !this.options.open);
                        column.children = this.options.open && [
                          this.options.build()
                        ] || [];
                      },
                      child: {
                        class: "karma-field-frame final",
                        init: frame => {
                          frame.element.textContent = "Options"
                        }
                      }
                    }
                  ]

                }

              ]

            }
          ]
        },
        this.getElement("footer").build(content)

        // {
        //   class: "table-control",
        //   update: footer => {
        //     this.renderFooter = footer.render;
        //     footer.element.classList.toggle("hidden", this.resource.controls === false);
        //
        //     // compat
        //     if (this.resource.controls && this.resource.controls instanceof Array) {
        //       this.resource.controls.left = this.resource.controls;
        //     }
        //
        //     if (this.resource.controls !== false) {
        //       footer.children = [
        //         // this.buildControls(),
        //         {
        //           class: "table-control-group table-edit",
        //           children: (this.resource.controls && this.resource.controls.left || ["save", "add", "delete"]).map(resource => {
        //             return this.getButton(resource).build();
        //           })
        //         },
        //         {
        //           class: "table-control-group table-control-right",
        //           children: (this.resource.controls && this.resource.controls.right || ['undo', 'redo']).map(resource => {
        //             return this.getButton(resource).build();
        //           })
        //         }
        //       ];
        //     }
        //   }
        // }
      ],
      update: async container => {
        // await this.update();
        this.render = container.render;

        this.content.tablePromise = null;
        this.content.relationPromise = null;
      }
    };
  }



}
