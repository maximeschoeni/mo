
KarmaFieldsAlpha.fields.table.modal = class {

  build(content) {
    return {
      class: "table-modal",
      init: single => {
        this.render = single.render;
      },
      update: single => {

        single.children = [];

        if (KarmaFieldsAlpha.Nav.hasParam("id")) {

          let percentWidth = key && KarmaFieldsAlpha.Delta.get(content.resource.driver+"-options", "modalWidth") || 100;
          single.element.style.flexBasis = percentWidth+"%";

          const id = KarmaFieldsAlpha.Nav.getParam("id");
          const rowField = content.getRow(id);
          const modalField = rowField && rowField.children.find(child => child.resource.type === "modal");

          if (modalField) {

            single.children = [
              {
          			class: "karma-modal",
          			children: [
          				{
          					class: "karma-modal-header table-header",
          					children: [
                      modalField.build(),
                      {
                        class: "modal-navigation",
                        children: [
                          this.getButton("prevModal").build(),
                          this.getButton("nextModal").build(),
                          this.getButton("closeModal").build()
                        ]
                      }
          					]
          				},
          				{
          					class: "karma-modal-body karma-field-frame",
          					update: frame => {
                      frame.element.classList.toggle("final", modalField.resource.final || false);
          					},
                    child: modalField.content.build()
          				}
          			]
          		},
              {
                class: "modal-resize-handle",
                update: handle => {
                  handle.element.onmousedown = event => {
                    const mouseMove = event => {
                      const modalBox = single.element.getBoundingClientRect();
                      const viewerBox = single.element.parentNode.getBoundingClientRect();
                      const ratioWidth = (event.clientX - viewerBox.left)/viewerBox.width;
                      percentWidth = Math.min(100, 100*ratioWidth);
                      single.element.style.flexBasis = percentWidth+"%";
                      this.options.setValue(null, percentWidth, "modalWidth")
                    }
                    const mouseUp = event => {
                      window.removeEventListener("mousemove", mouseMove);
                      window.removeEventListener("mouseup", mouseUp);
                    }
                    window.addEventListener("mousemove", mouseMove);
                    window.addEventListener("mouseup", mouseUp);
                  }
                }
              }
            ];

          }
        }
      }
    }
  }
}
