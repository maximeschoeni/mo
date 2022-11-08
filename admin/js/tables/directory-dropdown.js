KarmaFieldsAlpha.field.layout.directoryDropdown = class extends KarmaFieldsAlpha.field.dropdown {

  async getAncestors() {

    let parent = KarmaFieldsAlpha.Nav.get("parent");
    const ancestors = [];

    while (parent && parent != "0") {

      let media = await this.parent.request("queryid", {id: parent});
      // let media = await mediaTable.interface.get(parent);

      if (media) {

        ancestors.unshift({
          id: parent,
          name: media.name || ""
          // active: id === parent
        });

        parent = media.parent;

      } else {

        parent = null;

      }


    }

    return ancestors;
  }

  async fetchOptions() {

    const options = this.resource.options || [
      {
        id: "",
        name: "–"
      },
      {
        id: "0",
        name: "Uploads"
      }
    ];


    const ancestors = await this.getAncestors();

    return [...options, ...ancestors];

  }

}
