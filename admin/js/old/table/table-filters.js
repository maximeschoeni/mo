
KarmaFieldsAlpha.fields.filterForm = class extends KarmaFieldsAlpha.fields.formBasic {

  fetchValue(expectedType, key) {
    return [KarmaFieldsAlpha.Nav.getParam(key) || ""];
  }

  getValue(expectedType, key) {
    console.error("depreacted");
    return KarmaFieldsAlpha.Nav.getParam(key) || "";
  }

  setValue(deprec, value, key) {
    if (value && value[0]) {
      KarmaFieldsAlpha.Nav.setParam(key, value[0]);
    } else  {
      KarmaFieldsAlpha.Nav.removeParam(key);
    }
  }

  removeValue(key) {
    KarmaFieldsAlpha.Nav.removeParam(key);
  }

  isModified() {
    return false;
  };

  submit() {
    KarmaFieldsAlpha.Nav.setParam("page", 1);
    return this.editParam();
  }

  edit() {
    KarmaFieldsAlpha.Nav.setParam("page", 1);

    return this.editParam();
  }

  backup() {
    KarmaFieldsAlpha.Nav.backup();
  }

  // this.filters.getDriver = () => { // for fetching options (dropdown)
  //   return this.resource.driver;
  // }

  write() {
    // noop
  }

}
