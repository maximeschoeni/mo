KarmaFieldsAlpha.field.changeFile = class extends KarmaFieldsAlpha.field.button {

  constructor(resource) {
    super({
      action: "change-file",
      ...resource
    });
  }

}
