
KarmaFieldsAlpha.field.input = class extends KarmaFieldsAlpha.field.input {

  getKey() {
    let key = super.getKey();
    const language = KarmaFieldsAlpha.Nav.get("language");
    if (this.resource.translatable && language) {
      key += "-"+language;
    }
    return key;
  }

  getLabel() {
    let label = super.getLabel();
    const language = KarmaFieldsAlpha.Nav.get("language");
    if (this.resource.translatable && language) {
      label += ` (${language.toUpperCase()})`;
    }
    return label;
  }

  async getPlaceholder() {
    const language = KarmaFieldsAlpha.Nav.get("language");
    if (this.resource.translatable && this.resource.language_inheritance !== false && language) {
      const key = super.getKey();
      const response = await this.parent.request("get", {}, key);
      const value = KarmaFieldsAlpha.Type.toString(response);
      if (value) {
        return value;
      }
    }
    return super.getPlaceholder();
  }

}
