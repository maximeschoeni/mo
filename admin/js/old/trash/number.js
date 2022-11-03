KarmaFieldsAlpha.fields.numberField = class extends KarmaFieldsAlpha.fields.field {

  getEmpty() {
    return 0;
  }
  convert(value) {
    return value && Number(value) || 0;
  }

}
