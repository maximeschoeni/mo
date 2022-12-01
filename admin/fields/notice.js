
KarmaFieldsAlpha.field.notice = class extends KarmaFieldsAlpha.field {

  build() {

    return {
      class: "notice",
      update: async notice => {
        notice.element.innerHTML = await this.parent.request("notice", {key: this.resource.key}) || "";
      }
    };

  }

}
