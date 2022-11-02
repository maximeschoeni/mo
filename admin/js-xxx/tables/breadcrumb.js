KarmaFieldsAlpha.field.layout.breadcrumb = class extends KarmaFieldsAlpha.field.layout.directoryDropdown {

  build() {
    return {
      class: "karma-breadcrumb",
      tag: "ul",
      update: async ul => {

        const ancestors = await this.getAncestors();

        ul.children = [{
          id: "0",
          name: "Uploads",
          active: ancestors.length === 0
        }, ...ancestors].map((item, index, array) => {
          return {
            tag: "li",
            child: {
              tag: "a",
              update: a => {
                a.element.classList.toggle("active", index === array.length - 1);
                a.element.innerHTML = item.name || "no name";
                a.element.onclick = async event => {

                  const id = KarmaFieldsAlpha.Nav.get("parent");

                  if (!item.active && id !== item.id) {
                    KarmaFieldsAlpha.History.save();
                    KarmaFieldsAlpha.Nav.change(item.id, id, this.resource.key);

                    // await this.dispatch({
                    //   action: "query-ids"
                    // });
                    //
                    // await this.dispatch({
                    //   action: "render"
                    // });

                    await this.parent.request("query-ids");
                    await this.parent.request("render");

                  }

                }
              }
            }
          };
        });

      }
    }
  }

}
