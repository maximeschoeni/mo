
KarmaFieldsAlpha.field.navigation = class extends KarmaFieldsAlpha.field.group {

  static menu = class extends KarmaFieldsAlpha.field {

    getItems() {
      return this.resource.items || this.resource.children || [];
    }

    build() {
      return {
        tag: "ul",
        children: this.getItems().map(item => {
          return {
            tag: "li",
            children: [
              {
                tag: "a",
                init: li => {
                  li.element.innerHTML = item.title;
                  li.element.href = "#"+item.hash;
                }
              },
              this.createChild({
                items: item.items || item.children || [],
                type: "menu"
              }).build()
            ],
            update: li => {
              this.active = location.hash.slice(1) === item.hash;
              li.element.classList.toggle("active", this.active);
            },
            complete: li => {
              this.current = this.children.some(child => child.active || child.current);
              // this.active = this.resource.children.some((child, index) => this.getChild(index).active);
              li.element.classList.toggle("current", this.current);
            }
          };
        })
      }
    }
  }

}
