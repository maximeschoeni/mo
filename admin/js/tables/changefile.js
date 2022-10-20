KarmaFieldsAlpha.field.layout.changeFile = class extends KarmaFieldsAlpha.field.layout.upload {

  constructor(resource) {
    super({
      action: "change-file",
      ...resource
    });
  }

}
