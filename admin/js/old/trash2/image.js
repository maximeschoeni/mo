KarmaFieldsAlpha.fields.image = class extends KarmaFieldsAlpha.fields.file {

  buildContent(value) {
    const field = this;
    return [
      {
        tag: "a",
        class: "image-frame",
        update: function(frame) {
          this.element.onclick = function(event) {
            event.preventDefault();
            if (!field.resource.readonly) {
              field.uploader.open();
            }
          };
        },
        children: [
          {
            class: "image-container",
            update: function() {
              if (Number(value)) {
                const file = field.getFile(value);
                this.children = [{
                  tag: "img",
                  update: function() {
                    this.element.src = file.src;
                    this.element.width = file.width;
                    this.element.height = file.height;
                  }
                }];
                this.element.classList.toggle("type-image", file && file.type && file.type.startsWith("image") || false);
              } else {
                this.children = [];
              }
            }
          },
          {
            class: "button-container",
            update: function() {
              if (Number(value)) {
                this.children = [];
              } else if (!field.resource.readonly) {
                this.children = [{
                  class: "add",
                  update: function() {
                    this.element.textContent = "Add file";
                  }
                }];
              }
            }
          }
          // ,
          // {
          //   class: "karma-field-spinner"
          // }
        ]
      },
      {
        class: "field-control",
        update: function() {
          if (Number(value)) {
            this.children = [{
              tag: "button",
              class: "delete button",
              update: function() {
                this.element.textContent = "Remove";
                this.element.onclick = (event) => {
                  event.preventDefault();
                  field.backup();
                  field.setValue("");
                  field.render();
                };
              }
            }];
          } else {
            this.children = [];
          }
        }
      }
    ];
  }

  build() {
    return {
			class: "karma-file karma-field",
			init: container => {
        container.element.setAttribute('tabindex', '-1');
        this.init(container.element);
        this.render = container.render;
			},
			update: async container => {
        container.element.classList.add("loading");
        const value = await this.update();
        container.children = this.buildContent(value);
        container.element.classList.toggle("modified", this.modified);
			},
      complete: container => {
        container.element.classList.remove("loading");
      }
		};

  }

}
