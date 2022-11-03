KarmaFieldsAlpha.field.layout.table = class extends KarmaFieldsAlpha.field.form {

  constructor(resource) {
    super(resource);

    // this.idsBuffer = new KarmaFieldsAlpha.Buffer("state", this.resource.id || this.resource.driver, "ids");
    this.idsBuffer = new KarmaFieldsAlpha.Buffer("state", "ids");


  }

  // async loadParams(params) {
  //
  //   const queryParams = {
  //     page: 1,
  //     ppp: 1,
  //     // id: params.id,
  //     // order: params.order,
  //     // orderby: params.orderby,
  //     ...this.resource.params,
  //     ...params
  //   };
  //
  //   const ids = this.idsBuffer.get() || [];
  //
  //   const results = await this.query(queryParams);
  //   const newIds = results.map(item => item.id);
  //
  //   this.idsBuffer.change(newIds, ids);
  //
  //
  // }

  async queryParams(params) {

    return this.query({
      page: 1,
      ppp: 1,
      ...this.resource.params,
      ...params
    });

  }

  async load() {

    const ids = this.idsBuffer.get() || [];
    const params = this.getParams();

    const results = await this.query(params);
    const newIds = results.map(item => item.id);

    this.idsBuffer.change(newIds, ids);
  }

  unload() {
    console.error("deprecated")
    this.idsBuffer.change(null);
  }

  getParams() {

    const params = KarmaFieldsAlpha.Nav.get();

    return {
      page: 1,
      ppp: 1,
      id: params.id,
      order: params.order,
      orderby: params.orderby,
      ...this.resource.params
    };

  }

  getIds() {
    return this.idsBuffer.get() || [];
  }

  async request(subject, content, ...path) {

    switch (subject) {

      case "edit":
        return this.parent.request("render-controls");

      default:
        return super.request(subject, content, ...path);

    }

  }

  build() {

    return {
      class: "karma-field-table-grid-container",
      child: this.createChild({
        type: "row",
        key: this.getParams().id,
        children: this.resource.children
      }).build()
    }

  }

}
