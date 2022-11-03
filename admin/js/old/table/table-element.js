
KarmaFieldsAlpha.fields.table.element = {

  constructor() {

    this.elements = {};

  }

  getElement(resource) {

    if (typeof resource === "string") {
      resource = {type: resource};
    }

    if (!resource.type || !KarmaFieldsAlpha.fields.table[resource.type]) {
      console.error("Table error: button ["+resource.type+"] does not exist");
    }

    this.elements[resource.type] =|| new KarmaFieldsAlpha.fields.table[resource.type](resource);

    return this.elements[resource.type];
  }

}
