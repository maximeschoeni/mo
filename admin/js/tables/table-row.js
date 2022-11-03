
KarmaFieldsAlpha.field.layout.table.row = class extends KarmaFieldsAlpha.field.container {

  async request(subject, content, ...path) {

    switch (subject) {

      case "index":
        return this.resource.index;

      default:
        return this.parent.request(subject, content, this.resource.key, ...path);
    }

  }

  // async export(keys = []) {
  //
	// 	const object = await super.export(keys);
  //
	// 	object.id = this.resource.key;
  //
	// 	return object;
	// }

  // getKeys() {
  //
  //   let keys = new Set();
  //
  //   for (let resource of this.resource.children) {
  //
  //     keys = new Set([...keys, ...this.createChild(resource).getKeys()]);
  //
  //   }
  //
  //   return keys;
  // }
  //
  // async getDefault() {
  //
  //   let defaults = {};
  //
  //   if (this.resource.children) {
  //
  //     for (let index in this.resource.children) {
  //
  //       const child = this.createChild(this.resource.children[index]);
  //
  //       defaults = {
  //         ...defaults,
  //         ...await child.getDefault()
  //       };
  //
  //     }
  //
  //   }
  //
  //   return defaults;
  // }
  //
  // async export(keys = []) {
  //
  //   let object = {};
  //
  //   if (this.resource.children) {
  //
  //     for (let resource of this.resource.children) {
  //
  //       const child = this.createChild(resource);
  //
  //       object = {
  //         ...object,
  //         ...await child.export(keys)
  //       };
  //
  //     }
  //
  //   }
  //
  //   return object;
  // }
  //
  // async import(object) {
  //
  //   if (this.resource.children) {
  //
  //     for (let resource of this.resource.children) {
  //
  //       const child = this.createChild(resource);
  //
  //       await child.import(object);
  //
  //     }
  //
  //   }
  //
  // }



  static handle = class extends KarmaFieldsAlpha.field.text {

    constructor(resource) {
      super({
        selectMode: "row",
        ...resource
      });

    }

    build() {
      return {
        tag: this.resource.tag,
        class: "text karma-field modal-btn",
        update: async node => {
          // node.element.innerHTML = await this.parse(this.resource.value);
          node.element.innerHTML = await this.getContent();
        }
      };
    }

  }

  static modalHandle = class extends this.handle {}; // -> compat

  static tableIndex = class extends this.handle {

    constructor(resource) {
      super({
        width: "40px",
        selectMode: "row",
        ...resource
      });

    }

    build() {
      return {
        class: "karma-field text",
        update: async container => {
          container.element.textContent = await this.parent.request("index");
        }
      };
    }

  }

}
