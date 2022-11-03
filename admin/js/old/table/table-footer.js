
KarmaFieldsAlpha.fields.table.footer = class extends KarmaFieldsAlpha.fields.table.element {

  build(content) {
    return {
      class: "table-control",
      update: footer => {
        this.render = footer.render;
        footer.element.classList.toggle("hidden", content.resource.controls === false);

        // compat
        if (content.resource.controls && content.resource.controls instanceof Array) {
          content.resource.controls.left = content.resource.controls;
        }

        if (content.resource.controls !== false) {
          footer.children = [
            // this.buildControls(),
            {
              class: "table-control-group table-edit",
              children: (content.resource.controls && content.resource.controls.left || ["save", "add", "delete"]).map(resource => {
                return this.getElement(resource).build(content);
              })
            },
            {
              class: "table-control-group table-control-right",
              children: (content.resource.controls && content.resource.controls.right || ['undo', 'redo']).map(resource => {
                return this.getElement(resource).build(content);
              })
            }
          ];
        }
      }
    };
  }

}
