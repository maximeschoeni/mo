
KarmaFieldsAlpha.field.collection.row = class extends KarmaFieldsAlpha.field {

  async request(subject, content, ...path) {

    switch (subject) {

      case "index":
        return this.resource.index;

      default:
        return super.request(subject, content, this.getKey(), ...path);
    }

  }

  getKeys() {

    let keys = new Set();

    for (let resource of this.resource.children) {

      keys = new Set([...keys, ...this.createChild(resource).getKeys()]);

    }

    return keys;
  }

  async getDefault() {

    let defaults = {};

    for (let index in this.resource.children) {

      const child = this.createChild(this.resource.children[index]);

      defaults = {
        ...defaults,
        ...await child.getDefault()
      };

    }

    return defaults;
  }

  async export(keys = []) {

    let object = {};

    for (let resource of this.resource.children) {

      const child = this.createChild(resource);

      object = {
        ...object,
        ...await child.export(keys)
      };

    }

    return object;
  }

  async import(object) {

    for (let resource of this.resource.children) {

      const child = this.createChild(resource);

      await child.import(object);

    }

  }



  static handle = class extends KarmaFieldsAlpha.field {

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
          node.element.innerHTML = await this.parse(this.resource.value);
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
