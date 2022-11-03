
KarmaFieldsAlpha.field.form.content = class extends KarmaFieldsAlpha.field.form {

  build() {

    return {
      class: "karma-field-table-grid-container",
      child: this.createChild({
        type: "group",
        key: this.resource.id,
        children: this.resource.children
      }).build()
    }

  }

}
