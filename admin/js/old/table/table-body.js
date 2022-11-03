
KarmaFieldsAlpha.fields.table.body = class extends KarmaFieldsAlpha.fields.table.element {

  build(content) {
    return {
      class: "table-main",
      children: [
        {
          class: "table-header",
          update: header => {
            header.children = (content.resource.header || ["title", "total", "settings", "pagination", "close"]).map(resource => this.getElement(resource).build(content))
          }
        },
        {
          class: "table-body karma-field-table-columns",
          children: [
            {
              class: "karma-field-table-column grid-column",
              children: [
                this.getElement("filter").build(content),
                ...content.resource.subsections.map(subsection => {
                  return {
              			class: "karma-field-table-section karma-field-frame final",
                    child: this.getElement(subsection).build(content)
              		};
                }),
                content.build()
              ]
            },
            {
              class: "karma-field-table-column options-column",
              update: column => {
                column.element.classList.toggle("hidden", !this.options.open);
                column.children = this.options.open && [
                  this.options.build()
                ] || [];
              }
            }
          ]

        }

      ]

    };
  }

}
